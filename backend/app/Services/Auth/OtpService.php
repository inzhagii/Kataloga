<?php

namespace App\Services\Auth;

use App\Exceptions\ApiException;
use App\Models\OtpVerification;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

final class OtpService
{
    public function issue(User $user, string $purpose): IssuedOtp
    {
        return DB::transaction(function () use ($user, $purpose): IssuedOtp {
            OtpVerification::query()
                ->where('user_id', $user->id)
                ->where('purpose', $purpose)
                ->whereNull('consumed_at')
                ->update(['consumed_at' => now()]);

            $digits = (int) config('auth.kataloga.otp.digits', 6);
            $code = str_pad(
                (string) random_int(0, (10 ** $digits) - 1),
                $digits,
                '0',
                STR_PAD_LEFT,
            );
            $expiresAt = now()->addMinutes((int) config('auth.kataloga.otp.expires_minutes', 10));

            OtpVerification::query()->create([
                'user_id' => $user->id,
                'purpose' => $purpose,
                'code_hash' => Hash::make($code),
                'expires_at' => $expiresAt,
            ]);

            return new IssuedOtp(
                $code,
                $expiresAt,
                (int) config('auth.kataloga.otp.resend_cooldown_seconds', 60),
            );
        });
    }

    public function verify(User $user, string $purpose, string $code): void
    {
        $exception = DB::transaction(function () use ($user, $purpose, $code): ?ApiException {
            /** @var OtpVerification|null $otp */
            $otp = OtpVerification::query()
                ->where('user_id', $user->id)
                ->where('purpose', $purpose)
                ->whereNull('consumed_at')
                ->latest('id')
                ->lockForUpdate()
                ->first();

            if ($otp === null) {
                return ApiException::otpInvalid();
            }

            $maxAttempts = (int) config('auth.kataloga.otp.max_attempts', 5);

            if ($otp->attempts >= $maxAttempts) {
                return ApiException::otpAttemptsExceeded();
            }

            if ($otp->expires_at->isPast()) {
                $otp->forceFill(['consumed_at' => now()])->save();

                return ApiException::otpExpired();
            }

            if (! Hash::check($code, $otp->code_hash)) {
                $otp->increment('attempts');

                return ApiException::otpInvalid();
            }

            $otp->forceFill(['consumed_at' => now()])->save();

            return null;
        });

        if ($exception !== null) {
            throw $exception;
        }
    }

    public function cooldownRemaining(User $user, string $purpose): int
    {
        /** @var OtpVerification|null $latest */
        $latest = OtpVerification::query()
            ->where('user_id', $user->id)
            ->where('purpose', $purpose)
            ->latest('id')
            ->first();

        if ($latest === null) {
            return 0;
        }

        $cooldown = (int) config('auth.kataloga.otp.resend_cooldown_seconds', 60);
        $availableAt = $latest->created_at->copy()->addSeconds($cooldown);
        $remaining = now()->diffInSeconds($availableAt, false);

        return $remaining > 0 ? (int) ceil($remaining) : 0;
    }
}

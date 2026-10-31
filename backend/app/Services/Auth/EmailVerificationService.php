<?php

namespace App\Services\Auth;

use App\Exceptions\ApiException;
use App\Models\User;

final class EmailVerificationService
{
    public const PURPOSE = 'email_verification';

    public function __construct(private OtpService $otp) {}

    public function verify(string $email, string $code): User
    {
        $user = User::query()->where('email', $email)->first();

        if ($user === null || $user->email_verified_at !== null) {
            throw ApiException::otpInvalid();
        }

        $this->otp->verify($user, self::PURPOSE, $code);

        $user->forceFill(['email_verified_at' => now()])->save();

        return $user->refresh();
    }

    /**
     * @return array{0: User, 1: IssuedOtp}
     */
    public function resend(string $email): array
    {
        $user = User::query()->where('email', $email)->first();

        if ($user === null || $user->email_verified_at !== null) {
            throw ApiException::otpInvalid();
        }

        $remaining = $this->otp->cooldownRemaining($user, self::PURPOSE);

        if ($remaining > 0) {
            throw ApiException::otpCooldown($remaining);
        }

        return [$user, $this->otp->issue($user, self::PURPOSE)];
    }
}

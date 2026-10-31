<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ResendEmailVerificationRequest;
use App\Http\Requests\Auth\VerifyEmailRequest;
use App\Http\Resources\UserResource;
use App\Notifications\EmailVerificationOtpNotification;
use App\Services\Auth\EmailVerificationService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

final class EmailVerificationController extends Controller
{
    public function __construct(private EmailVerificationService $verification) {}

    public function verify(VerifyEmailRequest $request): JsonResponse
    {
        $user = $this->verification->verify(
            $request->string('email')->toString(),
            $request->string('code')->toString(),
        );

        return ApiResponse::success(
            (new UserResource($user))->resolve(),
            'Email berhasil diverifikasi.',
        );
    }

    public function resend(ResendEmailVerificationRequest $request): JsonResponse
    {
        [$user, $otp] = $this->verification->resend(
            $request->string('email')->toString(),
        );

        $user->notify(new EmailVerificationOtpNotification(
            $otp->code,
            $otp->expiresAt,
        ));

        return ApiResponse::success([
            'expires_at' => $otp->expiresAt->toIso8601String(),
            'cooldown_seconds' => $otp->cooldownSeconds,
        ], 'Kode OTP telah dikirim ulang.');
    }
}

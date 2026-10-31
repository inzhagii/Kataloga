<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Notifications\EmailVerificationOtpNotification;
use App\Services\Auth\AuthService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

final class AuthController extends Controller
{
    public function __construct(private AuthService $auth) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->auth->register($request->validated());

        if ($result->otp !== null) {
            $result->user->notify(new EmailVerificationOtpNotification(
                $result->otp->code,
                $result->otp->expiresAt,
            ));
        }

        if ($result->channel === 'phone') {
            $this->startSession($request, $result->user);
        }

        $data = [
            'user' => (new UserResource($result->user))->resolve(),
            'requires_verification' => $result->requiresVerification,
            'identifier' => $result->identifier,
            'channel' => $result->channel,
        ];

        if ($result->otp !== null) {
            $data['expires_at'] = $result->otp->expiresAt->toIso8601String();
            $data['cooldown_seconds'] = $result->otp->cooldownSeconds;
        }

        return ApiResponse::success($data, 'Registrasi berhasil.', 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = $this->auth->authenticate(
            $request->string('email_or_phone')->toString(),
            $request->string('password')->toString(),
        );

        $this->startSession($request, $user);

        return ApiResponse::success(
            (new UserResource($user))->resolve(),
            'Login berhasil.',
        );
    }

    public function me(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        return ApiResponse::success(
            (new UserResource($user))->resolve(),
            'OK',
        );
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return ApiResponse::success(null, 'Logout berhasil.');
    }

    private function startSession(Request $request, User $user): void
    {
        Auth::guard('web')->login($user);
        $request->session()->regenerate();
    }
}

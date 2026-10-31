<?php

namespace App\Services\Auth;

use App\Enums\UserRole;
use App\Exceptions\ApiException;
use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

final class AuthService
{
    public function __construct(private OtpService $otp) {}

    public function register(array $data): RegistrationResult
    {
        $email = $data['email'] ?? null;
        $phone = $data['phone'] ?? null;

        try {
            return DB::transaction(function () use ($data, $email, $phone): RegistrationResult {
                if ($email !== null && User::query()->where('email', $email)->exists()) {
                    throw ApiException::identifierAlreadyExists();
                }

                if ($phone !== null && User::query()->where('phone', $phone)->exists()) {
                    throw ApiException::identifierAlreadyExists();
                }

                $user = User::query()->create([
                    'name' => $data['name'] ?? null,
                    'email' => $email,
                    'phone' => $phone,
                    'password' => $data['password'],
                    'role' => UserRole::Customer,
                ]);

                if ($email !== null) {
                    $otp = $this->otp->issue($user, EmailVerificationService::PURPOSE);

                    return new RegistrationResult(
                        $user,
                        true,
                        $email,
                        'email',
                        $otp,
                    );
                }

                return new RegistrationResult(
                    $user,
                    false,
                    (string) $phone,
                    'phone',
                );
            });
        } catch (UniqueConstraintViolationException) {
            throw ApiException::identifierAlreadyExists();
        }
    }

    public function authenticate(string $identifier, string $password): User
    {
        if (IdentifierNormalizer::looksLikeEmail($identifier)) {
            $email = IdentifierNormalizer::email($identifier);
            $user = $email === null
                ? null
                : User::query()->where('email', $email)->first();
        } else {
            $phone = IdentifierNormalizer::phone($identifier);
            $user = $phone === null
                ? null
                : User::query()->where('phone', $phone)->first();
        }

        if ($user === null || ! Hash::check($password, $user->password)) {
            throw ApiException::invalidCredentials();
        }

        if ($user->email !== null && $user->email_verified_at === null) {
            throw ApiException::emailUnverified();
        }

        return $user;
    }
}

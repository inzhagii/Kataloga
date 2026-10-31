<?php

namespace App\Services\Auth;

use App\Models\User;

final readonly class RegistrationResult
{
    public function __construct(
        public User $user,
        public bool $requiresVerification,
        public string $identifier,
        public string $channel,
        public ?IssuedOtp $otp = null,
    ) {}
}

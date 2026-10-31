<?php

namespace App\Services\Auth;

use Carbon\CarbonInterface;

final readonly class IssuedOtp
{
    public function __construct(
        public string $code,
        public CarbonInterface $expiresAt,
        public int $cooldownSeconds,
    ) {}
}

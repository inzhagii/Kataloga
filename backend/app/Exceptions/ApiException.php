<?php

namespace App\Exceptions;

use App\Support\ApiResponse;
use Exception;
use Illuminate\Http\JsonResponse;

final class ApiException extends Exception
{
    public function __construct(
        public readonly int $status,
        public readonly string $errorCode,
        string $message,
        public readonly array $errors = [],
        public readonly array $headers = [],
    ) {
        parent::__construct($message);
    }

    public function render(): JsonResponse
    {
        return ApiResponse::error(
            $this->getMessage(),
            $this->errors,
            $this->errorCode,
            $this->status,
            $this->headers,
        );
    }

    public static function error(
        string $message,
        array $errors = [],
        string $errorCode = 'error',
        int $status = 422,
        array $headers = [],
    ): self {
        return new self($status, $errorCode, $message, $errors, $headers);
    }

    public static function identifierAlreadyExists(): self
    {
        return new self(
            409,
            'identifier_already_exists',
            'Email atau nomor telepon sudah digunakan.',
        );
    }

    public static function invalidCredentials(): self
    {
        return new self(
            401,
            'invalid_credentials',
            'Email/nomor telepon atau password salah.',
        );
    }

    public static function emailUnverified(): self
    {
        return new self(
            403,
            'email_unverified',
            'Email belum diverifikasi.',
        );
    }

    public static function otpInvalid(): self
    {
        return new self(
            422,
            'otp_invalid',
            'Kode OTP tidak valid.',
        );
    }

    public static function otpExpired(): self
    {
        return new self(
            422,
            'otp_expired',
            'Kode OTP sudah kedaluwarsa.',
        );
    }

    public static function otpAttemptsExceeded(): self
    {
        return new self(
            429,
            'otp_attempts_exceeded',
            'Batas percobaan OTP telah tercapai.',
        );
    }

    public static function otpCooldown(int $retryAfter): self
    {
        return new self(
            429,
            'otp_cooldown',
            'Tunggu sebelum meminta kode OTP baru.',
            headers: ['Retry-After' => (string) $retryAfter],
        );
    }

    public static function adminForbidden(): self
    {
        return new self(
            403,
            'forbidden',
            'Admin tidak dapat membuat atau memiliki toko.',
        );
    }

    public static function storeAlreadyExists(): self
    {
        return new self(
            409,
            'store_already_exists',
            'Akun ini sudah memiliki toko.',
        );
    }

    public static function storeIdTaken(): self
    {
        return new self(
            409,
            'STORE_ID_TAKEN',
            'Store ID sudah digunakan.',
        );
    }

    public static function storeIdCooldown(?string $message = null): self
    {
        return new self(
            409,
            'STORE_ID_COOLDOWN',
            $message ?? 'Store ID hanya dapat diubah sekali setiap 30 hari.',
        );
    }

    public static function storeNotFound(): self
    {
        return new self(
            404,
            'store_not_found',
            'Toko tidak ditemukan.',
        );
    }
}

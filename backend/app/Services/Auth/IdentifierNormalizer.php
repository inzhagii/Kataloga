<?php

namespace App\Services\Auth;

use Illuminate\Support\Str;

final class IdentifierNormalizer
{
    public static function email(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $email = trim($value);

        return $email === '' ? null : Str::lower($email);
    }

    public static function phone(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $value = trim($value);

        if ($value === '') {
            return null;
        }

        $compact = (string) preg_replace('/[\s\-\.\(\)]+/', '', $value);

        if (str_starts_with($compact, '+62')) {
            $national = substr($compact, 3);
        } elseif (str_starts_with($compact, '62')) {
            $national = substr($compact, 2);
        } elseif (str_starts_with($compact, '0')) {
            $national = substr($compact, 1);
        } else {
            return null;
        }

        if (preg_match('/^8\d{7,11}$/', $national) !== 1) {
            return null;
        }

        return '+62'.$national;
    }

    public static function isNormalizedPhone(mixed $value): bool
    {
        return is_string($value) && preg_match('/^\+628\d{7,11}$/', $value) === 1;
    }

    public static function looksLikeEmail(mixed $value): bool
    {
        return is_string($value) && str_contains(trim($value), '@');
    }

    public static function loginIdentifier(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $value = trim($value);

        if ($value === '') {
            return null;
        }

        return self::looksLikeEmail($value)
            ? self::email($value)
            : self::phone($value);
    }

    public static function rateLimitKey(mixed $value): string
    {
        if (! is_string($value)) {
            return 'invalid';
        }

        $value = trim($value);

        if ($value === '') {
            return 'empty';
        }

        $canonical = self::looksLikeEmail($value)
            ? self::email($value)
            : (self::phone($value) ?? Str::lower($value));

        return hash('sha256', (string) $canonical);
    }
}

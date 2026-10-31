<?php

namespace App\Http\Requests\Auth;

use App\Services\Auth\IdentifierNormalizer;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

final class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $value = $this->input('email_or_phone');

        if (! is_string($value)) {
            $this->merge(['email_or_phone' => null]);

            return;
        }

        $identifier = trim($value);

        if (IdentifierNormalizer::looksLikeEmail($identifier)) {
            $identifier = Str::lower($identifier);
        } else {
            $identifier = IdentifierNormalizer::phone($identifier) ?? $identifier;
        }

        $this->merge(['email_or_phone' => $identifier]);
    }

    public function rules(): array
    {
        return [
            'email_or_phone' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string'],
        ];
    }
}

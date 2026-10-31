<?php

namespace App\Http\Requests\Auth;

use App\Services\Auth\IdentifierNormalizer;
use Illuminate\Foundation\Http\FormRequest;

final class ResendEmailVerificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'email' => IdentifierNormalizer::email($this->input('email')),
        ]);
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email:rfc', 'max:255'],
        ];
    }
}

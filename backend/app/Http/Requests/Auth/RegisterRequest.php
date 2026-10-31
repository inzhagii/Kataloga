<?php

namespace App\Http\Requests\Auth;

use App\Services\Auth\IdentifierNormalizer;
use Illuminate\Foundation\Http\FormRequest;

final class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $name = $this->input('name');
        $normalizedPhone = is_string($this->input('phone'))
            ? (IdentifierNormalizer::phone($this->input('phone')) ?? trim($this->input('phone')))
            : $this->input('phone');

        $this->merge([
            'name' => is_string($name) ? (trim($name) === '' ? null : trim($name)) : $name,
            'email' => IdentifierNormalizer::email($this->input('email')),
            'phone' => $normalizedPhone === '' ? null : $normalizedPhone,
        ]);
    }

    public function rules(): array
    {
        return [
            'name' => ['nullable', 'string', 'min:2', 'max:100'],
            'email' => [
                'nullable',
                'required_without:phone',
                'string',
                'email:rfc',
                'max:255',
                function (string $attribute, mixed $value, \Closure $fail): void {
                    if ($value !== null && $this->filled('phone')) {
                        $fail('Isi salah satu: email atau nomor telepon, bukan keduanya.');
                    }
                },
            ],
            'phone' => [
                'nullable',
                'required_without:email',
                'string',
                'max:20',
                function (string $attribute, mixed $value, \Closure $fail): void {
                    if (! is_string($value) || $value === '') {
                        return;
                    }

                    if (! IdentifierNormalizer::isNormalizedPhone($value)) {
                        $fail('Format nomor telepon tidak valid.');
                    }
                },
            ],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'password_confirmation' => ['required', 'string'],
        ];
    }
}

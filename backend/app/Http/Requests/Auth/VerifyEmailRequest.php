<?php

namespace App\Http\Requests\Auth;

use App\Services\Auth\IdentifierNormalizer;
use Illuminate\Foundation\Http\FormRequest;

final class VerifyEmailRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'email' => IdentifierNormalizer::email($this->input('email')),
            'code' => is_string($this->input('code')) ? trim($this->input('code')) : $this->input('code'),
        ]);
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email:rfc', 'max:255'],
            'code' => ['required', 'string', 'max:20'],
        ];
    }
}

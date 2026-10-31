<?php

namespace App\Http\Requests\Product;

final class UpdateProductRequest extends ProductRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'min:1', 'max:150'],
            ...$this->commonRules(),
        ];
    }
}

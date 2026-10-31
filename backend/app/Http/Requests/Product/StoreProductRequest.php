<?php

namespace App\Http\Requests\Product;

final class StoreProductRequest extends ProductRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:1', 'max:150'],
            ...$this->commonRules(),
        ];
    }
}

<?php

namespace App\Http\Requests\Store;

use Illuminate\Foundation\Http\FormRequest;

final class CreateStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $name = $this->input('name');
        $storeId = $this->input('store_id');

        $this->merge([
            'name' => is_string($name) ? trim($name) : $name,
            'store_id' => is_string($storeId) ? strtolower(trim($storeId)) : $storeId,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:1', 'max:100'],
            'store_id' => [
                'required',
                'string',
                'max:50',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama toko wajib diisi.',
            'store_id.required' => 'Store ID wajib diisi.',
            'store_id.regex' => 'Store ID hanya boleh huruf kecil, angka, dan tanda hubung (-).',
            'store_id.max' => 'Store ID maksimal 50 karakter.',
        ];
    }
}

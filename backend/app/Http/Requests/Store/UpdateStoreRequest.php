<?php

namespace App\Http\Requests\Store;

use Illuminate\Foundation\Http\FormRequest;

final class UpdateStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $updates = [];

        if ($this->has('name') && is_string($this->input('name'))) {
            $updates['name'] = trim($this->input('name'));
        }

        if ($this->has('store_id') && is_string($this->input('store_id'))) {
            $updates['store_id'] = strtolower(trim($this->input('store_id')));
        }

        if ($this->has('whatsapp') && is_string($this->input('whatsapp'))) {
            $updates['whatsapp'] = trim($this->input('whatsapp'));
        }

        if ($updates !== []) {
            $this->merge($updates);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'min:1', 'max:100'],
            'store_id' => [
                'sometimes',
                'required',
                'string',
                'max:50',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
            ],
            'logo_url' => ['sometimes', 'nullable', 'string', 'max:500'],
            'description' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'province' => ['sometimes', 'nullable', 'string', 'max:100'],
            'city' => ['sometimes', 'nullable', 'string', 'max:100'],
            'full_address' => ['sometimes', 'nullable', 'string', 'max:500'],
            'whatsapp' => ['sometimes', 'nullable', 'string', 'max:20'],
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

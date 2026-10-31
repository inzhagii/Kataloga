<?php

namespace App\Http\Requests\Product;

use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

abstract class ProductRequest extends FormRequest
{
    private const SERVER_MANAGED_FIELDS = [
        'id',
        'store_id',
        'slug',
        'status',
        'is_featured',
        'featured',
        'moderation_status',
        'published_at',
        'sold_out_at',
        'archived_at',
        'product_action',
        'custom_action_text',
        'created_at',
        'updated_at',
    ];

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->input('name'))) {
            $this->merge(['name' => trim($this->input('name'))]);
        }

        foreach (['description', 'condition', 'main_image', 'price', 'category_id', 'brand_id'] as $field) {
            if ($this->has($field) && $this->input($field) === '') {
                $this->merge([$field => null]);
            }
        }
    }

    /**
     * @return array<string, mixed>
     */
    protected function commonRules(): array
    {
        $rules = [
            'description' => ['nullable', 'string'],
            'category_id' => ['nullable', 'integer'],
            'brand_id' => ['nullable', 'integer'],
            'condition' => ['nullable', 'string', Rule::in(['NEW', 'SECOND'])],
            'price' => ['nullable', 'numeric', 'min:0', 'max:9999999999.99'],
            'images' => ['nullable', 'array', 'max:5'],
            'images.*' => ['string', 'max:500', 'url:http,https'],
            'main_image' => ['nullable', 'string', 'max:500', 'url:http,https'],
            'details' => ['nullable', 'array'],
            'details.*' => ['array'],
            'details.*.label' => ['required', 'string', 'max:150'],
            'details.*.value' => ['required', 'string'],
            'external_links' => ['nullable', 'array'],
            'external_links.*' => ['array'],
            'external_links.*.channel_id' => ['required', 'string', 'max:50', 'distinct', 'exists:channel_definitions,id'],
            'external_links.*.url' => [
                'nullable',
                'string',
                'max:500',
                function (string $attribute, mixed $value, Closure $fail): void {
                    if ($value === null || trim((string) $value) === '') {
                        return;
                    }

                    if (! Str::isUrl((string) $value, ['http', 'https'])) {
                        $fail('URL external harus berupa URL HTTP/HTTPS yang valid.');
                    }
                },
            ],
        ];

        foreach (self::SERVER_MANAGED_FIELDS as $field) {
            $rules[$field] = ['prohibited'];
        }

        return $rules;
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        $messages = [
            'name.required' => 'Nama produk wajib diisi.',
            'name.max' => 'Nama produk maksimal 150 karakter.',
            'condition.in' => 'Kondisi produk harus NEW atau SECOND.',
            'price.numeric' => 'Harga produk harus berupa angka.',
            'price.min' => 'Harga produk tidak boleh negatif.',
            'price.max' => 'Harga produk terlalu besar.',
            'images.array' => 'Foto produk harus berupa daftar.',
            'images.max' => 'Foto produk maksimal 5.',
            'images.*.url' => 'Foto produk harus berupa URL HTTP/HTTPS yang valid.',
            'main_image.url' => 'Foto utama harus berupa URL HTTP/HTTPS yang valid.',
            'details.*.label.required' => 'Label detail produk wajib diisi.',
            'details.*.label.max' => 'Label detail produk maksimal 150 karakter.',
            'details.*.value.required' => 'Nilai detail produk wajib diisi.',
            'external_links.*.channel_id.required' => 'Channel external wajib dipilih.',
            'external_links.*.channel_id.distinct' => 'Channel external tidak boleh duplikat.',
            'external_links.*.channel_id.exists' => 'Channel external tidak valid.',
        ];

        foreach (self::SERVER_MANAGED_FIELDS as $field) {
            $messages[$field.'.prohibited'] = 'Field '.$field.' dikelola server dan tidak boleh dikirim.';
        }

        return $messages;
    }
}

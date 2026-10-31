<?php

namespace App\Services\Product;

use App\Enums\UserRole;
use App\Exceptions\ApiException;
use App\Models\Brand;
use App\Models\Category;
use App\Models\ChannelDefinition;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final class ProductService
{
    private const RELATIONS = [
        'store',
        'category',
        'brand',
        'photos',
        'productAttributes',
        'externalLinks',
    ];

    /**
     * @return Collection<int, Product>
     */
    public function list(User $user, ?string $status = null): Collection
    {
        $store = $this->requireStore($user);

        $query = Product::query()
            ->where('store_id', $store->id)
            ->with(self::RELATIONS);

        if ($status === 'active') {
            $query->where('status', 'PUBLISHED');
        } elseif ($status === 'archived') {
            $query->where('status', 'ARCHIVED');
        }

        return $query->orderBy('id')->get();
    }

    public function find(User $user, int $productId): Product
    {
        $store = $this->requireStore($user);

        $product = Product::query()
            ->where('store_id', $store->id)
            ->with(self::RELATIONS)
            ->find($productId);

        if ($product === null) {
            throw ApiException::error(
                'Produk tidak ditemukan.',
                [],
                'product_not_found',
                404,
            );
        }

        return $product;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(User $user, array $data): Product
    {
        $store = $this->requireStore($user);
        $categoryId = $this->resolveCategoryId($store, $data['category_id'] ?? null);
        $brandId = $this->resolveBrandId($store, $data['brand_id'] ?? null);

        $images = $this->normalizeImages($data['images'] ?? null);
        $mainImage = $this->resolveMainImage(
            $images,
            array_key_exists('main_image', $data) ? $data['main_image'] : null,
        );
        $details = $this->normalizeDetails($data['details'] ?? null);
        $externalLinks = $this->normalizeExternalLinks($data['external_links'] ?? null);

        return DB::transaction(function () use (
            $store,
            $data,
            $categoryId,
            $brandId,
            $images,
            $mainImage,
            $details,
            $externalLinks,
        ): Product {
            try {
                $product = Product::query()->create([
                    'store_id' => $store->id,
                    'category_id' => $categoryId,
                    'brand_id' => $brandId,
                    'name' => trim((string) $data['name']),
                    'slug' => $this->makeUniqueSlug($store, (string) $data['name']),
                    'description' => $data['description'] ?? null,
                    'condition' => $data['condition'] ?? null,
                    'price' => $data['price'] ?? null,
                    'product_action' => null,
                    'custom_action_text' => null,
                    'status' => 'DRAFT',
                    'moderation_status' => null,
                    'is_featured' => false,
                    'sold_out_at' => null,
                    'published_at' => null,
                    'archived_at' => null,
                ]);
            } catch (UniqueConstraintViolationException) {
                throw ApiException::error(
                    'Nama produk menghasilkan slug yang sudah digunakan dalam toko ini.',
                    ['name' => ['Nama produk menghasilkan slug yang sudah digunakan dalam toko ini.']],
                    'slug_already_exists',
                    409,
                );
            }

            $this->replacePhotos($product, $images, $mainImage);
            $this->replaceDetails($product, $details);
            $this->replaceExternalLinks($product, $externalLinks);

            return $product->load(self::RELATIONS);
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(User $user, Product $product, array $data): Product
    {
        $store = $this->requireStore($user);

        if ((int) $product->store_id !== (int) $store->id) {
            throw ApiException::error('Produk tidak ditemukan.', [], 'product_not_found', 404);
        }

        if ($product->status !== 'DRAFT') {
            throw $this->notDraft();
        }

        $categoryId = array_key_exists('category_id', $data)
            ? $this->resolveCategoryId($store, $data['category_id'])
            : $product->category_id;
        $brandId = array_key_exists('brand_id', $data)
            ? $this->resolveBrandId($store, $data['brand_id'])
            : $product->brand_id;

        return DB::transaction(function () use (
            $product,
            $data,
            $categoryId,
            $brandId,
        ): Product {
            $product->refresh();

            if ($product->status !== 'DRAFT') {
                throw $this->notDraft();
            }

            if (array_key_exists('name', $data)) {
                $product->name = trim((string) $data['name']);
            }

            if (array_key_exists('description', $data)) {
                $product->description = $data['description'];
            }

            if (array_key_exists('condition', $data)) {
                $product->condition = $data['condition'];
            }

            if (array_key_exists('price', $data)) {
                $product->price = $data['price'];
            }

            if (array_key_exists('category_id', $data)) {
                $product->category_id = $categoryId;
            }

            if (array_key_exists('brand_id', $data)) {
                $product->brand_id = $brandId;
            }

            $product->save();

            if (array_key_exists('images', $data) || array_key_exists('main_image', $data)) {
                $this->updatePhotos($product, $data);
            }

            if (array_key_exists('details', $data)) {
                $this->replaceDetails($product, $this->normalizeDetails($data['details']));
            }

            if (array_key_exists('external_links', $data)) {
                $this->replaceExternalLinks($product, $this->normalizeExternalLinks($data['external_links']));
            }

            return $product->fresh(self::RELATIONS);
        });
    }

    private function requireStore(User $user): Store
    {
        if ($user->role === UserRole::Admin) {
            throw ApiException::adminForbidden();
        }

        $store = $user->store;

        if ($store === null) {
            throw ApiException::storeNotFound();
        }

        return $store;
    }

    private function resolveCategoryId(Store $store, mixed $value): ?int
    {
        $categoryId = $this->normalizeNullableId($value);

        if ($categoryId === null) {
            return null;
        }

        $category = Category::query()->find($categoryId);

        if ($category === null || ($category->store_id !== null && (int) $category->store_id !== (int) $store->id)) {
            throw ApiException::error(
                'Kategori tidak valid untuk toko ini.',
                ['category_id' => ['Kategori tidak valid untuk toko ini.']],
                'validation_error',
                422,
            );
        }

        return $category->id;
    }

    private function resolveBrandId(Store $store, mixed $value): ?int
    {
        $brandId = $this->normalizeNullableId($value);

        if ($brandId === null) {
            return null;
        }

        $brand = Brand::query()->find($brandId);

        if ($brand === null || ($brand->store_id !== null && (int) $brand->store_id !== (int) $store->id)) {
            throw ApiException::error(
                'Brand tidak valid untuk toko ini.',
                ['brand_id' => ['Brand tidak valid untuk toko ini.']],
                'validation_error',
                422,
            );
        }

        return $brand->id;
    }

    private function normalizeNullableId(mixed $value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        return (int) $value;
    }

    private function makeSlug(string $name): string
    {
        $slug = Str::slug($name);

        if ($slug === '') {
            $slug = 'product';
        }

        return mb_substr($slug, 0, 160);
    }

    private function makeUniqueSlug(Store $store, string $name): string
    {
        $base = $this->makeSlug($name);
        $slug = $base;
        $suffix = 2;

        while (Product::query()->where('store_id', $store->id)->where('slug', $slug)->exists()) {
            $suffixText = '-'.$suffix;
            $slug = mb_substr($base, 0, 160 - mb_strlen($suffixText)).$suffixText;
            $suffix++;
        }

        return $slug;
    }

    /**
     * @return array<int, string>
     */
    private function normalizeImages(mixed $value): array
    {
        if (! is_array($value)) {
            return [];
        }

        return array_values(array_map(
            static fn (mixed $url): string => (string) $url,
            $value,
        ));
    }

    /**
     * @param  array<int, string>  $images
     */
    private function resolveMainImage(array $images, mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return $images === [] ? null : $images[0];
        }

        $mainImage = (string) $value;

        if (! in_array($mainImage, $images, true)) {
            throw ApiException::error(
                'Foto utama harus salah satu dari foto produk.',
                ['main_image' => ['Foto utama harus salah satu dari foto produk.']],
                'validation_error',
                422,
            );
        }

        return $mainImage;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function updatePhotos(Product $product, array $data): void
    {
        if (array_key_exists('images', $data)) {
            $images = $this->normalizeImages($data['images']);
            $mainImage = $this->resolveMainImage(
                $images,
                array_key_exists('main_image', $data) ? $data['main_image'] : null,
            );

            $this->replacePhotos($product, $images, $mainImage);

            return;
        }

        $mainImage = $data['main_image'];

        if ($mainImage !== null && $mainImage !== '') {
            $existingImages = $product->photos()->pluck('url')->all();

            if (! in_array((string) $mainImage, $existingImages, true)) {
                throw ApiException::error(
                    'Foto utama harus salah satu dari foto produk.',
                    ['main_image' => ['Foto utama harus salah satu dari foto produk.']],
                    'validation_error',
                    422,
                );
            }
        }

        $product->photos()->update(['is_main' => false]);

        if ($mainImage !== null && $mainImage !== '') {
            $product->photos()
                ->where('url', (string) $mainImage)
                ->update(['is_main' => true]);
        }
    }

    /**
     * @param  array<int, string>  $images
     */
    private function replacePhotos(Product $product, array $images, ?string $mainImage): void
    {
        $product->photos()->delete();

        $mainIndex = $mainImage === null ? null : array_search($mainImage, $images, true);

        foreach ($images as $index => $url) {
            $product->photos()->create([
                'url' => $url,
                'is_main' => $mainIndex !== null && $index === $mainIndex,
                'sort_order' => $index + 1,
            ]);
        }
    }

    /**
     * @return array<int, array{label: string, value: string}>
     */
    private function normalizeDetails(mixed $value): array
    {
        if (! is_array($value)) {
            return [];
        }

        $details = [];

        foreach ($value as $detail) {
            if (! is_array($detail) || ! array_key_exists('label', $detail) || ! array_key_exists('value', $detail)) {
                continue;
            }

            $details[] = [
                'label' => trim((string) $detail['label']),
                'value' => (string) $detail['value'],
            ];
        }

        return $details;
    }

    /**
     * @param  array<int, array{label: string, value: string}>  $details
     */
    private function replaceDetails(Product $product, array $details): void
    {
        $product->productAttributes()->delete();

        foreach ($details as $detail) {
            $product->productAttributes()->create([
                'label' => $detail['label'],
                'value' => $detail['value'],
            ]);
        }
    }

    /**
     * @return array<int, array{channel_id: string, url: string}>
     */
    private function normalizeExternalLinks(mixed $value): array
    {
        if (! is_array($value)) {
            return [];
        }

        $links = [];

        foreach ($value as $index => $link) {
            if (! is_array($link) || ! array_key_exists('channel_id', $link)) {
                continue;
            }

            $channelId = (string) $link['channel_id'];

            if (ChannelDefinition::query()->find($channelId) === null) {
                throw ApiException::error(
                    'Channel external tidak valid.',
                    ['external_links.'.$index.'.channel_id' => ['Channel external tidak valid.']],
                    'validation_error',
                    422,
                );
            }

            $links[] = [
                'channel_id' => $channelId,
                'url' => (string) ($link['url'] ?? ''),
            ];
        }

        return $links;
    }

    /**
     * @param  array<int, array{channel_id: string, url: string}>  $links
     */
    private function replaceExternalLinks(Product $product, array $links): void
    {
        $product->externalLinks()->detach();

        foreach ($links as $link) {
            $product->externalLinks()->attach($link['channel_id'], [
                'url' => $link['url'],
            ]);
        }
    }

    private function notDraft(): ApiException
    {
        return ApiException::error(
            'Hanya produk berstatus DRAFT yang dapat diperbarui.',
            [],
            'product_not_draft',
            409,
        );
    }
}

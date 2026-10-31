<?php

namespace Tests\Feature\Product\Concerns;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\Store;

trait CreatesProducts
{
    protected function createProduct(
        Store $store,
        Category $category,
        ?Brand $brand = null,
        string $status = 'PUBLISHED',
        string $slug = 'product-slug',
    ): Product {
        return Product::query()->create([
            'store_id' => $store->id,
            'category_id' => $category->id,
            'brand_id' => $brand?->id,
            'name' => 'Product '.$slug,
            'slug' => $slug,
            'description' => 'Product description.',
            'condition' => 'NEW',
            'price' => 100000,
            'status' => $status,
            'archived_at' => $status === 'ARCHIVED' ? now() : null,
        ]);
    }
}

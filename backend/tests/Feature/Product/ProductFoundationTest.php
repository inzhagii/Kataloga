<?php

namespace Tests\Feature\Product;

use App\Enums\UserRole;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Feature\Product\Concerns\CreatesProducts;
use Tests\TestCase;

class ProductFoundationTest extends TestCase
{
    use CreatesProducts;
    use RefreshDatabase;

    public function test_product_relations_work_in_both_directions(): void
    {
        $user = User::factory()->create(['role' => UserRole::Customer]);
        $store = Store::factory()->create(['user_id' => $user->id, 'store_id' => 'store-a', 'name' => 'Store A']);
        $category = Category::query()->create(['store_id' => $store->id, 'parent_id' => null, 'name' => 'Laptop']);
        $brand = Brand::query()->create(['store_id' => $store->id, 'name' => 'Asus']);
        $product = $this->createProduct($store, $category, $brand);

        $this->assertTrue($product->store->is($store));
        $this->assertTrue($product->category->is($category));
        $this->assertTrue($product->brand->is($brand));

        $this->assertTrue($store->products->contains($product));
        $this->assertTrue($category->products->contains($product));
        $this->assertTrue($brand->products->contains($product));
    }

    public function test_slug_is_trimmed_and_lowercased(): void
    {
        $user = User::factory()->create(['role' => UserRole::Customer]);
        $store = Store::factory()->create(['user_id' => $user->id, 'store_id' => 'store-a', 'name' => 'Store A']);
        $category = Category::query()->create(['store_id' => $store->id, 'parent_id' => null, 'name' => 'Laptop']);

        $product = $this->createProduct($store, $category, slug: '  LAPTOP-Asus ROG  ');

        $this->assertSame('laptop-asus rog', $product->slug);
        $this->assertSame('laptop-asus rog', $product->fresh()->slug);
    }

    public function test_duplicate_slug_within_store_is_rejected(): void
    {
        $user = User::factory()->create(['role' => UserRole::Customer]);
        $store = Store::factory()->create(['user_id' => $user->id, 'store_id' => 'store-a', 'name' => 'Store A']);
        $category = Category::query()->create(['store_id' => $store->id, 'parent_id' => null, 'name' => 'Laptop']);

        $this->createProduct($store, $category, slug: 'laptop-asus');

        $this->expectException(QueryException::class);

        $this->createProduct($store, $category, slug: '  LAPTOP-ASUS  ');
    }

    public function test_same_slug_is_allowed_across_stores(): void
    {
        $user1 = User::factory()->create(['role' => UserRole::Customer]);
        $store1 = Store::factory()->create(['user_id' => $user1->id, 'store_id' => 'store-a', 'name' => 'Store A']);
        $category1 = Category::query()->create(['store_id' => $store1->id, 'parent_id' => null, 'name' => 'Laptop']);

        $user2 = User::factory()->create(['role' => UserRole::Customer]);
        $store2 = Store::factory()->create(['user_id' => $user2->id, 'store_id' => 'store-b', 'name' => 'Store B']);
        $category2 = Category::query()->create(['store_id' => $store2->id, 'parent_id' => null, 'name' => 'Laptop']);

        $this->createProduct($store1, $category1, slug: 'laptop-asus');
        $this->createProduct($store2, $category2, slug: 'laptop-asus');

        $this->assertSame(2, Product::query()->where('slug', 'laptop-asus')->count());
    }

    public function test_store_with_product_cannot_be_deleted(): void
    {
        $user = User::factory()->create(['role' => UserRole::Customer]);
        $store = Store::factory()->create(['user_id' => $user->id, 'store_id' => 'store-a', 'name' => 'Store A']);
        $category = Category::query()->create(['store_id' => $store->id, 'parent_id' => null, 'name' => 'Laptop']);
        $this->createProduct($store, $category);

        $this->expectException(QueryException::class);

        $store->delete();
    }

    public function test_brand_with_product_cannot_be_deleted_at_database_level(): void
    {
        $user = User::factory()->create(['role' => UserRole::Customer]);
        $store = Store::factory()->create(['user_id' => $user->id, 'store_id' => 'store-a', 'name' => 'Store A']);
        $category = Category::query()->create(['store_id' => $store->id, 'parent_id' => null, 'name' => 'Laptop']);
        $brand = Brand::query()->create(['store_id' => $store->id, 'name' => 'Asus']);
        $this->createProduct($store, $category, $brand);

        $this->expectException(QueryException::class);

        $brand->delete();
    }
}

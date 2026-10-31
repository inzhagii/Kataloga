<?php

namespace Tests\Feature\Brand;

use App\Enums\UserRole;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\Feature\Product\Concerns\CreatesProducts;
use Tests\TestCase;

class BrandTest extends TestCase
{
    use CreatesProducts;
    use RefreshDatabase;

    public function test_guest_can_read_only_global_brands(): void
    {
        DB::table('brands')->insert([
            ['store_id' => null, 'name' => 'GlobalBrand', 'created_at' => now(), 'updated_at' => now()],
        ]);
        $owner = User::factory()->create(['role' => UserRole::Customer]);
        $store = Store::factory()->create(['user_id' => $owner->id, 'store_id' => 'store-a', 'name' => 'Store A']);
        DB::table('brands')->insert([
            ['store_id' => $store->id, 'name' => 'BrandA', 'created_at' => now(), 'updated_at' => now()],
        ]);

        $response = $this->getJson('/brands');
        $response->assertStatus(200);
        $names = collect($response->json('data'))->pluck('name')->all();
        $this->assertContains('GlobalBrand', $names);
        $this->assertNotContains('BrandA', $names);
    }

    public function test_authenticated_sees_global_and_own_store_not_other(): void
    {
        DB::table('brands')->insert([
            ['store_id' => null, 'name' => 'GlobalBrand', 'created_at' => now(), 'updated_at' => now()],
        ]);
        $owner1 = User::factory()->create(['role' => UserRole::Customer]);
        $store1 = Store::factory()->create(['user_id' => $owner1->id, 'store_id' => 'store-a', 'name' => 'Store A']);
        $owner2 = User::factory()->create(['role' => UserRole::Customer]);
        $store2 = Store::factory()->create(['user_id' => $owner2->id, 'store_id' => 'store-b', 'name' => 'Store B']);
        DB::table('brands')->insert([
            ['store_id' => $store1->id, 'name' => 'BrandA', 'created_at' => now(), 'updated_at' => now()],
            ['store_id' => $store2->id, 'name' => 'BrandB', 'created_at' => now(), 'updated_at' => now()],
        ]);

        $this->actingAs($owner1, 'sanctum');
        $response = $this->getJson('/brands');
        $response->assertStatus(200);
        $names = collect($response->json('data'))->pluck('name')->all();
        $this->assertContains('GlobalBrand', $names);
        $this->assertContains('BrandA', $names);
        $this->assertNotContains('BrandB', $names);
    }

    public function test_global_brand_read_only(): void
    {
        $global = Brand::query()->create(['store_id' => null, 'name' => 'GlobalBrandRO']);
        $owner = User::factory()->create(['role' => UserRole::Customer]);
        $store = Store::factory()->create(['user_id' => $owner->id, 'store_id' => 'store-a', 'name' => 'Store A']);
        $this->actingAs($owner, 'sanctum');

        $this->patchJson('/brands/'.$global->id, ['name' => 'X'])->assertStatus(403);
        $this->deleteJson('/brands/'.$global->id)->assertStatus(403);
    }

    public function test_custom_only_owner_admin_denied(): void
    {
        $owner1 = User::factory()->create(['role' => UserRole::Customer]);
        $store1 = Store::factory()->create(['user_id' => $owner1->id, 'store_id' => 'store-a', 'name' => 'Store A']);
        $owner2 = User::factory()->create(['role' => UserRole::Customer]);
        $store2 = Store::factory()->create(['user_id' => $owner2->id, 'store_id' => 'store-b', 'name' => 'Store B']);
        $brand1 = Brand::query()->create(['store_id' => $store1->id, 'name' => 'BrandA']);

        $this->actingAs($owner2, 'sanctum');
        $this->patchJson('/brands/'.$brand1->id, ['name' => 'Hacked'])->assertStatus(403);
        $this->deleteJson('/brands/'.$brand1->id)->assertStatus(403);

        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $this->actingAs($admin, 'sanctum');
        $this->postJson('/brands', ['name' => 'Nope'])->assertStatus(403);
    }

    public function test_duplicate_case_insensitive_scope_and_cross_scope_allowed(): void
    {
        $owner1 = User::factory()->create(['role' => UserRole::Customer]);
        $store1 = Store::factory()->create(['user_id' => $owner1->id, 'store_id' => 'store-a', 'name' => 'Store A']);
        $owner2 = User::factory()->create(['role' => UserRole::Customer]);
        $store2 = Store::factory()->create(['user_id' => $owner2->id, 'store_id' => 'store-b', 'name' => 'Store B']);
        $this->actingAs($owner1, 'sanctum');
        DB::table('brands')->insert([
            ['store_id' => $store1->id, 'name' => 'Asus', 'created_at' => now(), 'updated_at' => now()],
        ]);
        $res = $this->postJson('/brands', ['name' => 'asus']);
        $res->assertStatus(409)->assertJsonPath('errors.name.0', 'Nama brand sudah digunakan dalam scope ini.');
        $this->actingAs($owner2, 'sanctum');
        $this->postJson('/brands', ['name' => 'Asus'])->assertStatus(201);
        DB::table('brands')->insert([
            ['store_id' => null, 'name' => 'Logitech', 'created_at' => now(), 'updated_at' => now()],
        ]);
        $this->actingAs($owner1, 'sanctum');
        $this->postJson('/brands', ['name' => 'Logitech'])->assertStatus(201);
    }

    public function test_brand_cannot_be_deleted_when_referenced_by_product(): void
    {
        $owner = User::factory()->create(['role' => UserRole::Customer]);
        $store = Store::factory()->create(['user_id' => $owner->id, 'store_id' => 'store-a', 'name' => 'Store A']);
        $category = Category::query()->create(['store_id' => $store->id, 'parent_id' => null, 'name' => 'Laptop']);
        $brand = Brand::query()->create(['store_id' => $store->id, 'name' => 'Asus']);
        $this->createProduct($store, $category, $brand);
        $this->actingAs($owner, 'sanctum');

        $this->deleteJson('/brands/'.$brand->id)
            ->assertStatus(409)
            ->assertJsonPath('code', 'brand_in_use');

        $this->assertDatabaseHas('brands', ['id' => $brand->id]);
    }

    public function test_archived_product_prevents_brand_deletion(): void
    {
        $owner = User::factory()->create(['role' => UserRole::Customer]);
        $store = Store::factory()->create(['user_id' => $owner->id, 'store_id' => 'store-a', 'name' => 'Store A']);
        $category = Category::query()->create(['store_id' => $store->id, 'parent_id' => null, 'name' => 'Laptop']);
        $brand = Brand::query()->create(['store_id' => $store->id, 'name' => 'Asus']);
        $this->createProduct($store, $category, $brand, status: 'ARCHIVED');
        $this->actingAs($owner, 'sanctum');

        $this->deleteJson('/brands/'.$brand->id)
            ->assertStatus(409)
            ->assertJsonPath('code', 'brand_in_use');

        $this->assertDatabaseHas('brands', ['id' => $brand->id]);
    }

    public function test_brand_can_be_deleted_when_not_referenced_by_product(): void
    {
        $owner = User::factory()->create(['role' => UserRole::Customer]);
        $store = Store::factory()->create(['user_id' => $owner->id, 'store_id' => 'store-a', 'name' => 'Store A']);
        $brand = Brand::query()->create(['store_id' => $store->id, 'name' => 'Unused']);
        $this->actingAs($owner, 'sanctum');

        $this->deleteJson('/brands/'.$brand->id)->assertOk();

        $this->assertDatabaseMissing('brands', ['id' => $brand->id]);
    }

    public function test_brand_delete_is_fail_safe_when_products_schema_is_missing(): void
    {
        $owner = User::factory()->create(['role' => UserRole::Customer]);
        $store = Store::factory()->create(['user_id' => $owner->id, 'store_id' => 'store-a', 'name' => 'Store A']);
        $brand = Brand::query()->create(['store_id' => $store->id, 'name' => 'SoloB']);
        $this->actingAs($owner, 'sanctum');
        Schema::dropIfExists('products');

        $res = $this->deleteJson('/brands/'.$brand->id);
        $res->assertStatus(409);
        $json = $res->json();
        $this->assertArrayHasKey('message', $json);
        $this->assertArrayHasKey('code', $json);
        $this->assertEquals('brand_in_use', $json['code']);
        $this->assertDatabaseHas('brands', ['id' => $brand->id]);
    }
}

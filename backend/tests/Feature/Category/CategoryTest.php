<?php

namespace Tests\Feature\Category;

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\Feature\Product\Concerns\CreatesProducts;
use Tests\TestCase;

class CategoryTest extends TestCase
{
    use CreatesProducts;
    use RefreshDatabase;

    public function test_guest_can_read_only_global_categories(): void
    {
        DB::table('categories')->insert([
            ['store_id' => null, 'parent_id' => null, 'name' => 'GlobalCat', 'created_at' => now(), 'updated_at' => now()],
        ]);
        $owner = User::factory()->create(['role' => UserRole::Customer]);
        $store = Store::factory()->create(['user_id' => $owner->id, 'store_id' => 'store-a', 'name' => 'Store A']);
        DB::table('categories')->insert([
            ['store_id' => $store->id, 'parent_id' => null, 'name' => 'CustomA', 'created_at' => now(), 'updated_at' => now()],
        ]);

        $response = $this->getJson('/categories');
        $response->assertStatus(200);
        $names = collect($response->json('data'))->pluck('name')->all();
        $this->assertContains('GlobalCat', $names);
        $this->assertNotContains('CustomA', $names);
    }

    public function test_authenticated_sees_global_and_own_store_not_other(): void
    {
        DB::table('categories')->insert([
            ['store_id' => null, 'parent_id' => null, 'name' => 'GlobalCat', 'created_at' => now(), 'updated_at' => now()],
        ]);
        $owner1 = User::factory()->create(['role' => UserRole::Customer]);
        $store1 = Store::factory()->create(['user_id' => $owner1->id, 'store_id' => 'store-a', 'name' => 'Store A']);
        $owner2 = User::factory()->create(['role' => UserRole::Customer]);
        $store2 = Store::factory()->create(['user_id' => $owner2->id, 'store_id' => 'store-b', 'name' => 'Store B']);
        DB::table('categories')->insert([
            ['store_id' => $store1->id, 'parent_id' => null, 'name' => 'CustomA', 'created_at' => now(), 'updated_at' => now()],
            ['store_id' => $store2->id, 'parent_id' => null, 'name' => 'CustomB', 'created_at' => now(), 'updated_at' => now()],
        ]);

        $this->actingAs($owner1, 'sanctum');
        $response = $this->getJson('/categories');
        $response->assertStatus(200);
        $names = collect($response->json('data'))->pluck('name')->all();
        $this->assertContains('GlobalCat', $names);
        $this->assertContains('CustomA', $names);
        $this->assertNotContains('CustomB', $names);
    }

    public function test_global_category_read_only(): void
    {
        $global = Category::query()->create(['store_id' => null, 'parent_id' => null, 'name' => 'GlobalReadOnly']);
        $owner = User::factory()->create(['role' => UserRole::Customer]);
        $store = Store::factory()->create(['user_id' => $owner->id, 'store_id' => 'store-a', 'name' => 'Store A']);
        $this->actingAs($owner, 'sanctum');

        $this->patchJson('/categories/'.$global->id, ['name' => 'X'])->assertStatus(403);
        $this->deleteJson('/categories/'.$global->id)->assertStatus(403);
    }

    public function test_custom_only_owner_can_mutate_admin_denied(): void
    {
        $owner1 = User::factory()->create(['role' => UserRole::Customer]);
        $store1 = Store::factory()->create(['user_id' => $owner1->id, 'store_id' => 'store-a', 'name' => 'Store A']);
        $owner2 = User::factory()->create(['role' => UserRole::Customer]);
        $store2 = Store::factory()->create(['user_id' => $owner2->id, 'store_id' => 'store-b', 'name' => 'Store B']);
        $cat1 = Category::query()->create(['store_id' => $store1->id, 'parent_id' => null, 'name' => 'CatA']);

        $this->actingAs($owner2, 'sanctum');
        $this->patchJson('/categories/'.$cat1->id, ['name' => 'Hacked'])->assertStatus(403);
        $this->deleteJson('/categories/'.$cat1->id)->assertStatus(403);

        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $this->actingAs($admin, 'sanctum');
        $this->postJson('/categories', ['name' => 'Nope'])->assertStatus(403);
    }

    public function test_duplicate_case_insensitive_same_scope_rejected_names_across_scopes_allowed(): void
    {
        $owner1 = User::factory()->create(['role' => UserRole::Customer]);
        $store1 = Store::factory()->create(['user_id' => $owner1->id, 'store_id' => 'store-a', 'name' => 'Store A']);
        $owner2 = User::factory()->create(['role' => UserRole::Customer]);
        $store2 = Store::factory()->create(['user_id' => $owner2->id, 'store_id' => 'store-b', 'name' => 'Store B']);
        $this->actingAs($owner1, 'sanctum');
        DB::table('categories')->insert([
            ['store_id' => $store1->id, 'parent_id' => null, 'name' => 'Laptop', 'created_at' => now(), 'updated_at' => now()],
        ]);
        $res = $this->postJson('/categories', ['name' => 'laptop']);
        $res->assertStatus(409)->assertJsonPath('errors.name.0', 'Nama kategori sudah digunakan dalam scope ini.');
        $this->actingAs($owner2, 'sanctum');
        $this->postJson('/categories', ['name' => 'Laptop'])->assertStatus(201);
        DB::table('categories')->insert([
            ['store_id' => null, 'parent_id' => null, 'name' => 'Same', 'created_at' => now(), 'updated_at' => now()],
        ]);
        $this->actingAs($owner1, 'sanctum');
        $this->postJson('/categories', ['name' => 'Same'])->assertStatus(201);
    }

    public function test_hierarchy_validation(): void
    {
        $owner = User::factory()->create(['role' => UserRole::Customer]);
        $store = Store::factory()->create(['user_id' => $owner->id, 'store_id' => 'store-a', 'name' => 'Store A']);
        $global = Category::query()->create(['store_id' => null, 'parent_id' => null, 'name' => 'Global']);
        $main = Category::query()->create(['store_id' => $store->id, 'parent_id' => null, 'name' => 'Main']);
        $sub = Category::query()->create(['store_id' => $store->id, 'parent_id' => $main->id, 'name' => 'Sub']);
        $this->actingAs($owner, 'sanctum');

        $this->postJson('/categories', ['name' => 'Bad', 'parent_id' => $sub->id])->assertStatus(422);
        $this->postJson('/categories', ['name' => 'Bad', 'parent_id' => $global->id])->assertStatus(422);
        $this->patchJson('/categories/'.$sub->id, ['parent_id' => $sub->id])->assertStatus(422);
        $this->postJson('/categories', ['name' => 'Bad2', 'parent_id' => $main->id])->assertStatus(201);
    }

    public function test_category_with_children_cannot_be_deleted_or_made_subcategory(): void
    {
        $owner = User::factory()->create(['role' => UserRole::Customer]);
        $store = Store::factory()->create(['user_id' => $owner->id, 'store_id' => 'store-a', 'name' => 'Store A']);
        $main = Category::query()->create(['store_id' => $store->id, 'parent_id' => null, 'name' => 'Main']);
        $other = Category::query()->create(['store_id' => $store->id, 'parent_id' => null, 'name' => 'Other']);
        Category::query()->create(['store_id' => $store->id, 'parent_id' => $main->id, 'name' => 'Sub']);
        $this->actingAs($owner, 'sanctum');

        $this->patchJson('/categories/'.$main->id, ['parent_id' => $other->id])->assertStatus(422);
        $this->deleteJson('/categories/'.$main->id)->assertStatus(409)->assertJsonPath('code', 'category_has_children');
    }

    public function test_category_cannot_be_deleted_when_referenced_by_product(): void
    {
        $owner = User::factory()->create(['role' => UserRole::Customer]);
        $store = Store::factory()->create(['user_id' => $owner->id, 'store_id' => 'store-a', 'name' => 'Store A']);
        $category = Category::query()->create(['store_id' => $store->id, 'parent_id' => null, 'name' => 'Laptop']);
        $this->createProduct($store, $category);
        $this->actingAs($owner, 'sanctum');

        $this->deleteJson('/categories/'.$category->id)
            ->assertStatus(409)
            ->assertJsonPath('code', 'category_in_use');

        $this->assertDatabaseHas('categories', ['id' => $category->id]);
    }

    public function test_archived_product_prevents_category_deletion(): void
    {
        $owner = User::factory()->create(['role' => UserRole::Customer]);
        $store = Store::factory()->create(['user_id' => $owner->id, 'store_id' => 'store-a', 'name' => 'Store A']);
        $category = Category::query()->create(['store_id' => $store->id, 'parent_id' => null, 'name' => 'Laptop']);
        $this->createProduct($store, $category, status: 'ARCHIVED');
        $this->actingAs($owner, 'sanctum');

        $this->deleteJson('/categories/'.$category->id)
            ->assertStatus(409)
            ->assertJsonPath('code', 'category_in_use');

        $this->assertDatabaseHas('categories', ['id' => $category->id]);
    }

    public function test_category_can_be_deleted_when_not_referenced_by_product(): void
    {
        $owner = User::factory()->create(['role' => UserRole::Customer]);
        $store = Store::factory()->create(['user_id' => $owner->id, 'store_id' => 'store-a', 'name' => 'Store A']);
        $category = Category::query()->create(['store_id' => $store->id, 'parent_id' => null, 'name' => 'Unused']);
        $this->actingAs($owner, 'sanctum');

        $this->deleteJson('/categories/'.$category->id)->assertOk();

        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
    }

    public function test_category_delete_is_fail_safe_when_products_schema_is_missing(): void
    {
        $owner = User::factory()->create(['role' => UserRole::Customer]);
        $store = Store::factory()->create(['user_id' => $owner->id, 'store_id' => 'store-a', 'name' => 'Store A']);
        $cat = Category::query()->create(['store_id' => $store->id, 'parent_id' => null, 'name' => 'Solo']);
        $this->actingAs($owner, 'sanctum');
        Schema::dropIfExists('products');

        $res = $this->deleteJson('/categories/'.$cat->id);
        $res->assertStatus(409);
        $json = $res->json();
        $this->assertArrayHasKey('message', $json);
        $this->assertArrayHasKey('code', $json);
        $this->assertEquals('category_in_use', $json['code']);
        $this->assertDatabaseHas('categories', ['id' => $cat->id]);
    }
}

<?php

namespace Tests\Feature\Product;

use App\Enums\UserRole;
use App\Models\Brand;
use App\Models\Category;
use App\Models\ChannelDefinition;
use App\Models\Product;
use App\Models\ProductAttribute;
use App\Models\ProductPhoto;
use App\Models\Store;
use App\Models\User;
use App\Services\Product\ProductService;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class ProductApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_rejected_from_all_product_endpoints(): void
    {
        $this->getJson('/products')->assertStatus(401);
        $this->postJson('/products', ['name' => 'Guest Product'])->assertStatus(401);
        $this->getJson('/products/1')->assertStatus(401);
        $this->patchJson('/products/1', ['name' => 'Guest Product'])->assertStatus(401);
    }

    public function test_admin_is_rejected_from_all_product_endpoints(): void
    {
        $admin = User::factory()->admin()->create();
        $this->actingAs($admin, 'sanctum');

        $this->getJson('/products')->assertStatus(403);
        $this->postJson('/products', ['name' => 'Admin Product'])->assertStatus(403);
        $this->getJson('/products/1')->assertStatus(403);
        $this->patchJson('/products/1', ['name' => 'Admin Product'])->assertStatus(403);
    }

    public function test_customer_without_store_is_rejected_consistently(): void
    {
        $user = User::factory()->create(['role' => UserRole::Customer]);
        $this->actingAs($user, 'sanctum');

        $this->getJson('/products')
            ->assertStatus(404)
            ->assertJsonPath('code', 'store_not_found');
        $this->postJson('/products', ['name' => 'No Store'])
            ->assertStatus(404)
            ->assertJsonPath('code', 'store_not_found');
        $this->getJson('/products/1')
            ->assertStatus(404)
            ->assertJsonPath('code', 'store_not_found');
        $this->patchJson('/products/1', ['name' => 'No Store'])
            ->assertStatus(404)
            ->assertJsonPath('code', 'store_not_found');
    }

    public function test_create_stores_a_draft_for_the_session_store(): void
    {
        [$user, $store] = $this->ownerWithStore();

        $this->actingAs($user, 'sanctum');

        $response = $this->postJson('/products', ['name' => 'Laptop Asus ROG']);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Laptop Asus ROG')
            ->assertJsonPath('data.slug', 'laptop-asus-rog')
            ->assertJsonPath('data.status', 'DRAFT')
            ->assertJsonPath('data.featured', false)
            ->assertJsonPath('data.store_id', 'store-a')
            ->assertJsonPath('data.category_id', null)
            ->assertJsonPath('data.category', null)
            ->assertJsonPath('data.brand_id', null)
            ->assertJsonPath('data.brand', null)
            ->assertJsonPath('data.condition', null)
            ->assertJsonPath('data.description', null)
            ->assertJsonPath('data.price', null)
            ->assertJsonPath('data.images', [])
            ->assertJsonPath('data.main_image', null)
            ->assertJsonPath('data.details', [])
            ->assertJsonPath('data.external_links', []);

        $product = Product::query()->sole();

        $this->assertSame($store->id, $product->store_id);
        $this->assertSame('DRAFT', $product->status);
        $this->assertFalse((bool) $product->is_featured);
        $this->assertNull($product->category_id);
        $this->assertNull($product->brand_id);
        $this->assertNull($product->description);
        $this->assertNull($product->condition);
        $this->assertNull($product->price);
    }

    public function test_price_zero_is_valid(): void
    {
        [$user] = $this->ownerWithStore();
        $this->actingAs($user, 'sanctum');

        $response = $this->postJson('/products', [
            'name' => 'Free Product',
            'price' => 0,
        ]);

        $response->assertStatus(201);
        $this->assertSame('0.00', $response->json('data.price'));
        $this->assertArrayNotHasKey('price_value', $response->json('data'));
        $this->assertSame(0.0, (float) Product::query()->sole()->price);
    }

    public function test_price_is_returned_as_a_decimal_string(): void
    {
        [$user] = $this->ownerWithStore();
        $this->actingAs($user, 'sanctum');

        $response = $this->postJson('/products', [
            'name' => 'Decimal Product',
            'price' => 1234.5,
        ]);

        $response->assertStatus(201);
        $this->assertSame('1234.50', $response->json('data.price'));
        $this->assertArrayNotHasKey('price_value', $response->json('data'));
    }

    public function test_empty_child_arrays_are_accepted(): void
    {
        [$user] = $this->ownerWithStore();
        $this->actingAs($user, 'sanctum');

        $this->postJson('/products', [
            'name' => 'Empty Children',
            'images' => [],
            'details' => [],
            'external_links' => [],
        ])->assertStatus(201);

        $product = Product::query()->sole();

        $this->assertSame(0, ProductPhoto::query()->where('product_id', $product->id)->count());
        $this->assertSame(0, ProductAttribute::query()->where('product_id', $product->id)->count());
        $this->assertDatabaseCount('product_external_links', 0);
    }

    public function test_category_and_brand_must_be_global_or_owned_by_the_session_store(): void
    {
        [$user, $store] = $this->ownerWithStore('store-a');
        [$otherUser, $otherStore] = $this->ownerWithStore('store-b');

        $globalCategory = Category::query()->create(['store_id' => null, 'parent_id' => null, 'name' => 'Global Category']);
        $globalBrand = Brand::query()->create(['store_id' => null, 'name' => 'Global Brand']);
        $ownCategory = Category::query()->create(['store_id' => $store->id, 'parent_id' => null, 'name' => 'Own Category']);
        $ownBrand = Brand::query()->create(['store_id' => $store->id, 'name' => 'Own Brand']);
        $otherCategory = Category::query()->create(['store_id' => $otherStore->id, 'parent_id' => null, 'name' => 'Other Category']);
        $otherBrand = Brand::query()->create(['store_id' => $otherStore->id, 'name' => 'Other Brand']);

        $this->actingAs($user, 'sanctum');

        $this->postJson('/products', [
            'name' => 'Global References',
            'category_id' => $globalCategory->id,
            'brand_id' => $globalBrand->id,
        ])->assertStatus(201)
            ->assertJsonPath('data.category_id', $globalCategory->id)
            ->assertJsonPath('data.category', 'Global Category')
            ->assertJsonPath('data.brand_id', $globalBrand->id)
            ->assertJsonPath('data.brand', 'Global Brand');

        $this->postJson('/products', [
            'name' => 'Own References',
            'category_id' => $ownCategory->id,
            'brand_id' => $ownBrand->id,
        ])->assertStatus(201);

        $this->postJson('/products', [
            'name' => 'Other Category',
            'category_id' => $otherCategory->id,
        ])->assertStatus(422)->assertJsonValidationErrors('category_id');

        $this->postJson('/products', [
            'name' => 'Other Brand',
            'brand_id' => $otherBrand->id,
        ])->assertStatus(422)->assertJsonValidationErrors('brand_id');

        $this->postJson('/products', [
            'name' => 'Missing Category',
            'category_id' => 999999,
        ])->assertStatus(422)->assertJsonValidationErrors('category_id');

        $this->postJson('/products', [
            'name' => 'Missing Brand',
            'brand_id' => 999999,
        ])->assertStatus(422)->assertJsonValidationErrors('brand_id');
    }

    public function test_response_exposes_category_and_brand_ids(): void
    {
        [$user, $store] = $this->ownerWithStore();
        $category = Category::query()->create([
            'store_id' => $store->id,
            'parent_id' => null,
            'name' => 'Laptop',
        ]);
        $brand = Brand::query()->create([
            'store_id' => $store->id,
            'name' => 'Asus',
        ]);

        $this->actingAs($user, 'sanctum');

        $response = $this->postJson('/products', [
            'name' => 'Laptop Asus',
            'category_id' => $category->id,
            'brand_id' => $brand->id,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.category_id', $category->id)
            ->assertJsonPath('data.brand_id', $brand->id);

        $this->assertSame($category->id, $response->json('data.category_id'));
        $this->assertSame($brand->id, $response->json('data.brand_id'));
    }

    public function test_external_links_require_a_known_channel_and_reject_duplicates(): void
    {
        [$user] = $this->ownerWithStore();
        ChannelDefinition::query()->create(['id' => 'SHOPEE', 'name' => 'Shopee']);

        $this->actingAs($user, 'sanctum');

        $response = $this->postJson('/products', [
            'name' => 'Linked Product',
            'external_links' => [
                ['channel_id' => 'SHOPEE', 'url' => ''],
            ],
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.external_links.0.channel_id', 'SHOPEE')
            ->assertJsonPath('data.external_links.0.url', '');

        $link = $response->json('data.external_links.0');
        $this->assertSame(['channel_id', 'url'], array_keys($link));
        $this->assertArrayNotHasKey('name', $link);
        $this->assertArrayNotHasKey('platform_name', $link);
        $this->assertArrayNotHasKey('store_url', $link);

        $this->assertDatabaseHas('product_external_links', [
            'channel_id' => 'SHOPEE',
            'url' => '',
        ]);

        $this->postJson('/products', [
            'name' => 'Unknown Channel',
            'external_links' => [
                ['channel_id' => 'MISSING', 'url' => 'https://example.com/product'],
            ],
        ])->assertStatus(422)->assertJsonValidationErrors('external_links.0.channel_id');

        $duplicate = $this->postJson('/products', [
            'name' => 'Duplicate Channel',
            'external_links' => [
                ['channel_id' => 'SHOPEE', 'url' => 'https://example.com/one'],
                ['channel_id' => 'SHOPEE', 'url' => 'https://example.com/two'],
            ],
        ]);

        $duplicate->assertStatus(422);
        $this->assertTrue(
            collect(array_keys($duplicate->json('errors')))
                ->contains(fn (string $key): bool => str_starts_with($key, 'external_links.')),
        );
    }

    public function test_main_image_must_match_one_of_the_images(): void
    {
        [$user] = $this->ownerWithStore();
        $this->actingAs($user, 'sanctum');

        $this->postJson('/products', [
            'name' => 'Main Image Mismatch',
            'images' => ['https://example.com/one.jpg', 'https://example.com/two.jpg'],
            'main_image' => 'https://example.com/other.jpg',
        ])->assertStatus(422)->assertJsonValidationErrors('main_image');
    }

    public function test_user_cannot_read_or_update_a_product_from_another_store(): void
    {
        [$user] = $this->ownerWithStore('store-a');
        [$otherUser, $otherStore] = $this->ownerWithStore('store-b');
        $foreignProduct = $this->createStoredProduct($otherStore, ['name' => 'Foreign Product']);

        $this->actingAs($user, 'sanctum');

        $this->getJson('/products/'.$foreignProduct->id)
            ->assertStatus(404)
            ->assertJsonPath('code', 'product_not_found');

        $this->patchJson('/products/'.$foreignProduct->id, ['name' => 'Hijacked'])
            ->assertStatus(404)
            ->assertJsonPath('code', 'product_not_found');

        $this->assertSame('Foreign Product', $foreignProduct->fresh()->name);
    }

    public function test_list_only_returns_products_from_the_session_store(): void
    {
        [$user, $store] = $this->ownerWithStore('store-a');
        [$otherUser, $otherStore] = $this->ownerWithStore('store-b');

        $draft = $this->createStoredProduct($store, ['name' => 'Own Draft', 'status' => 'DRAFT']);
        $published = $this->createStoredProduct($store, ['name' => 'Own Published', 'status' => 'PUBLISHED']);
        $soldOut = $this->createStoredProduct($store, ['name' => 'Own Sold Out', 'status' => 'SOLD_OUT']);
        $archived = $this->createStoredProduct($store, ['name' => 'Own Archived', 'status' => 'ARCHIVED']);
        $foreign = $this->createStoredProduct($otherStore, ['name' => 'Foreign Product', 'status' => 'DRAFT']);

        $this->actingAs($user, 'sanctum');

        $response = $this->getJson('/products');

        $response->assertOk();
        $ids = collect($response->json('data'))->pluck('id')->all();

        $this->assertEqualsCanonicalizing(
            [$draft->id, $published->id, $soldOut->id, $archived->id],
            $ids,
        );
        $this->assertNotContains($foreign->id, $ids);
    }

    public function test_status_active_returns_only_published_products(): void
    {
        [$user, $store] = $this->ownerWithStore('store-a');
        [$otherUser, $otherStore] = $this->ownerWithStore('store-b');

        $this->createStoredProduct($store, ['name' => 'Draft Product', 'status' => 'DRAFT']);
        $published = $this->createStoredProduct($store, ['name' => 'Published Product', 'status' => 'PUBLISHED']);
        $this->createStoredProduct($store, ['name' => 'Sold Out Product', 'status' => 'SOLD_OUT']);
        $this->createStoredProduct($store, ['name' => 'Archived Product', 'status' => 'ARCHIVED']);
        $foreignPublished = $this->createStoredProduct($otherStore, ['name' => 'Foreign Published', 'status' => 'PUBLISHED']);

        $this->actingAs($user, 'sanctum');

        $response = $this->getJson('/products?status=active');

        $response->assertOk();
        $ids = collect($response->json('data'))->pluck('id')->all();

        $this->assertSame([$published->id], $ids);
        $this->assertNotContains($foreignPublished->id, $ids);
    }

    public function test_status_archived_returns_only_archived_products(): void
    {
        [$user, $store] = $this->ownerWithStore('store-a');
        [$otherUser, $otherStore] = $this->ownerWithStore('store-b');

        $this->createStoredProduct($store, ['name' => 'Draft Product', 'status' => 'DRAFT']);
        $this->createStoredProduct($store, ['name' => 'Published Product', 'status' => 'PUBLISHED']);
        $archived = $this->createStoredProduct($store, ['name' => 'Archived Product', 'status' => 'ARCHIVED']);
        $foreignArchived = $this->createStoredProduct($otherStore, ['name' => 'Foreign Archived', 'status' => 'ARCHIVED']);

        $this->actingAs($user, 'sanctum');

        $response = $this->getJson('/products?status=archived');

        $response->assertOk();
        $ids = collect($response->json('data'))->pluck('id')->all();

        $this->assertSame([$archived->id], $ids);
        $this->assertNotContains($foreignArchived->id, $ids);
    }

    public function test_unsupported_status_returns_validation_error(): void
    {
        [$user] = $this->ownerWithStore();
        $this->actingAs($user, 'sanctum');

        foreach (['draft', 'sold_out', 'unknown'] as $status) {
            $this->getJson('/products?status='.$status)
                ->assertStatus(422)
                ->assertJsonValidationErrors('status');
        }
    }

    public function test_server_managed_fields_are_rejected(): void
    {
        [$user] = $this->ownerWithStore();
        $this->actingAs($user, 'sanctum');

        $fields = [
            'id' => 1,
            'store_id' => 'other-store',
            'slug' => 'client-slug',
            'status' => 'PUBLISHED',
            'is_featured' => true,
            'featured' => true,
            'moderation_status' => 'APPROVED',
            'published_at' => '2026-01-01T00:00:00Z',
            'sold_out_at' => '2026-01-01T00:00:00Z',
            'archived_at' => '2026-01-01T00:00:00Z',
            'product_action' => 'BUY',
            'custom_action_text' => 'Client Action',
            'created_at' => '2026-01-01T00:00:00Z',
            'updated_at' => '2026-01-01T00:00:00Z',
        ];

        foreach ($fields as $field => $value) {
            $this->postJson('/products', [
                'name' => 'Managed '.$field,
                $field => $value,
            ])->assertStatus(422)->assertJsonValidationErrors($field);
        }
    }

    public function test_child_data_is_stored_in_order(): void
    {
        [$user] = $this->ownerWithStore();
        ChannelDefinition::query()->create(['id' => 'SHOPEE', 'name' => 'Shopee']);
        ChannelDefinition::query()->create(['id' => 'TOKOPEDIA', 'name' => 'Tokopedia']);

        $this->actingAs($user, 'sanctum');

        $response = $this->postJson('/products', [
            'name' => 'Gaming Laptop',
            'images' => [
                'https://example.com/a.jpg',
                'https://example.com/b.jpg',
                'https://example.com/c.jpg',
            ],
            'main_image' => 'https://example.com/b.jpg',
            'details' => [
                ['label' => 'RAM', 'value' => '16 GB'],
                ['label' => 'Storage', 'value' => '512 GB'],
            ],
            'external_links' => [
                ['channel_id' => 'SHOPEE', 'url' => 'https://shopee.example/product'],
                ['channel_id' => 'TOKOPEDIA', 'url' => 'https://tokopedia.example/product'],
            ],
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.images', [
                'https://example.com/a.jpg',
                'https://example.com/b.jpg',
                'https://example.com/c.jpg',
            ])
            ->assertJsonPath('data.main_image', 'https://example.com/b.jpg')
            ->assertJsonPath('data.details.0.label', 'RAM')
            ->assertJsonPath('data.details.1.label', 'Storage');

        $product = Product::query()->sole();
        $photos = $product->photos()->get();

        $this->assertSame([
            'https://example.com/a.jpg',
            'https://example.com/b.jpg',
            'https://example.com/c.jpg',
        ], $photos->pluck('url')->all());
        $this->assertSame([1, 2, 3], $photos->pluck('sort_order')->all());
        $this->assertSame([false, true, false], $photos->map(fn (ProductPhoto $photo): bool => $photo->is_main)->all());

        $this->assertSame(['RAM', 'Storage'], $product->productAttributes()->pluck('label')->all());
        $this->assertSame(['16 GB', '512 GB'], $product->productAttributes()->pluck('value')->all());

        $this->assertDatabaseHas('product_external_links', [
            'product_id' => $product->id,
            'channel_id' => 'SHOPEE',
            'url' => 'https://shopee.example/product',
        ]);
        $this->assertDatabaseHas('product_external_links', [
            'product_id' => $product->id,
            'channel_id' => 'TOKOPEDIA',
            'url' => 'https://tokopedia.example/product',
        ]);
    }

    public function test_update_without_child_keys_preserves_child_data(): void
    {
        [$user] = $this->ownerWithStore();
        ChannelDefinition::query()->create(['id' => 'SHOPEE', 'name' => 'Shopee']);

        $this->actingAs($user, 'sanctum');

        $created = $this->postJson('/products', [
            'name' => 'Original Product',
            'description' => 'Original Description',
            'condition' => 'NEW',
            'price' => 1500000,
            'images' => ['https://example.com/one.jpg'],
            'main_image' => 'https://example.com/one.jpg',
            'details' => [['label' => 'RAM', 'value' => '16 GB']],
            'external_links' => [['channel_id' => 'SHOPEE', 'url' => 'https://example.com/shopee']],
        ])->assertStatus(201);

        $productId = $created->json('data.id');

        $this->patchJson('/products/'.$productId, ['name' => 'Renamed Product'])
            ->assertOk()
            ->assertJsonPath('data.name', 'Renamed Product')
            ->assertJsonPath('data.description', 'Original Description')
            ->assertJsonPath('data.condition', 'NEW')
            ->assertJsonPath('data.price', '1500000.00')
            ->assertJsonPath('data.images', ['https://example.com/one.jpg'])
            ->assertJsonPath('data.details.0.label', 'RAM')
            ->assertJsonPath('data.external_links.0.channel_id', 'SHOPEE');

        $this->assertSame(1, ProductPhoto::query()->where('product_id', $productId)->count());
        $this->assertSame(1, ProductAttribute::query()->where('product_id', $productId)->count());
        $this->assertDatabaseHas('product_external_links', [
            'product_id' => $productId,
            'channel_id' => 'SHOPEE',
            'url' => 'https://example.com/shopee',
        ]);
    }

    public function test_update_with_child_keys_replaces_all_child_data(): void
    {
        [$user] = $this->ownerWithStore();
        ChannelDefinition::query()->create(['id' => 'SHOPEE', 'name' => 'Shopee']);
        ChannelDefinition::query()->create(['id' => 'LAZADA', 'name' => 'Lazada']);

        $this->actingAs($user, 'sanctum');

        $created = $this->postJson('/products', [
            'name' => 'Replace Children',
            'images' => ['https://example.com/old.jpg'],
            'main_image' => 'https://example.com/old.jpg',
            'details' => [['label' => 'Old', 'value' => 'Old Value']],
            'external_links' => [['channel_id' => 'SHOPEE', 'url' => 'https://example.com/old']],
        ])->assertStatus(201);

        $productId = $created->json('data.id');

        $this->patchJson('/products/'.$productId, [
            'images' => ['https://example.com/new-one.jpg', 'https://example.com/new-two.jpg'],
            'main_image' => 'https://example.com/new-two.jpg',
            'details' => [['label' => 'New', 'value' => 'New Value']],
            'external_links' => [['channel_id' => 'LAZADA', 'url' => 'https://example.com/new']],
        ])->assertOk()
            ->assertJsonPath('data.images', [
                'https://example.com/new-one.jpg',
                'https://example.com/new-two.jpg',
            ])
            ->assertJsonPath('data.main_image', 'https://example.com/new-two.jpg')
            ->assertJsonPath('data.details.0.label', 'New')
            ->assertJsonPath('data.external_links.0.channel_id', 'LAZADA');

        $this->assertDatabaseMissing('product_photos', [
            'product_id' => $productId,
            'url' => 'https://example.com/old.jpg',
        ]);
        $this->assertDatabaseMissing('product_attributes', [
            'product_id' => $productId,
            'label' => 'Old',
        ]);
        $this->assertDatabaseMissing('product_external_links', [
            'product_id' => $productId,
            'channel_id' => 'SHOPEE',
        ]);
        $this->assertSame(2, ProductPhoto::query()->where('product_id', $productId)->count());
        $this->assertSame(1, ProductAttribute::query()->where('product_id', $productId)->count());
        $this->assertSame(1, ProductPhoto::query()->where('product_id', $productId)->where('is_main', true)->count());
    }

    public function test_update_with_empty_child_arrays_clears_children(): void
    {
        [$user] = $this->ownerWithStore();
        ChannelDefinition::query()->create(['id' => 'SHOPEE', 'name' => 'Shopee']);

        $this->actingAs($user, 'sanctum');

        $created = $this->postJson('/products', [
            'name' => 'Clear Children',
            'images' => ['https://example.com/one.jpg'],
            'main_image' => 'https://example.com/one.jpg',
            'details' => [['label' => 'RAM', 'value' => '16 GB']],
            'external_links' => [['channel_id' => 'SHOPEE', 'url' => 'https://example.com/shopee']],
        ])->assertStatus(201);

        $productId = $created->json('data.id');

        $this->patchJson('/products/'.$productId, [
            'images' => [],
            'details' => [],
            'external_links' => [],
        ])->assertOk()
            ->assertJsonPath('data.images', [])
            ->assertJsonPath('data.main_image', null)
            ->assertJsonPath('data.details', [])
            ->assertJsonPath('data.external_links', []);

        $this->assertSame(0, ProductPhoto::query()->where('product_id', $productId)->count());
        $this->assertSame(0, ProductAttribute::query()->where('product_id', $productId)->count());
        $this->assertDatabaseCount('product_external_links', 0);
    }

    public function test_only_draft_products_can_be_updated(): void
    {
        [$user, $store] = $this->ownerWithStore();
        $this->actingAs($user, 'sanctum');

        foreach (['PUBLISHED', 'SOLD_OUT', 'ARCHIVED'] as $status) {
            $product = $this->createStoredProduct($store, [
                'name' => 'Status '.$status,
                'status' => $status,
            ]);

            $this->patchJson('/products/'.$product->id, ['name' => 'Changed'])
                ->assertStatus(409)
                ->assertJsonPath('code', 'product_not_draft');

            $this->assertSame('Status '.$status, $product->fresh()->name);
        }
    }

    public function test_child_insert_failure_rolls_back_product_creation(): void
    {
        [$user] = $this->ownerWithStore();
        ChannelDefinition::query()->create(['id' => 'SHOPEE', 'name' => 'Shopee']);

        $service = app(ProductService::class);

        try {
            $service->create($user, [
                'name' => 'Rollback Create',
                'external_links' => [
                    ['channel_id' => 'SHOPEE', 'url' => 'https://example.com/one'],
                    ['channel_id' => 'SHOPEE', 'url' => 'https://example.com/two'],
                ],
            ]);

            $this->fail('Expected the duplicate child insert to fail.');
        } catch (QueryException) {
            $this->assertSame(0, Product::query()->count());
            $this->assertDatabaseCount('product_external_links', 0);
        }
    }

    public function test_child_insert_failure_rolls_back_product_update(): void
    {
        [$user, $store] = $this->ownerWithStore();
        ChannelDefinition::query()->create(['id' => 'SHOPEE', 'name' => 'Shopee']);

        $product = $this->createStoredProduct($store, ['name' => 'Original Product']);
        $product->externalLinks()->attach('SHOPEE', ['url' => 'https://example.com/original']);

        $service = app(ProductService::class);

        try {
            $service->update($user, $product, [
                'name' => 'Changed Product',
                'external_links' => [
                    ['channel_id' => 'SHOPEE', 'url' => 'https://example.com/one'],
                    ['channel_id' => 'SHOPEE', 'url' => 'https://example.com/two'],
                ],
            ]);

            $this->fail('Expected the duplicate child insert to fail.');
        } catch (QueryException) {
            $this->assertSame('Original Product', $product->fresh()->name);
            $this->assertDatabaseHas('product_external_links', [
                'product_id' => $product->id,
                'channel_id' => 'SHOPEE',
                'url' => 'https://example.com/original',
            ]);
        }
    }

    public function test_response_does_not_leak_internal_fields(): void
    {
        [$user] = $this->ownerWithStore();
        $this->actingAs($user, 'sanctum');

        $response = $this->postJson('/products', ['name' => 'Internal Fields']);

        $response->assertStatus(201);
        $data = $response->json('data');

        $this->assertSame('store-a', $data['store_id']);
        $this->assertArrayHasKey('featured', $data);
        $this->assertArrayHasKey('category_id', $data);
        $this->assertArrayHasKey('brand_id', $data);
        $this->assertNull($data['category_id']);
        $this->assertNull($data['brand_id']);
        $this->assertArrayNotHasKey('is_featured', $data);
        $this->assertArrayNotHasKey('price_value', $data);
        $this->assertArrayNotHasKey('moderation_status', $data);
        $this->assertArrayNotHasKey('product_action', $data);
        $this->assertArrayNotHasKey('custom_action_text', $data);
        $this->assertArrayNotHasKey('store', $data);
    }

    public function test_slug_collision_adds_incrementing_suffix(): void
    {
        [$user, $store] = $this->ownerWithStore();
        $this->actingAs($user, 'sanctum');

        $this->postJson('/products', ['name' => 'Sepatu'])
            ->assertStatus(201)
            ->assertJsonPath('data.slug', 'sepatu');

        $this->postJson('/products', ['name' => 'Sepatu'])
            ->assertStatus(201)
            ->assertJsonPath('data.slug', 'sepatu-2');

        $this->postJson('/products', ['name' => 'Sepatu'])
            ->assertStatus(201)
            ->assertJsonPath('data.slug', 'sepatu-3');

        $this->assertSame(
            ['sepatu', 'sepatu-2', 'sepatu-3'],
            Product::query()->where('store_id', $store->id)->orderBy('id')->pluck('slug')->all(),
        );
    }

    public function test_slug_does_not_change_when_name_is_edited(): void
    {
        [$user] = $this->ownerWithStore();
        $this->actingAs($user, 'sanctum');

        $created = $this->postJson('/products', ['name' => 'Sepatu'])
            ->assertStatus(201)
            ->assertJsonPath('data.slug', 'sepatu');

        $productId = $created->json('data.id');

        $this->patchJson('/products/'.$productId, ['name' => 'Sepatu Baru'])
            ->assertOk()
            ->assertJsonPath('data.name', 'Sepatu Baru')
            ->assertJsonPath('data.slug', 'sepatu');

        $this->assertSame('sepatu', Product::query()->findOrFail($productId)->slug);
    }

    public function test_slug_is_unique_within_store(): void
    {
        [$user, $store] = $this->ownerWithStore();
        $this->actingAs($user, 'sanctum');

        $this->postJson('/products', ['name' => 'Tas'])
            ->assertStatus(201)
            ->assertJsonPath('data.slug', 'tas');

        $this->postJson('/products', ['name' => 'TAS'])
            ->assertStatus(201)
            ->assertJsonPath('data.slug', 'tas-2');

        $slugs = Product::query()->where('store_id', $store->id)->orderBy('id')->pluck('slug');

        $this->assertSame(['tas', 'tas-2'], $slugs->all());
        $this->assertSame($slugs->count(), $slugs->unique()->count());
    }

    public function test_slug_can_be_the_same_across_different_stores(): void
    {
        [$user, $store] = $this->ownerWithStore('store-a');
        [$otherUser, $otherStore] = $this->ownerWithStore('store-b');

        $this->actingAs($user, 'sanctum');

        $this->postJson('/products', ['name' => 'Sepatu'])
            ->assertStatus(201)
            ->assertJsonPath('data.slug', 'sepatu');

        $this->actingAs($otherUser, 'sanctum');

        $this->postJson('/products', ['name' => 'Sepatu'])
            ->assertStatus(201)
            ->assertJsonPath('data.slug', 'sepatu');

        $this->assertSame(1, Product::query()->where('store_id', $store->id)->count());
        $this->assertSame(1, Product::query()->where('store_id', $otherStore->id)->count());
    }

    /**
     * @return array{0: User, 1: Store}
     */
    private function ownerWithStore(string $storeId = 'store-a'): array
    {
        $user = User::factory()->create(['role' => UserRole::Customer]);
        $store = Store::factory()->create([
            'user_id' => $user->id,
            'store_id' => $storeId,
            'name' => 'Store '.$storeId,
        ]);

        return [$user, $store];
    }

    /**
     * @param  array<string, mixed>  $overrides
     */
    private function createStoredProduct(Store $store, array $overrides = []): Product
    {
        $name = (string) ($overrides['name'] ?? 'Existing Product');

        return Product::query()->create(array_merge([
            'store_id' => $store->id,
            'category_id' => null,
            'brand_id' => null,
            'name' => $name,
            'slug' => Str::slug($name).'-'.Str::lower(Str::random(6)),
            'description' => null,
            'condition' => null,
            'price' => null,
            'status' => 'DRAFT',
            'is_featured' => false,
        ], $overrides));
    }
}

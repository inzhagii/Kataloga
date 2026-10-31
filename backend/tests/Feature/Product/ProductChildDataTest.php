<?php

namespace Tests\Feature\Product;

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\ChannelDefinition;
use App\Models\Product;
use App\Models\ProductAttribute;
use App\Models\ProductPhoto;
use App\Models\Store;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\Feature\Product\Concerns\CreatesProducts;
use Tests\TestCase;

class ProductChildDataTest extends TestCase
{
    use CreatesProducts;
    use RefreshDatabase;

    public function test_product_photos_are_ordered_and_cast_main_photo_flag(): void
    {
        $product = $this->createStoreProduct();
        $third = ProductPhoto::query()->create([
            'product_id' => $product->id,
            'url' => 'https://example.com/third.jpg',
            'is_main' => false,
            'sort_order' => 3,
        ]);
        $first = ProductPhoto::query()->create([
            'product_id' => $product->id,
            'url' => 'https://example.com/first.jpg',
            'is_main' => true,
            'sort_order' => 1,
        ]);

        $photos = $product->photos()->get();

        $this->assertCount(2, $photos);
        $this->assertTrue($photos->first()->is($first));
        $this->assertTrue($photos->first()->is_main);
        $this->assertTrue($photos->last()->is($third));
        $this->assertFalse($photos->last()->is_main);
        $this->assertTrue($first->product->is($product));
    }

    public function test_product_attributes_can_be_created_without_type_or_unique_rules(): void
    {
        $product = $this->createStoreProduct();
        $first = ProductAttribute::query()->create([
            'product_id' => $product->id,
            'label' => 'RAM',
            'value' => '16 GB',
        ]);
        $second = ProductAttribute::query()->create([
            'product_id' => $product->id,
            'label' => 'RAM',
            'value' => '32 GB',
        ]);

        $attributes = $product->productAttributes()->get();

        $this->assertCount(2, $attributes);
        $this->assertTrue($attributes->contains($first));
        $this->assertTrue($attributes->contains($second));
        $this->assertTrue($first->product->is($product));
    }

    public function test_product_external_links_reference_channel_master_without_per_reference_id(): void
    {
        $product = $this->createStoreProduct();
        $channel = ChannelDefinition::query()->create([
            'id' => 'SHOPEE',
            'name' => 'Shopee',
        ]);

        $product->externalLinks()->attach($channel->id, [
            'url' => 'https://shopee.example/product',
        ]);

        $link = $product->fresh()->externalLinks()->first();

        $this->assertNotNull($link);
        $this->assertTrue($link->is($channel));
        $this->assertSame('https://shopee.example/product', $link->pivot->url);
        $this->assertFalse(Schema::hasColumn('product_external_links', 'id'));
        $this->assertFalse(Schema::hasColumn('product_external_links', 'name'));
        $this->assertFalse(Schema::hasColumn('product_external_links', 'logo_url'));
        $this->assertFalse(Schema::hasColumn('product_external_links', 'display_order'));
    }

    public function test_duplicate_external_channel_for_a_product_is_rejected(): void
    {
        $product = $this->createStoreProduct();
        $channel = ChannelDefinition::query()->create([
            'id' => 'SHOPEE',
            'name' => 'Shopee',
        ]);
        $product->externalLinks()->attach($channel->id, [
            'url' => 'https://shopee.example/one',
        ]);

        $this->expectException(QueryException::class);

        $product->externalLinks()->attach($channel->id, [
            'url' => 'https://shopee.example/two',
        ]);
    }

    public function test_external_link_channel_must_exist(): void
    {
        $product = $this->createStoreProduct();

        $this->expectException(QueryException::class);

        $product->externalLinks()->attach('MISSING', [
            'url' => 'https://example.com/product',
        ]);
    }

    public function test_channel_with_product_external_link_cannot_be_deleted(): void
    {
        $product = $this->createStoreProduct();
        $channel = ChannelDefinition::query()->create([
            'id' => 'SHOPEE',
            'name' => 'Shopee',
        ]);
        $product->externalLinks()->attach($channel->id, [
            'url' => 'https://shopee.example/product',
        ]);

        $this->expectException(QueryException::class);

        $channel->delete();
    }

    public function test_deleting_product_cascades_child_data(): void
    {
        $product = $this->createStoreProduct();
        $channel = ChannelDefinition::query()->create([
            'id' => 'SHOPEE',
            'name' => 'Shopee',
        ]);
        ProductPhoto::query()->create([
            'product_id' => $product->id,
            'url' => 'https://example.com/photo.jpg',
            'is_main' => true,
            'sort_order' => 1,
        ]);
        ProductAttribute::query()->create([
            'product_id' => $product->id,
            'label' => 'RAM',
            'value' => '16 GB',
        ]);
        $product->externalLinks()->attach($channel->id, [
            'url' => 'https://shopee.example/product',
        ]);

        $product->delete();

        $this->assertDatabaseMissing('product_photos', ['product_id' => $product->id]);
        $this->assertDatabaseMissing('product_attributes', ['product_id' => $product->id]);
        $this->assertDatabaseMissing('product_external_links', ['product_id' => $product->id]);
        $this->assertDatabaseHas('channel_definitions', ['id' => 'SHOPEE']);
    }

    private function createStoreProduct(): Product
    {
        $owner = User::factory()->create(['role' => UserRole::Customer]);
        $store = Store::factory()->create([
            'user_id' => $owner->id,
            'store_id' => 'store-a',
            'name' => 'Store A',
        ]);
        $category = Category::query()->create([
            'store_id' => $store->id,
            'parent_id' => null,
            'name' => 'Laptop',
        ]);

        return $this->createProduct($store, $category);
    }
}

<?php

namespace App\Http\Resources;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class ProductResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var Product $product */
        $product = $this->resource;

        $photos = $product->photos;
        $mainPhoto = $photos->firstWhere('is_main', true);

        return [
            'id' => $product->id,
            'store_id' => $product->store?->store_id,
            'name' => $product->name,
            'slug' => $product->slug,
            'images' => $photos->pluck('url')->values()->all(),
            'main_image' => $mainPhoto?->url,
            'category_id' => $product->category_id,
            'category' => $product->category?->name,
            'brand_id' => $product->brand_id,
            'brand' => $product->brand?->name,
            'condition' => $product->condition,
            'price' => $product->price,
            'details' => $product->productAttributes
                ->map(static fn ($attribute): array => [
                    'label' => $attribute->label,
                    'value' => $attribute->value,
                ])
                ->values()
                ->all(),
            'description' => $product->description,
            'external_links' => $product->externalLinks
                ->map(static fn ($channel): array => [
                    'channel_id' => $channel->id,
                    'url' => $channel->pivot->url,
                ])
                ->values()
                ->all(),
            'status' => $product->status,
            'featured' => (bool) $product->is_featured,
            'created_at' => $product->created_at?->toISOString(),
            'updated_at' => $product->updated_at?->toISOString(),
            'published_at' => $product->published_at?->toISOString(),
            'sold_out_at' => $product->sold_out_at?->toISOString(),
            'archived_at' => $product->archived_at?->toISOString(),
        ];
    }
}

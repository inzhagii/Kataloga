<?php

namespace App\Http\Resources;

use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class StoreResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var Store $store */
        $store = $this->resource;

        return [
            'store_id' => $store->store_id,
            'name' => $store->name,
            'logo_url' => $store->logo_url,
            'description' => $store->description,
            'province' => $store->province,
            'city' => $store->city,
            'full_address' => $store->full_address,
            'whatsapp' => $store->whatsapp,
            'last_store_id_change' => $store->last_store_id_change?->toISOString(),
            'created_at' => $store->created_at?->toISOString(),
        ];
    }
}

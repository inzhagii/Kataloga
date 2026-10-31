<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var User $user */
        $user = $this->resource;

        $store = $user->relationLoaded('store') ? $user->store : $user->store;

        return [
            'id' => $user->id,
            'email' => $user->email,
            'phone' => $user->phone,
            'name' => $user->name,
            'has_store' => $store !== null,
            'store_id' => $store?->store_id,
            'avatar_url' => null,
            'email_verified' => $user->email_verified_at !== null,
            'recovery_email' => null,
            'recovery_email_verified' => false,
        ];
    }
}

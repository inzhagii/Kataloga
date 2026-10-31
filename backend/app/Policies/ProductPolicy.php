<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role !== UserRole::Admin;
    }

    public function view(User $user, Product $product): bool
    {
        if ($user->role === UserRole::Admin) {
            return false;
        }

        $store = $user->store;

        return $store !== null && $product->store_id === $store->id;
    }

    public function create(User $user): bool
    {
        return $user->role !== UserRole::Admin;
    }

    public function update(User $user, Product $product): bool
    {
        if ($user->role === UserRole::Admin) {
            return false;
        }

        $store = $user->store;

        return $store !== null && $product->store_id === $store->id;
    }
}

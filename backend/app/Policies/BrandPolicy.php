<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Brand;
use App\Models\User;

class BrandPolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, Brand $brand): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        if ($user->role === UserRole::Admin) {
            return false;
        }

        return true;
    }

    public function update(User $user, Brand $brand): bool
    {
        if ($brand->isGlobal()) {
            return false;
        }

        if ($user->role === UserRole::Admin) {
            return false;
        }

        $store = $user->store;

        if ($store === null) {
            return false;
        }

        return $brand->store_id === $store->id;
    }

    public function delete(User $user, Brand $brand): bool
    {
        if ($brand->isGlobal()) {
            return false;
        }

        if ($user->role === UserRole::Admin) {
            return false;
        }

        $store = $user->store;

        if ($store === null) {
            return false;
        }

        return $brand->store_id === $store->id;
    }
}

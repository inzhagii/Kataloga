<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\User;

class CategoryPolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, Category $category): bool
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

    public function update(User $user, Category $category): bool
    {
        if ($category->isGlobal()) {
            return false;
        }

        if ($user->role === UserRole::Admin) {
            return false;
        }

        $store = $user->store;

        if ($store === null) {
            return false;
        }

        return $category->store_id === $store->id;
    }

    public function delete(User $user, Category $category): bool
    {
        if ($category->isGlobal()) {
            return false;
        }

        if ($user->role === UserRole::Admin) {
            return false;
        }

        $store = $user->store;

        if ($store === null) {
            return false;
        }

        return $category->store_id === $store->id;
    }
}

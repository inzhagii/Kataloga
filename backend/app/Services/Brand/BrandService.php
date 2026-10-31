<?php

namespace App\Services\Brand;

use App\Enums\UserRole;
use App\Exceptions\ApiException;
use App\Models\Brand;
use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

final class BrandService
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function create(User $user, array $data): Brand
    {
        if ($user->role->value === 'ADMIN' || $user->role === UserRole::Admin) {
            throw ApiException::adminForbidden();
        }

        $store = $user->store;

        if ($store === null) {
            throw ApiException::storeNotFound();
        }

        try {
            return DB::transaction(function () use ($store, $data): Brand {
                return Brand::query()->create([
                    'store_id' => $store->id,
                    'name' => trim((string) $data['name']),
                ]);
            });
        } catch (UniqueConstraintViolationException) {
            throw ApiException::error(
                'Nama brand sudah digunakan dalam scope ini.',
                ['name' => ['Nama brand sudah digunakan dalam scope ini.']],
                'identifier_already_exists',
                409,
            );
        }
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Brand $brand, array $data): Brand
    {
        if ($brand->isGlobal()) {
            throw new ApiException(403, 'forbidden', 'Brand global tidak dapat diubah.');
        }

        try {
            return DB::transaction(function () use ($brand, $data): Brand {
                $brand->refresh();

                if (array_key_exists('name', $data)) {
                    $brand->name = trim((string) $data['name']);
                }

                $brand->save();

                return $brand;
            });
        } catch (UniqueConstraintViolationException) {
            throw ApiException::error(
                'Nama brand sudah digunakan dalam scope ini.',
                ['name' => ['Nama brand sudah digunakan dalam scope ini.']],
                'identifier_already_exists',
                409,
            );
        }
    }

    public function delete(Brand $brand): void
    {
        if ($brand->isGlobal()) {
            throw new ApiException(403, 'forbidden', 'Brand global tidak dapat dihapus.');
        }

        if (! Schema::hasTable('products') || ! Schema::hasColumn('products', 'brand_id')) {
            throw new ApiException(409, 'brand_in_use', 'Brand tidak dapat dihapus karena masih digunakan oleh produk.');
        }

        if (DB::table('products')->where('brand_id', $brand->id)->exists()) {
            throw new ApiException(409, 'brand_in_use', 'Brand tidak dapat dihapus karena masih digunakan oleh produk.');
        }
    }
}

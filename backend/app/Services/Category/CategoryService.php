<?php

namespace App\Services\Category;

use App\Enums\UserRole;
use App\Exceptions\ApiException;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

final class CategoryService
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function create(User $user, array $data): Category
    {
        if ($user->role->value === 'ADMIN' || $user->role === UserRole::Admin) {
            throw ApiException::adminForbidden();
        }

        $store = $user->store;

        if ($store === null) {
            throw ApiException::storeNotFound();
        }

        $parentId = $data['parent_id'] ?? null;

        $parent = null;
        if ($parentId !== null && $parentId !== '') {
            $parent = Category::query()->find((int) $parentId);

            if ($parent === null) {
                throw ApiException::error(
                    'Kategori induk tidak valid.',
                    ['parent_id' => ['Kategori induk tidak valid.']],
                    'validation_error',
                    422,
                );
            }

            if ($parent->parent_id !== null) {
                throw ApiException::error(
                    'Subkategori hanya boleh memiliki kategori utama sebagai parent.',
                    ['parent_id' => ['Subkategori hanya boleh memiliki kategori utama sebagai parent.']],
                    'validation_error',
                    422,
                );
            }

            if ((int) $parent->store_id !== (int) $store->id) {
                throw ApiException::error(
                    'Parent dan child harus berada pada scope yang sama.',
                    ['parent_id' => ['Parent dan child harus berada pada scope yang sama.']],
                    'validation_error',
                    422,
                );
            }
        }

        try {
            return DB::transaction(function () use ($store, $data, $parentId): Category {
                return Category::query()->create([
                    'store_id' => $store->id,
                    'parent_id' => $parentId === null || $parentId === '' ? null : (int) $parentId,
                    'name' => trim((string) $data['name']),
                ]);
            });
        } catch (UniqueConstraintViolationException) {
            throw ApiException::error(
                'Nama kategori sudah digunakan dalam scope ini.',
                ['name' => ['Nama kategori sudah digunakan dalam scope ini.']],
                'identifier_already_exists',
                409,
            );
        }
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Category $category, array $data): Category
    {
        if ($category->isGlobal()) {
            throw new ApiException(403, 'forbidden', 'Kategori global tidak dapat diubah.');
        }

        if (array_key_exists('parent_id', $data) && $data['parent_id'] !== null && $data['parent_id'] !== '') {
            // Prevent making a category with children into a subcategory (max 2 levels).
            if ($category->children()->exists()) {
                throw ApiException::error(
                    'Kategori yang memiliki subkategori tidak dapat dijadikan subkategori.',
                    ['parent_id' => ['Kategori yang memiliki subkategori tidak dapat dijadikan subkategori.']],
                    'validation_error',
                    422,
                );
            }

            $parent = Category::query()->find((int) $data['parent_id']);

            if ($parent === null) {
                throw ApiException::error(
                    'Kategori induk tidak valid.',
                    ['parent_id' => ['Kategori induk tidak valid.']],
                    'validation_error',
                    422,
                );
            }

            if ((int) $data['parent_id'] === $category->id) {
                throw ApiException::error(
                    'Kategori tidak dapat menjadi parent dari dirinya sendiri.',
                    ['parent_id' => ['Kategori tidak dapat menjadi parent dari dirinya sendiri.']],
                    'validation_error',
                    422,
                );
            }

            if ($parent->parent_id !== null) {
                throw ApiException::error(
                    'Subkategori hanya boleh memiliki kategori utama sebagai parent.',
                    ['parent_id' => ['Subkategori hanya boleh memiliki kategori utama sebagai parent.']],
                    'validation_error',
                    422,
                );
            }

            if ((int) $parent->store_id !== (int) $category->store_id) {
                throw ApiException::error(
                    'Parent dan child harus berada pada scope yang sama.',
                    ['parent_id' => ['Parent dan child harus berada pada scope yang sama.']],
                    'validation_error',
                    422,
                );
            }
        }

        try {
            return DB::transaction(function () use ($category, $data): Category {
                $category->refresh();

                if (array_key_exists('name', $data)) {
                    $category->name = trim((string) $data['name']);
                }

                if (array_key_exists('parent_id', $data)) {
                    if ($data['parent_id'] === null || $data['parent_id'] === '') {
                        $category->parent_id = null;
                    } else {
                        $category->parent_id = (int) $data['parent_id'];
                    }
                }

                $category->save();

                return $category;
            });
        } catch (UniqueConstraintViolationException) {
            throw ApiException::error(
                'Nama kategori sudah digunakan dalam scope ini.',
                ['name' => ['Nama kategori sudah digunakan dalam scope ini.']],
                'identifier_already_exists',
                409,
            );
        }
    }

    public function delete(Category $category): void
    {
        if ($category->isGlobal()) {
            throw new ApiException(403, 'forbidden', 'Kategori global tidak dapat dihapus.');
        }

        if ($category->children()->exists()) {
            throw new ApiException(409, 'category_has_children', 'Kategori tidak dapat dihapus karena masih memiliki subkategori.');
        }

        // Fail-safe: do not allow delete if product references cannot be verified.
        if (! Schema::hasTable('products') || ! Schema::hasColumn('products', 'category_id')) {
            throw new ApiException(409, 'category_in_use', 'Kategori tidak dapat dihapus karena masih digunakan oleh produk.');
        }

        if (DB::table('products')->where('category_id', $category->id)->exists()) {
            throw new ApiException(409, 'category_in_use', 'Kategori tidak dapat dihapus karena masih digunakan oleh produk.');
        }
    }
}

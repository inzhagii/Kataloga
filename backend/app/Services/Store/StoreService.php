<?php

namespace App\Services\Store;

use App\Enums\UserRole;
use App\Exceptions\ApiException;
use App\Models\Store;
use App\Models\StoreAlias;
use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;

final class StoreService
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function create(User $user, array $data): Store
    {
        if ($user->role === UserRole::Admin) {
            throw ApiException::adminForbidden();
        }

        if ($user->store()->exists()) {
            throw ApiException::storeAlreadyExists();
        }

        $storeId = strtolower(trim((string) $data['store_id']));

        if ($this->isStoreIdTaken($storeId)) {
            throw ApiException::storeIdTaken();
        }

        try {
            return DB::transaction(function () use ($user, $data, $storeId): Store {
                if ($user->store()->exists()) {
                    throw ApiException::storeAlreadyExists();
                }

                if ($this->isStoreIdTaken($storeId)) {
                    throw ApiException::storeIdTaken();
                }

                return Store::query()->create([
                    'user_id' => $user->id,
                    'store_id' => $storeId,
                    'name' => (string) $data['name'],
                    'logo_url' => $data['logo_url'] ?? null,
                    'description' => $data['description'] ?? null,
                    'province' => $data['province'] ?? null,
                    'city' => $data['city'] ?? null,
                    'full_address' => $data['full_address'] ?? null,
                    'whatsapp' => $data['whatsapp'] ?? null,
                    'last_store_id_change' => null,
                ]);
            });
        } catch (UniqueConstraintViolationException) {
            if ($user->store()->exists()) {
                throw ApiException::storeAlreadyExists();
            }

            throw ApiException::storeIdTaken();
        }
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Store $store, array $data): Store
    {
        try {
            return DB::transaction(function () use ($store, $data): Store {
                /** @var Store $lockedStore */
                $lockedStore = Store::query()
                    ->where('id', $store->id)
                    ->lockForUpdate()
                    ->firstOrFail();

                if (isset($data['store_id'])) {
                    $nextStoreId = strtolower(trim((string) $data['store_id']));

                    if ($nextStoreId !== $lockedStore->store_id) {
                        if ($lockedStore->last_store_id_change !== null) {
                            $nextAllowedChange = $lockedStore->last_store_id_change->addDays(30);
                            if (now()->lt($nextAllowedChange)) {
                                throw ApiException::storeIdCooldown();
                            }
                        }

                        if ($this->isStoreIdTaken($nextStoreId, $lockedStore->id)) {
                            throw ApiException::storeIdTaken();
                        }

                        StoreAlias::query()->create([
                            'store_id' => $lockedStore->id,
                            'alias' => $lockedStore->store_id,
                            'expires_at' => now()->addDays(90),
                        ]);

                        $lockedStore->store_id = $nextStoreId;
                        $lockedStore->last_store_id_change = now();
                    }
                }

                $fillableFields = [
                    'name',
                    'logo_url',
                    'description',
                    'province',
                    'city',
                    'full_address',
                    'whatsapp',
                ];

                foreach ($fillableFields as $field) {
                    if (array_key_exists($field, $data)) {
                        $lockedStore->{$field} = $data[$field];
                    }
                }

                $lockedStore->save();

                return $lockedStore;
            });
        } catch (UniqueConstraintViolationException) {
            throw ApiException::storeIdTaken();
        }
    }

    public function isStoreIdTaken(string $storeId, ?int $ignoreStoreId = null): bool
    {
        $normalized = strtolower(trim($storeId));

        $storeQuery = Store::query()->whereRaw('LOWER(store_id) = ?', [$normalized]);

        if ($ignoreStoreId !== null) {
            $storeQuery->where('id', '!=', $ignoreStoreId);
        }

        if ($storeQuery->exists()) {
            return true;
        }

        return StoreAlias::query()
            ->whereRaw('LOWER(alias) = ?', [$normalized])
            ->where('expires_at', '>', now())
            ->exists();
    }
}

<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Http\Requests\Store\CreateStoreRequest;
use App\Http\Requests\Store\UpdateStoreRequest;
use App\Http\Resources\StoreResource;
use App\Models\User;
use App\Services\Store\StoreService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class StoreController extends Controller
{
    public function __construct(private StoreService $storeService) {}

    public function store(CreateStoreRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $store = $this->storeService->create($user, $request->validated());

        return ApiResponse::success(
            (new StoreResource($store))->resolve(),
            'Toko berhasil dibuat.',
            201,
        );
    }

    public function me(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $store = $user->store;

        if ($store === null) {
            return ApiResponse::success(null, 'OK');
        }

        return ApiResponse::success(
            (new StoreResource($store))->resolve(),
            'OK',
        );
    }

    public function update(UpdateStoreRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $store = $user->store;

        if ($store === null) {
            return ApiResponse::error(
                'Toko tidak ditemukan.',
                [],
                'store_not_found',
                404,
            );
        }

        $updated = $this->storeService->update($store, $request->validated());

        return ApiResponse::success(
            (new StoreResource($updated))->resolve(),
            'Toko berhasil diperbarui.',
        );
    }

    public function availability(Request $request): JsonResponse
    {
        $storeId = $request->query('store_id', '');

        if (! is_string($storeId) || trim($storeId) === '') {
            return ApiResponse::error(
                'Parameter store_id wajib diisi.',
                ['store_id' => ['Parameter store_id wajib diisi.']],
                'validation_error',
                422,
            );
        }

        $available = ! $this->storeService->isStoreIdTaken(
            strtolower(trim($storeId)),
        );

        return ApiResponse::success(['available' => $available]);
    }
}

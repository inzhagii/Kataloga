<?php

namespace App\Http\Controllers\Brand;

use App\Http\Controllers\Controller;
use App\Http\Requests\Brand\StoreBrandRequest;
use App\Http\Requests\Brand\UpdateBrandRequest;
use App\Http\Resources\BrandResource;
use App\Models\Brand;
use App\Models\User;
use App\Services\Brand\BrandService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class BrandController extends Controller
{
    public function __construct(private BrandService $brandService) {}

    public function index(Request $request): JsonResponse
    {
        $query = Brand::query()->orderBy('id');

        $user = $request->user();
        $store = $user?->store;

        if ($store === null) {
            $query->whereNull('store_id');
        } else {
            $query->where(function ($q) use ($store): void {
                $q->whereNull('store_id')
                    ->orWhere('store_id', $store->id);
            });
        }

        $brands = $query->get();

        return ApiResponse::success(
            BrandResource::collection($brands)->resolve($request),
            'OK',
        );
    }

    public function store(StoreBrandRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $this->authorize('create', Brand::class);

        $brand = $this->brandService->create($user, $request->validated());

        return ApiResponse::success(
            (new BrandResource($brand))->resolve($request),
            'Brand berhasil dibuat.',
            201,
        );
    }

    public function update(UpdateBrandRequest $request, int $id): JsonResponse
    {
        $brand = Brand::query()->findOrFail($id);
        $this->authorize('update', $brand);

        $brand = $this->brandService->update($brand, $request->validated());

        return ApiResponse::success(
            (new BrandResource($brand))->resolve($request),
            'Brand berhasil diperbarui.',
        );
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $brand = Brand::query()->findOrFail($id);
        $this->authorize('delete', $brand);

        $this->brandService->delete($brand);
        $brand->delete();

        return ApiResponse::success(['deleted' => true], 'Brand berhasil dihapus.');
    }
}

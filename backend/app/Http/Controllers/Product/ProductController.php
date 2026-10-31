<?php

namespace App\Http\Controllers\Product;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\User;
use App\Services\Product\ProductService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class ProductController extends Controller
{
    public function __construct(private ProductService $productService) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Product::class);

        /** @var User $user */
        $user = $request->user();
        $validated = $request->validate([
            'status' => ['nullable', 'string', 'in:active,archived'],
        ], [
            'status.in' => 'Status produk tidak valid.',
        ]);
        $products = $this->productService->list($user, $validated['status'] ?? null);

        return ApiResponse::success(
            ProductResource::collection($products)->resolve($request),
            'OK',
        );
    }

    public function show(Request $request, int $productId): JsonResponse
    {
        $this->authorize('viewAny', Product::class);

        /** @var User $user */
        $user = $request->user();
        $product = $this->productService->find($user, $productId);
        $this->authorize('view', $product);

        return ApiResponse::success(
            (new ProductResource($product))->resolve($request),
            'OK',
        );
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $this->authorize('create', Product::class);

        /** @var User $user */
        $user = $request->user();
        $product = $this->productService->create($user, $request->validated());

        return ApiResponse::success(
            (new ProductResource($product))->resolve($request),
            'Produk berhasil dibuat.',
            201,
        );
    }

    public function update(UpdateProductRequest $request, int $productId): JsonResponse
    {
        $this->authorize('viewAny', Product::class);

        /** @var User $user */
        $user = $request->user();
        $product = $this->productService->find($user, $productId);
        $this->authorize('update', $product);

        $product = $this->productService->update($user, $product, $request->validated());

        return ApiResponse::success(
            (new ProductResource($product))->resolve($request),
            'Produk berhasil diperbarui.',
        );
    }
}

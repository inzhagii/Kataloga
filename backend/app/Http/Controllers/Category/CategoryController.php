<?php

namespace App\Http\Controllers\Category;

use App\Http\Controllers\Controller;
use App\Http\Requests\Category\StoreCategoryRequest;
use App\Http\Requests\Category\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Models\User;
use App\Services\Category\CategoryService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class CategoryController extends Controller
{
    public function __construct(private CategoryService $categoryService) {}

    public function index(Request $request): JsonResponse
    {
        $query = Category::query()->orderBy('id');

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

        $categories = $query->get();

        return ApiResponse::success(
            CategoryResource::collection($categories)->resolve($request),
            'OK',
        );
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $this->authorize('create', Category::class);

        $category = $this->categoryService->create($user, $request->validated());

        return ApiResponse::success(
            (new CategoryResource($category))->resolve($request),
            'Kategori berhasil dibuat.',
            201,
        );
    }

    public function update(UpdateCategoryRequest $request, int $id): JsonResponse
    {
        $category = Category::query()->findOrFail($id);
        $this->authorize('update', $category);

        $category = $this->categoryService->update($category, $request->validated());

        return ApiResponse::success(
            (new CategoryResource($category))->resolve($request),
            'Kategori berhasil diperbarui.',
        );
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $category = Category::query()->findOrFail($id);
        $this->authorize('delete', $category);

        $this->categoryService->delete($category);
        $category->delete();

        return ApiResponse::success(['deleted' => true], 'Kategori berhasil dihapus.');
    }
}

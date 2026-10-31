<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\Product\ProductController;
use App\Http\Controllers\Store\StoreController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function (): void {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:login');

    Route::post('email/verify', [EmailVerificationController::class, 'verify']);
    Route::post('email/verify/resend', [EmailVerificationController::class, 'resend'])
        ->middleware('throttle:otp-resend');

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);
    });
});

Route::prefix('stores')->group(function (): void {
    Route::get('availability', [StoreController::class, 'availability']);

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('/', [StoreController::class, 'store']);
        Route::get('me', [StoreController::class, 'me']);
        Route::patch('me', [StoreController::class, 'update']);
    });
});

use App\Http\Controllers\Brand\BrandController;
use App\Http\Controllers\Category\CategoryController;

Route::get('categories', [CategoryController::class, 'index']);
Route::get('brands', [BrandController::class, 'index']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::post('categories', [CategoryController::class, 'store']);
    Route::patch('categories/{id}', [CategoryController::class, 'update']);
    Route::delete('categories/{id}', [CategoryController::class, 'destroy']);

    Route::post('brands', [BrandController::class, 'store']);
    Route::patch('brands/{id}', [BrandController::class, 'update']);
    Route::delete('brands/{id}', [BrandController::class, 'destroy']);

    Route::get('products', [ProductController::class, 'index']);
    Route::post('products', [ProductController::class, 'store']);
    Route::get('products/{productId}', [ProductController::class, 'show'])->whereNumber('productId');
    Route::patch('products/{productId}', [ProductController::class, 'update'])->whereNumber('productId');
});

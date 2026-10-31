<?php

use App\Exceptions\ApiException;
use App\Http\Middleware\ForceJsonResponse;
use App\Support\ApiResponse;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        apiPrefix: '',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->statefulApi();
        $middleware->api(prepend: [
            ForceJsonResponse::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(fn (ApiException $exception) => $exception->render());

        $exceptions->render(function (AuthenticationException $exception, Request $request) {
            if ($request->is('auth*', 'stores*') || $request->expectsJson()) {
                return ApiResponse::error(
                    'Unauthenticated.',
                    [],
                    'unauthenticated',
                    401,
                );
            }
        });

        $exceptions->render(function (HttpException $exception, Request $request) {
            if ($exception->getStatusCode() === 419 && ($request->is('auth*', 'stores*') || $request->expectsJson())) {
                return ApiResponse::error(
                    'Sesi atau CSRF token kedaluwarsa.',
                    [],
                    'session_expired',
                    419,
                );
            }
        });

        $exceptions->render(function (ThrottleRequestsException $exception, Request $request) {
            if ($request->is('auth*', 'stores*') || $request->expectsJson()) {
                return ApiResponse::error(
                    'Terlalu banyak permintaan.',
                    [],
                    'rate_limit_exceeded',
                    429,
                    $exception->getHeaders(),
                );
            }
        });

        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->expectsJson() || $request->is(
                'auth*',
                'stores*',
                'products*',
                'categories*',
                'brands*',
                'activities*',
                'customer-interests*',
                'sanctum*',
            ),
        );
    })->create();

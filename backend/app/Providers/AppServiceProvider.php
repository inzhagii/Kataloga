<?php

namespace App\Providers;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Policies\BrandPolicy;
use App\Policies\CategoryPolicy;
use App\Policies\ProductPolicy;
use App\Services\Auth\IdentifierNormalizer;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Gate::policy(Category::class, CategoryPolicy::class);
        Gate::policy(Brand::class, BrandPolicy::class);
        Gate::policy(Product::class, ProductPolicy::class);

        RateLimiter::for('login', function (Request $request): array {
            $maxAttempts = (int) config('auth.kataloga.login.max_attempts', 5);
            $decayMinutes = (int) config('auth.kataloga.login.decay_minutes', 1);
            $identifier = IdentifierNormalizer::rateLimitKey($request->input('email_or_phone'));

            return [
                Limit::perMinutes($decayMinutes, $maxAttempts)->by('login:ip:'.$request->ip()),
                Limit::perMinutes($decayMinutes, $maxAttempts)->by('login:identifier:'.$identifier),
            ];
        });

        RateLimiter::for('otp-resend', function (Request $request): array {
            $maxAttempts = (int) config('auth.kataloga.otp.resend_max', 3);
            $decayMinutes = (int) config('auth.kataloga.otp.resend_window_minutes', 15);
            $email = IdentifierNormalizer::rateLimitKey($request->input('email'));

            return [
                Limit::perMinutes($decayMinutes, $maxAttempts)->by('otp-resend:email:'.$email),
                Limit::perMinutes($decayMinutes, $maxAttempts)->by('otp-resend:ip:'.$request->ip()),
            ];
        });
    }
}

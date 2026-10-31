<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Tests\TestCase;

class CsrfTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->app['env'] = 'local';
        Notification::fake();
    }

    public function test_stateful_request_without_csrf_token_returns_419(): void
    {
        $this->withHeader('Origin', 'http://localhost:5173')
            ->postJson('/auth/register', [
                'name' => 'CSRF User',
                'phone' => '081234567890',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ])
            ->assertStatus(419)
            ->assertJsonPath('code', 'session_expired');

        $this->assertDatabaseCount('users', 0);
    }

    public function test_frontend_xsrf_cookie_header_is_accepted(): void
    {
        $csrfResponse = $this->get('/sanctum/csrf-cookie');
        $csrfToken = $csrfResponse->getCookie('XSRF-TOKEN', decrypt: false)?->getValue();
        $sessionCookie = $csrfResponse->getCookie((string) config('session.cookie'))?->getValue();

        $this->assertNotNull($csrfToken);
        $this->assertNotNull($sessionCookie);

        $this->withCookie((string) config('session.cookie'), $sessionCookie)
            ->withHeaders([
                'Origin' => 'http://localhost:5173',
                'X-XSRF-TOKEN' => $csrfToken,
            ])
            ->postJson('/auth/register', [
                'phone' => '081234567890',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ])
            ->assertCreated();
    }

    public function test_stateful_request_with_a_valid_csrf_token_succeeds(): void
    {
        $token = Str::random(40);

        $this->withSession(['_token' => $token])
            ->withHeaders([
                'Origin' => 'http://localhost:5173',
                'X-CSRF-TOKEN' => $token,
            ])
            ->postJson('/auth/register', [
                'name' => 'CSRF User',
                'phone' => '081234567890',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ])
            ->assertCreated()
            ->assertJsonPath('data.user.phone', '+6281234567890');

        $this->assertDatabaseHas('users', ['phone' => '+6281234567890']);
    }
}

<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\Feature\Auth\Concerns\InteractsWithAuth;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use InteractsWithAuth, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withHeader('Origin', 'http://localhost:5173');

        Notification::fake();
    }

    public function test_verified_email_can_login_with_a_normalized_identifier(): void
    {
        $user = User::factory()->create([
            'email' => 'user@example.com',
            'password' => 'password123',
            'email_verified_at' => now(),
        ]);

        $response = $this->postJson('/auth/login', [
            'email_or_phone' => '  USER@EXAMPLE.COM  ',
            'password' => 'password123',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.id', $user->id)
            ->assertJsonPath('data.email', 'user@example.com')
            ->assertJsonPath('data.email_verified', true)
            ->assertJsonMissingPath('data.password');

        $this->withSessionFrom($response)
            ->getJson('/auth/me')
            ->assertOk()
            ->assertJsonPath('data.id', $user->id);
    }

    public function test_phone_can_login_with_an_indonesian_phone_number(): void
    {
        $user = User::factory()->create([
            'email' => null,
            'phone' => '+6281234567890',
            'password' => 'password123',
            'email_verified_at' => null,
        ]);

        $response = $this->postJson('/auth/login', [
            'email_or_phone' => '0812-3456-7890',
            'password' => 'password123',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.id', $user->id)
            ->assertJsonPath('data.phone', '+6281234567890');

        $this->withSessionFrom($response)
            ->getJson('/auth/me')
            ->assertOk()
            ->assertJsonPath('data.phone', '+6281234567890');
    }

    public function test_unknown_identifier_and_wrong_password_share_the_same_error(): void
    {
        User::factory()->create([
            'email' => 'user@example.com',
            'password' => 'password123',
        ]);

        $unknown = $this->postJson('/auth/login', [
            'email_or_phone' => 'unknown@example.com',
            'password' => 'password123',
        ]);

        $wrongPassword = $this->postJson('/auth/login', [
            'email_or_phone' => 'user@example.com',
            'password' => 'wrong-password',
        ]);

        $unknown->assertUnauthorized()->assertJsonPath('code', 'invalid_credentials');
        $wrongPassword->assertUnauthorized()->assertJsonPath('code', 'invalid_credentials');
        $this->assertSame($unknown->json('message'), $wrongPassword->json('message'));
    }

    public function test_unverified_email_cannot_login(): void
    {
        $user = User::factory()->create([
            'email' => 'unverified@example.com',
            'password' => 'password123',
            'email_verified_at' => null,
        ]);

        $this->postJson('/auth/login', [
            'email_or_phone' => 'unverified@example.com',
            'password' => 'password123',
        ])
            ->assertForbidden()
            ->assertJsonPath('code', 'email_unverified');

        $user->forceFill(['email_verified_at' => now()])->save();

        $this->postJson('/auth/login', [
            'email_or_phone' => 'unverified@example.com',
            'password' => 'password123',
        ])->assertOk();
    }

    public function test_array_identifier_is_rejected_as_a_validation_error(): void
    {
        $this->postJson('/auth/login', [
            'email_or_phone' => ['user@example.com'],
            'password' => 'password123',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email_or_phone']);
    }

    public function test_guest_cannot_access_the_current_user_endpoint(): void
    {
        $this->getJson('/auth/me')
            ->assertUnauthorized()
            ->assertJsonPath('code', 'unauthenticated');
    }

    public function test_logout_invalidates_the_session(): void
    {
        $user = User::factory()->create([
            'email' => null,
            'phone' => '+6281234567890',
            'password' => 'password123',
            'email_verified_at' => null,
        ]);

        $login = $this->postJson('/auth/login', [
            'email_or_phone' => '081234567890',
            'password' => 'password123',
        ])->assertOk();

        $this->withSessionFrom($login)
            ->postJson('/auth/logout')
            ->assertOk()
            ->assertJsonPath('data', null)
            ->assertJsonPath('message', 'Logout berhasil.');

        $this->app['auth']->forgetGuards();

        $this->withSessionFrom($login)
            ->getJson('/auth/me')
            ->assertUnauthorized()
            ->assertJsonPath('code', 'unauthenticated');

        $this->assertDatabaseHas('users', ['id' => $user->id]);
    }

    public function test_login_is_rate_limited_after_five_attempts(): void
    {
        User::factory()->create([
            'email' => null,
            'phone' => '+6281234567890',
            'password' => 'password123',
            'email_verified_at' => null,
        ]);

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postJson('/auth/login', [
                'email_or_phone' => '081234567890',
                'password' => 'wrong-password',
            ])->assertUnauthorized();
        }

        $this->postJson('/auth/login', [
            'email_or_phone' => '081234567890',
            'password' => 'password123',
        ])
            ->assertStatus(429)
            ->assertJsonPath('code', 'rate_limit_exceeded')
            ->assertHeader('Retry-After');
    }
}

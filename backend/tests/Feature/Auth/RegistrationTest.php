<?php

namespace Tests\Feature\Auth;

use App\Enums\UserRole;
use App\Models\OtpVerification;
use App\Models\User;
use App\Notifications\EmailVerificationOtpNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\Feature\Auth\Concerns\InteractsWithAuth;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use InteractsWithAuth, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withHeader('Origin', 'http://localhost:5173');

        Notification::fake();
    }

    public function test_email_registration_creates_an_unverified_customer_and_sends_an_otp(): void
    {
        $response = $this->postJson('/auth/register', [
            'name' => '  Test User  ',
            'email' => '  User@Example.COM  ',
            'phone' => null,
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.requires_verification', true)
            ->assertJsonPath('data.identifier', 'user@example.com')
            ->assertJsonPath('data.channel', 'email')
            ->assertJsonPath('data.user.email', 'user@example.com')
            ->assertJsonPath('data.user.name', 'Test User')
            ->assertJsonPath('data.user.has_store', false)
            ->assertJsonPath('data.user.store_id', null)
            ->assertJsonPath('data.user.email_verified', false)
            ->assertJsonPath('data.cooldown_seconds', 60)
            ->assertJsonMissingPath('data.user.password')
            ->assertJsonMissingPath('data.user.code')
            ->assertJsonMissingPath('data.user.code_hash');

        $user = User::query()->where('email', 'user@example.com')->firstOrFail();
        $otp = OtpVerification::query()->firstOrFail();

        $this->assertSame(UserRole::Customer, $user->role);
        $this->assertNull($user->email_verified_at);
        $this->assertTrue(Hash::check('password123', $user->password));
        $this->assertNotSame($otp->code_hash, $this->otpCodeFor($user));
        $this->assertTrue(Hash::check($this->otpCodeFor($user), $otp->code_hash));
        $this->assertSame(0, $otp->attempts);
        $this->assertNull($otp->consumed_at);
        $this->assertTrue($otp->expires_at->between(now()->addMinutes(9), now()->addMinutes(11)));
        $this->assertGuest('web');

        Notification::assertSentTo($user, EmailVerificationOtpNotification::class);
    }

    public function test_phone_registration_creates_an_active_customer_and_authenticates_the_session(): void
    {
        [$user, $response] = $this->registerPhone([
            'phone' => '0812-3456-7890',
        ]);

        $response->assertJsonPath('data.requires_verification', false)
            ->assertJsonPath('data.channel', 'phone')
            ->assertJsonPath('data.identifier', '+6281234567890')
            ->assertJsonPath('data.user.phone', '+6281234567890')
            ->assertJsonPath('data.user.email_verified', false)
            ->assertJsonMissingPath('data.expires_at');

        $this->assertSame(UserRole::Customer, $user->role);
        $this->assertNull($user->email);
        $this->assertNull($user->email_verified_at);
        Notification::assertNothingSent();

        $this->withSessionFrom($response)
            ->getJson('/auth/me')
            ->assertOk()
            ->assertJsonPath('data.id', $user->id)
            ->assertJsonPath('data.phone', '+6281234567890');
    }

    public function test_name_is_optional_and_stored_as_null_when_omitted(): void
    {
        $response = $this->postJson('/auth/register', [
            'email' => 'no-name@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.user.name', null)
            ->assertJsonPath('data.channel', 'email');

        $user = User::query()->where('email', 'no-name@example.com')->firstOrFail();

        $this->assertNull($user->name);
        $this->assertDatabaseCount('users', 1);
        $this->assertDatabaseCount('otp_verifications', 1);
        Notification::assertSentTo($user, EmailVerificationOtpNotification::class);
    }

    public function test_blank_name_is_stored_as_null(): void
    {
        $response = $this->postJson('/auth/register', [
            'name' => '   ',
            'phone' => '081234567890',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.user.name', null);

        $this->assertNull(User::query()->latest('id')->firstOrFail()->name);
    }

    public function test_email_and_phone_cannot_be_submitted_together(): void
    {
        $this->postJson('/auth/register', [
            'name' => 'Both Identifiers',
            'email' => 'both@example.com',
            'phone' => '081234567890',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);

        $this->assertDatabaseCount('users', 0);
        $this->assertDatabaseCount('otp_verifications', 0);
        Notification::assertNothingSent();
    }

    public function test_empty_optional_identifier_does_not_count_as_a_second_identifier(): void
    {
        $this->postJson('/auth/register', [
            'email' => 'email-only@example.com',
            'phone' => '',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])
            ->assertCreated()
            ->assertJsonPath('data.channel', 'email');

        $this->postJson('/auth/register', [
            'email' => '',
            'phone' => '081234567890',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])
            ->assertCreated()
            ->assertJsonPath('data.channel', 'phone');

        $this->assertDatabaseCount('users', 2);
        $this->assertDatabaseCount('otp_verifications', 1);
    }

    public function test_registration_requires_an_identifier_and_password_confirmation(): void
    {
        $this->postJson('/auth/register', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'email',
                'phone',
                'password',
                'password_confirmation',
            ]);
    }

    public function test_registration_validates_name_email_phone_and_password_rules(): void
    {
        $this->postJson('/auth/register', [
            'name' => 'A',
            'email' => 'not-an-email',
            'phone' => 'not-a-phone',
            'password' => 'short',
            'password_confirmation' => 'different',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'email', 'phone', 'password']);

        $this->postJson('/auth/register', [
            'name' => str_repeat('a', 101),
            'email' => 'valid@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    }

    public function test_array_identifiers_are_rejected_without_creating_records(): void
    {
        $this->postJson('/auth/register', [
            'email' => ['user@example.com'],
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);

        $this->postJson('/auth/register', [
            'email' => ['user@example.com'],
            'phone' => ['081234567890'],
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['phone']);

        $this->assertDatabaseCount('users', 0);
        $this->assertDatabaseCount('otp_verifications', 0);
        Notification::assertNothingSent();
    }

    public function test_duplicate_email_or_phone_returns_409(): void
    {
        User::factory()->create(['email' => 'taken@example.com']);
        User::factory()->create([
            'email' => null,
            'phone' => '+6281234567890',
            'email_verified_at' => null,
        ]);

        $this->postJson('/auth/register', [
            'name' => 'Duplicate Email',
            'email' => 'TAKEN@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])
            ->assertStatus(409)
            ->assertJsonPath('code', 'identifier_already_exists');

        $this->postJson('/auth/register', [
            'name' => 'Duplicate Phone',
            'phone' => '0812-3456-7890',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])
            ->assertStatus(409)
            ->assertJsonPath('code', 'identifier_already_exists');

        $this->assertDatabaseCount('users', 2);
    }

    public function test_public_registration_cannot_assign_the_admin_role(): void
    {
        [$user] = $this->registerPhone([
            'role' => UserRole::Admin->value,
        ]);

        $this->assertSame(UserRole::Customer, $user->fresh()->role);
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'role' => UserRole::Customer->value,
        ]);
    }
}

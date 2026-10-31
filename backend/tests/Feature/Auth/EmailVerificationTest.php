<?php

namespace Tests\Feature\Auth;

use App\Models\OtpVerification;
use App\Models\User;
use App\Notifications\EmailVerificationOtpNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\Feature\Auth\Concerns\InteractsWithAuth;
use Tests\TestCase;

class EmailVerificationTest extends TestCase
{
    use InteractsWithAuth, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withHeader('Origin', 'http://localhost:5173');

        Notification::fake();
    }

    public function test_valid_otp_verifies_email_without_starting_a_session(): void
    {
        [$user, , $code] = $this->registerEmail();

        $this->postJson('/auth/email/verify', [
            'email' => '  USER@EXAMPLE.COM  ',
            'code' => "  {$code}  ",
        ])
            ->assertOk()
            ->assertJsonPath('data.email_verified', true)
            ->assertJsonPath('data.email', 'user@example.com');

        $user->refresh();
        $otp = OtpVerification::query()->firstOrFail();

        $this->assertNotNull($user->email_verified_at);
        $this->assertNotNull($otp->consumed_at);
        $this->assertGuest('web');

        $this->postJson('/auth/email/verify', [
            'email' => 'user@example.com',
            'code' => $code,
        ])
            ->assertStatus(422)
            ->assertJsonPath('code', 'otp_invalid');
    }

    public function test_wrong_otp_is_rejected_and_increments_attempts(): void
    {
        [$user, , $code] = $this->registerEmail();
        $wrongCode = $code === '000000' ? '000001' : '000000';

        $this->postJson('/auth/email/verify', [
            'email' => 'user@example.com',
            'code' => $wrongCode,
        ])
            ->assertStatus(422)
            ->assertJsonPath('code', 'otp_invalid');

        $otp = OtpVerification::query()->firstOrFail();

        $this->assertSame(1, $otp->attempts);
        $this->assertNull($otp->consumed_at);
        $this->assertNull($user->fresh()->email_verified_at);

        $this->postJson('/auth/email/verify', [
            'email' => 'user@example.com',
            'code' => $code,
        ])->assertOk();
    }

    public function test_expired_otp_is_rejected_and_consumed(): void
    {
        [$user, , $code] = $this->registerEmail();

        $this->travel(11)->minutes();

        $this->postJson('/auth/email/verify', [
            'email' => 'user@example.com',
            'code' => $code,
        ])
            ->assertStatus(422)
            ->assertJsonPath('code', 'otp_expired');

        $otp = OtpVerification::query()->firstOrFail();

        $this->assertNotNull($otp->consumed_at);
        $this->assertNull($user->fresh()->email_verified_at);
    }

    public function test_otp_is_blocked_after_five_failed_attempts(): void
    {
        [$user, , $code] = $this->registerEmail();
        $wrongCode = $code === '000000' ? '000001' : '000000';

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postJson('/auth/email/verify', [
                'email' => 'user@example.com',
                'code' => $wrongCode,
            ])
                ->assertStatus(422)
                ->assertJsonPath('code', 'otp_invalid');
        }

        $this->assertSame(5, OtpVerification::query()->firstOrFail()->attempts);
        $this->assertNull($user->fresh()->email_verified_at);

        $this->postJson('/auth/email/verify', [
            'email' => 'user@example.com',
            'code' => $code,
        ])
            ->assertStatus(429)
            ->assertJsonPath('code', 'otp_attempts_exceeded');

        $this->assertNull($user->fresh()->email_verified_at);
    }

    public function test_resend_enforces_cooldown_and_invalidates_the_previous_otp(): void
    {
        [$user, , $initialCode] = $this->registerEmail();

        $this->postJson('/auth/email/verify/resend', [
            'email' => 'user@example.com',
        ])
            ->assertStatus(429)
            ->assertJsonPath('code', 'otp_cooldown')
            ->assertHeader('Retry-After');

        Notification::assertSentToTimes($user, EmailVerificationOtpNotification::class, 1);

        $this->travel(61)->seconds();

        $this->postJson('/auth/email/verify/resend', [
            'email' => 'user@example.com',
        ])
            ->assertOk()
            ->assertJsonPath('data.cooldown_seconds', 60)
            ->assertJsonStructure(['data' => ['expires_at', 'cooldown_seconds']]);

        Notification::assertSentToTimes($user, EmailVerificationOtpNotification::class, 2);

        $newCode = $this->otpCodeFor($user);

        $this->assertNotSame($initialCode, $newCode);

        $this->postJson('/auth/email/verify', [
            'email' => 'user@example.com',
            'code' => $initialCode,
        ])
            ->assertStatus(422)
            ->assertJsonPath('code', 'otp_invalid');

        $this->postJson('/auth/email/verify', [
            'email' => 'user@example.com',
            'code' => $newCode,
        ])->assertOk();
    }

    public function test_resend_is_limited_to_three_successful_requests_per_window(): void
    {
        [$user] = $this->registerEmail();

        for ($request = 0; $request < 3; $request++) {
            $this->travel(61)->seconds();

            $this->postJson('/auth/email/verify/resend', [
                'email' => 'user@example.com',
            ])->assertOk();
        }

        $this->travel(61)->seconds();

        $this->postJson('/auth/email/verify/resend', [
            'email' => 'user@example.com',
        ])
            ->assertStatus(429)
            ->assertJsonPath('code', 'rate_limit_exceeded')
            ->assertHeader('Retry-After');

        Notification::assertSentToTimes($user, EmailVerificationOtpNotification::class, 4);
    }

    public function test_non_string_email_payloads_are_rejected(): void
    {
        $this->postJson('/auth/email/verify', [
            'email' => ['user@example.com'],
            'code' => '123456',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);

        $this->postJson('/auth/email/verify/resend', [
            'email' => ['user@example.com'],
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    public function test_resend_rejects_unknown_or_already_verified_email(): void
    {
        $this->postJson('/auth/email/verify/resend', [
            'email' => 'unknown@example.com',
        ])
            ->assertStatus(422)
            ->assertJsonPath('code', 'otp_invalid');

        User::factory()->create(['email' => 'verified@example.com']);

        $this->postJson('/auth/email/verify/resend', [
            'email' => 'verified@example.com',
        ])
            ->assertStatus(422)
            ->assertJsonPath('code', 'otp_invalid');
    }
}

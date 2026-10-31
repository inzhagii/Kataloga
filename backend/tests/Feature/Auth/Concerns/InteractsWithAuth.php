<?php

namespace Tests\Feature\Auth\Concerns;

use App\Models\User;
use App\Notifications\EmailVerificationOtpNotification;
use Illuminate\Support\Facades\Notification;
use Illuminate\Testing\TestResponse;

trait InteractsWithAuth
{
    /**
     * @return array{0: User, 1: TestResponse, 2: string}
     */
    protected function registerEmail(array $overrides = []): array
    {
        $response = $this->postJson('/auth/register', array_merge([
            'name' => 'Test User',
            'email' => 'user@example.com',
            'phone' => null,
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ], $overrides));

        $response->assertCreated();

        /** @var User $user */
        $user = User::query()->latest('id')->firstOrFail();

        return [$user, $response, $this->otpCodeFor($user)];
    }

    /**
     * @return array{0: User, 1: TestResponse}
     */
    protected function registerPhone(array $overrides = []): array
    {
        $response = $this->postJson('/auth/register', array_merge([
            'name' => 'Phone User',
            'email' => null,
            'phone' => '081234567890',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ], $overrides));

        $response->assertCreated();

        /** @var User $user */
        $user = User::query()->latest('id')->firstOrFail();

        return [$user, $response];
    }

    protected function otpCodeFor(User $user): string
    {
        /** @var EmailVerificationOtpNotification|null $notification */
        $notification = Notification::sent($user, EmailVerificationOtpNotification::class)->last();

        $this->assertNotNull($notification, 'OTP notification was not sent.');

        return $notification->code;
    }

    protected function withSessionFrom(TestResponse $response): static
    {
        $cookie = $response->getCookie((string) config('session.cookie'));

        $this->assertNotNull($cookie, 'Session cookie was not present.');

        return $this->withCookie((string) config('session.cookie'), $cookie->getValue());
    }
}

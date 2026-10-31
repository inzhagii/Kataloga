<?php

namespace App\Notifications;

use Carbon\CarbonInterface;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

final class EmailVerificationOtpNotification extends Notification
{
    public function __construct(
        public readonly string $code,
        public readonly CarbonInterface $expiresAt,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Kode Verifikasi Kataloga')
            ->greeting('Halo '.($notifiable->name ?? 'Pengguna'))
            ->line('Kode verifikasi email Anda adalah: '.$this->code)
            ->line('Kode berlaku sampai '.$this->expiresAt->format('d.m.Y H:i').'.')
            ->line('Jangan bagikan kode ini kepada siapa pun.');
    }
}

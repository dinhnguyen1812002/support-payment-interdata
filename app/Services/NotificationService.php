<?php

namespace App\Services;

use App\Mail\UserNotificationMail;
use Illuminate\Support\Facades\Mail;

class NotificationService
{
    /**
     * Gửi email thông báo.
     */
    public function sendMail(
        string $email,
        string $subject,
        string $title,
        string $body,
        string $actionText,
        string $actionUrl
    ) {
        $details = [
            'subject' => $subject,
            'title' => $title,
            'body' => $body,
            'actionText' => $actionText,
            'actionUrl' => $actionUrl,
        ];

        Mail::to($email)->send(new UserNotificationMail($details));
    }
}

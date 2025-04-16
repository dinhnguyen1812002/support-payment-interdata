<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyWebhook
{
    public function handle(Request $request, Closure $next): Response
    {
        $signature = $request->headers->get('X-Webhook-Signature');
        $payload = $request->getContent();
        $secret = config('app.webhook_secret');
        $computedSignature = hash_hmac('sha256', $payload, $secret);
        if (! hash_equals($signature, $computedSignature)) {
            abort(Response::HTTP_UNAUTHORIZED);
        }

        return $next($request);
    }
}

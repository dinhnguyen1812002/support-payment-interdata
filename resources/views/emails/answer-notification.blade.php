<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $details['subject'] }}</title>
    @vite('resources/css/app.css')
    <style>
        body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }
    </style>
</head>
<body class="bg-slate-50 min-h-screen">
<div class="max-w-2xl mx-auto my-12 p-8">
    <!-- Email Container -->
    <div class="bg-white rounded-xl shadow-lg overflow-hidden">
        <!-- Brand Header -->
        <div class="bg-primary/5 px-6 py-4 border-b border-slate-100">
            <h2 class="text-lg font-semibold text-primary">
                {{ config('app.name') }}
            </h2>
        </div>

        <!-- Content Container -->
        <div class="p-6 sm:p-8">
            <!-- Title -->
            <h1 class="text-2xl font-bold text-slate-900 mb-6">
                {{ $details['title'] }}
            </h1>

            <!-- Main Content -->
            <div class="prose prose-slate max-w-none">
                <p class="text-slate-600 text-base leading-relaxed">
                    {{ $details['body'] }}
                </p>
            </div>

            <!-- CTA Button -->
            <div class="mt-8 mb-8 text-center">
                <a href="{{ $details['actionUrl'] }}"
                   class="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-primary text-white font-medium shadow-xs hover:bg-primary/90 transition-all duration-200 hover:shadow-md active:transform active:scale-95">
                    {{ $details['actionText'] }}
                </a>
            </div>

            <!-- Divider -->
            <div class="relative my-8">
                <div class="absolute inset-0 flex items-center">
                    <div class="w-full border-t border-slate-200"></div>
                </div>
            </div>

            <!-- Support Section -->
            <div class="rounded-lg bg-slate-50 p-6">
                <div class="flex items-start space-x-3">
                    <!-- Info Icon -->
                    <div class="mt-0.5">
                        <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <!-- Support Text -->
                    <div class="flex-1">
                        <p class="text-sm text-slate-600">
                            Need help? Contact our support team at
                            <a href="mailto:support@{{ config('app.name') }}.com"
                               class="text-primary hover:text-primary/80 font-medium">
                                support@{{ config('app.name') }}.com
                            </a>
                        </p>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <footer class="mt-8 pt-6 border-t border-slate-200">
                <p class="text-slate-500 text-sm">
                    Best regards,<br>
                    <span class="text-slate-700 font-semibold mt-1 block">
                            {{ config('app.name') }} Team
                        </span>
                </p>

                <!-- Additional Footer Info -->
                <div class="mt-6 pt-6 border-t border-slate-200">
                    <p class="text-xs text-slate-400 text-center">
                        This email was sent to you as a registered member of {{ config('app.name') }}.
                        Please do not reply to this email.
                    </p>
                </div>
            </footer>
        </div>
    </div>
</div>
</body>
</html>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>{{ $subject }}</title>

</head>
<body class="bg-gray-100 font-sans">
<div class="max-w-2xl mx-auto my-8 bg-white rounded-lg shadow-md">
    <!-- Header -->
    <div class="bg-blue-600 text-white text-center py-6 rounded-t-lg">
        <h1 class="text-2xl font-bold">{{ $subject }}</h1>
    </div>

    <!-- Content -->
    <div class="p-6">
        @component('mail::message')
            <p class="text-gray-800 text-lg mb-4">{{ $greeting }}</p>

            <div class="text-gray-700 mb-6">{{ $message }}</div>

            @if(isset($actionText) && isset($actionUrl))
                @component('mail::button', [
                    'url' => $actionUrl,
                    'color' => 'blue',
                    'class' => 'bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded'
                ])
                    {{ $actionText }}
                @endcomponent
            @endif

            <p class="text-gray-800 mt-4">{{ $closing }}</p>
        @endcomponent
    </div>

    <!-- Footer -->
    <div class="bg-gray-50 text-gray-500 text-center py-4 border-t rounded-b-lg">
        <p class="text-sm">
            Thanks,<br>
            {{ config('app.name') }}
        </p>
        <p class="text-xs mt-2">© {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
    </div>
</div>
</body>
</html>

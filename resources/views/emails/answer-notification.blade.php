<!DOCTYPE html>
<html>
<head>
    <title>{{ $details['subject'] }}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    @vite('resources/css/app.css')
</head>
<body class="bg-gray-100 font-sans">
<div class="max-w-2xl mx-auto p-6 bg-white my-8 rounded-lg shadow-md">
    <!-- Header -->
    <div class="border-b pb-4 mb-6">
        <h1 class="text-2xl font-bold text-gray-800">
            {{ $details['title'] }}
        </h1>
    </div>

    <!-- Content -->
    <div class="mb-8">
        <p class="text-gray-600 leading-relaxed mb-6">
            {{ $details['body'] }}
        </p>

        <!-- Action Button -->
        <div class="text-center my-8">
            <a href="{{ $details['actionUrl'] }}"
               class="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-0.5">
                {{ $details['actionText'] }}
            </a>
        </div>
    </div>

    <!-- Footer -->
    <div class="border-t pt-6 mt-8">
        <p class="text-gray-500 text-sm">
            Thank you,<br>
            <span class="font-medium text-gray-700">{{ config('app.name') }}</span>
        </p>
    </div>
</div>
</body>
</html>

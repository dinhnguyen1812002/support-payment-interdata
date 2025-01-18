<!DOCTYPE html>
<html>
<head>
    <title>{{ $details['subject'] }}</title>
</head>
<body>
<h1>{{ $details['title'] }}</h1>
<p>{{ $details['body'] }}</p>

@if(isset($details['actionUrl']))
    <a href="{{ $details['actionUrl'] }}" style="display:inline-block; padding:10px 15px; background:#4CAF50; color:white; text-decoration:none; margin-top:20px;">
        {{ $details['actionText'] }}
    </a>
@endif

<p>Thank you,</p>
<p>{{ config('app.name') }}</p>
</body>
</html>


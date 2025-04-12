@component('mail::message')
# {{ $subject }}

{{ $greeting }}

{{ $message }}

@if(isset($actionText) && isset($actionUrl))
@component('mail::button', ['url' => $actionUrl])
{{ $actionText }}
@endcomponent
@endif

{{ $closing }}

Thanks,<br>
{{ config('app.name') }}
@endcomponent

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OAuth Callback</title>
</head>
<body>
<script>
    window.opener.postMessage(@json($data), '{{ $origin }}');
    window.close();
</script>
</body>
</html>

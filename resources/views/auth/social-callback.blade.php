
<!DOCTYPE html>
<html>
<head>
    <title>OAuth Callback</title>
</head>
<body>
<script>
    window.opener.postMessage(@json($data), '{{ $origin }}');
    window.close();
</script>
</body>
</html>

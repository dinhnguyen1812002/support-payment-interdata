<!DOCTYPE html>
<html>
<head>
    <title>New Ticket Notification</title>
</head>
<body>
<h1>New Support Ticket</h1>
<p><strong>Ticket ID:</strong> {{ $ticket->id }}</p>
<p><strong>Title:</strong> {{ $ticket->title }}</p>
<p><strong>Content:</strong> {{ $ticket->content }}</p>
<p><strong>Submitted by:</strong> {{ $ticket->user->email }}</p>
</body>
</html>

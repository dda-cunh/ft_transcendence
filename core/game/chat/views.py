from django.http import HttpResponse

def index(request):
    return HttpResponse("""
<!DOCTYPE html>
<html>
<head>
    <title>Chat Application</title>
    <style>
        #chat-log {
            height: 300px;
            overflow-y: scroll;
            border: 1px solid #ccc;
            margin-bottom: 10px;
            padding: 5px;
        }
        #message-input {
            width: 80%;
            padding: 8px;
            border: 1px solid #ccc;
        }
        #send-button {
            padding: 8px 15px;
            background-color: #4CAF50;
            color: white;
            border: none;
            cursor: pointer;
        }
        #match-status {
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <h1>Chat</h1>
    <div id="match-status">Waiting for match...</div>
    <div id="chat-log" style="display: none;"></div>
    <input type="text" id="message-input" style="display: none;">
    <button id="send-button" style="display: none;">Send</button>

    <script>
        const chatSocket = new WebSocket(
            'ws://' + window.location.host + '/ws/chat/'
        );

        let matched = false; // Track match status

        chatSocket.onmessage = function(e) {
            const data = JSON.parse(e.data);
            if (data.message === "Match found!" && !matched) {
                matched = true;
                document.querySelector('#match-status').textContent = "Match found! You can now chat.";
                document.querySelector('#chat-log').style.display = 'block';
                document.querySelector('#message-input').style.display = 'block';
                document.querySelector('#send-button').style.display = 'inline-block';
            } else if (matched) {
                document.querySelector('#chat-log').innerHTML += ('<div>' + data.message + '</div>');
            }
        };

        chatSocket.onclose = function(e) {
            console.error('Chat socket closed unexpectedly');
        };

        document.querySelector('#send-button').onclick = function(e) {
            const messageInputDom = document.querySelector('#message-input');
            const message = messageInputDom.value;
            chatSocket.send(JSON.stringify({
                'message': message
            }));
            messageInputDom.value = '';
        };
    </script>
</body>
</html>
    """
    )
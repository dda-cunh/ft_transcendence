
export function connectWebSocket() {
  let wsUrl = `wss://${window.location.hostname}:${window.location.port}/ws/`;
  let socket = new WebSocket(wsUrl);

  socket.onopen = function(event) {
    console.log('WebSocket connection established');
  };

  socket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log("Received message:", data);
    
    if (data.status === 'queued') {
      alert("You are in the queue, waiting for a match!");
    } else if (data.status === 'reconnected') {
      alert("Reconnected to the previous room.");
    } else if (data.message === 'Connected to peer!') {
      alert("You are now connected to your peer!");
    }
  };

  socket.onclose = function(event) {
    console.log('WebSocket connection closed');
  };

  socket.onerror = function(event) {
    console.log('WebSocket error:', event);
  };
}


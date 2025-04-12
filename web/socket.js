let socket;

export function connectWebSocket() {
  let mode = "remote"; // temporary; mode depends on the clicked button; send 'local', 'remote' or 'tournament'

  document.cookie = "access=" + localStorage.getItem("access") + "; path=/; Secure";
  let wsUrl = `wss://${window.location.hostname}/${mode}pong/`;
  socket = new WebSocket(wsUrl);
  
  socket.onopen = function(event) {
    console.log('WebSocket connection established');
    document.cookie = "access=; path=/; Secure; SameSite=None; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  };

  socket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log("Received message:", data);
  };

  socket.onclose = function(event) {
    console.log('WebSocket connection closed');
  };

  socket.onerror = function(event) {
    console.log('WebSocket error:', event);
    document.cookie = "access=; path=/; Secure; SameSite=None; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  };
}


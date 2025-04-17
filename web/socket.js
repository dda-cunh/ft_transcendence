
let socket = null;
let gameConstants = {};

let keyState = {
  w: false,
  s: false,
  move: 0,
};

// Temporarily hardcoded values for testing until initial function is done
gameConstants = {
  canvasWidth: 800,
  canvasHeight: 600,
  paddleWidth: 40,
  paddleHeight: 600 / 4.5,
  ballRadius: 125,
  player1Name: "p1",
  player2Name: "p2",
};


export function connectWebSocket(mode) {
  // mode depends on the clicked button; send 'local', 'remote' or 'tournament'

  if (socket) socket.close();

  document.cookie = "access=" + localStorage.getItem("access") + "; path=/; Secure";
  let wsUrl = `wss://${window.location.hostname}/${mode}pong/`;
  socket = new WebSocket(wsUrl);
  
  socket.onopen = function(event) {
    console.log('WebSocket connection established');
    document.cookie = "access=; path=/; Secure; SameSite=None; expires=Thu, 01 Jan 1970 00:00:00 GMT";
   
    // substitute temp for username
    if (mode === "remote") socket.send(JSON.stringify({ tname: "username" }));

    // substitute temp for the name chosen by the user for this tournament
    if (mode === "tournament") socket.send(JSON.stringify({ tname: "temp" }));
  };

  socket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    if (data && data.message) {
      console.log(data.message);
    }
    if (data && data.initial) {
      gameConstants = {
        canvasWidth: data.canvasWidth,
        canvasHeight: data.canvasHeight,
        paddleWidth: data.paddleWidth,
        paddleHeight: data.paddleHeight,
        ballRadius: data.ballRadius,
        player1Name: data.p1Name,
        player2Name: data.p2Name,
      };
    }
    if (data && data.gamestate) {
      drawFrame(data.gamestate);
    }
  };

  socket.onclose = function(event) {
    console.log('WebSocket connection closed');
  };

  socket.onerror = function(event) {
    console.log('WebSocket error:', event);
    document.cookie = "access=; path=/; Secure; SameSite=None; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  };
}



function drawFrame(gameState) {
  const canvas = document.querySelectorAll('canvas')[0];
  if (!canvas || !gameState || !gameConstants) return;
  
  const ctx = canvas.getContext('2d');
  canvas.width = gameConstants.canvasWidth;
  canvas.height = gameConstants.canvasHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(gameState.ball.x, gameState.ball.y, gameConstants.ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.closePath();

  ctx.fillRect(gameState.player1.x, gameState.player1.y, gameConstants.paddleWidth, gameConstants.paddleHeight);
  ctx.fillRect(gameState.player2.x, gameState.player2.y, gameConstants.paddleWidth, gameConstants.paddleHeight);

  ctx.font = '20px Arial';
  ctx.fillText(`${gameConstants.p1Name}   ${gameState.score.p1} : ${gameState.score.p2}   ${gameConstants.p2Name}`, canvas.width / 2 - 20, 30);
}

function emitIfChanged(key, isPressed) {
  if (!gameState) return;
  if (keyState[key] !== isPressed) {
    keyState[key] = isPressed;

    if (keyState.w && keyState.s)
      keyState.move = 0;
    else if (keyState.w)
      keyState.move = -1;
    else if (keyState.s)
      keyState.move = 1;

    socket.send(JSON.stringify({ keystate: keyState.move }));
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'w' || e.key === 's') {
    emitIfChanged(e.key, true);
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'w' || e.key === 's') {
    emitIfChanged(e.key, false);
  }
});
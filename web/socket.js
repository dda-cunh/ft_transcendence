let socket = null;
let gameConstants = {};
let gameState = null;
let gmode = null;
let keyState = {
  w: false,
  s: false,
  ArrowUp: false,
  ArrowDown: false,
  move: "IDLE",
  moveLocal: "IDLE", // p2 in local mode
};

let half_w = 0, half_h = 0;


export function connectWebSocket(mode) {
  // mode depends on the clicked button; send 'local', 'remote' or 'tournament'
  gmode = mode;
  if (socket) socket.close();

  document.cookie = "access=" + localStorage.getItem("access") + "; path=/; Secure";
  let wsUrl = `wss://${window.location.hostname}/ws/${mode}pong/`;

  socket = new WebSocket(wsUrl);
  
  socket.onopen = function(event) {
    console.log('WebSocket connection established');
    document.cookie = "access=; path=/; Secure; SameSite=None; expires=Thu, 01 Jan 1970 00:00:00 GMT";
   
    // substitute temp for username
    if (mode === "remote") socket.send(JSON.stringify({ tname: "username" }));

    // substitute temp for the name chosen by the user for this tournament
    if (mode === "tournament") socket.send(JSON.stringify({ tname: "temp" }));
    loadControls();
  };

  socket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    if (data && data.message) {
      console.log(data.message);
    }
    if (data && data.initial) {
      gameConstants = data.initial;
      half_w = gameConstants.canvas_w / 2;
      half_h = gameConstants.canvas_h / 2;
    }
    if (data && data.gamestate) {
      gameState = data.gamestate;
      drawFrame();
    }
  };

  socket.onclose = function(event) {
    console.log('WebSocket connection closed');
    gameState = null;
    unloadControls();
  };

  socket.onerror = function(event) {
    console.log('WebSocket error:', event);
    document.cookie = "access=; path=/; Secure; SameSite=None; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    gameState = null;
    unloadControls();
  };
}


function drawFrame() {
  const canvas = document.querySelectorAll('canvas')[0];
  if (!canvas || !gameState || !gameConstants) return;
  const ctx = canvas.getContext('2d');
  canvas.width = gameConstants.canvas_w;
  canvas.height = gameConstants.canvas_h;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(gameState.ball.x + half_w, gameState.ball.y + half_h, gameConstants.ball_rad, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.closePath();

  ctx.fillRect(0, gameState.p1_pos_y + half_h - gameConstants.paddle_h / 2, gameConstants.paddle_w, gameConstants.paddle_h);
  ctx.fillRect(gameConstants.canvas_w - gameConstants.paddle_w, gameState.p2_pos_y + half_h - gameConstants.paddle_h / 2, gameConstants.paddle_w, gameConstants.paddle_h);

  ctx.font = '20px Arial';
  ctx.fillText(`${gameConstants.p1_name}   ${gameState.p1_score} : ${gameState.p2_score}   ${gameConstants.p2_name}`, canvas.width / 2 - 100, 30);
}

function emitIfChanged(key, isPressed) {
  if (!gameState) return;
  keyState[key] = isPressed;

  const newMove =
    keyState.w && !keyState.s ? "DOWN" :
    keyState.s && !keyState.w ? "UP" :
    "IDLE";

  if (newMove !== keyState.move) {
    keyState.move = newMove;
    socket.send(JSON.stringify({ keystate: keyState.move }));
  }
}

function emitIfChangedLocal(key, isPressed) {
  if (!gameState) return;
  keyState[key] = isPressed;

  const newMove =
  keyState.w && !keyState.s ? "DOWN" :
  keyState.s && !keyState.w ? "UP" :
  "IDLE";

  const newLocalMove =
  keyState.ArrowUp && !keyState.ArrowDown ? "DOWN" :
  keyState.ArrowDown && !keyState.ArrowUp ? "UP" :
  "IDLE";

  if (newMove !== keyState.move) {
    keyState.move = newMove;
    socket.send(JSON.stringify({ keystate_p1: keyState.move }));
  }
  if (newLocalMove !== keyState.moveLocal) {
    keyState.moveLocal = newLocalMove;
    socket.send(JSON.stringify({ keystate_p2: keyState.moveLocal }));
  }
}

function handleKeyDown(e) {
  if (gmode && gmode !== "local" && (e.key === 'w' || e.key === 's'))
    emitIfChanged(e.key, true);
  else if (gmode === "local" && (['w', 's', 'ArrowUp', 'ArrowDown'].includes(e.key)))
    emitIfChangedLocal(e.key, true);
}

function handleKeyUp(e) {
  if (gmode && gmode !== "local" && (e.key === 'w' || e.key === 's'))
    emitIfChanged(e.key, false);
  else if (gmode === "local" && (['w', 's', 'ArrowUp', 'ArrowDown'].includes(e.key)))
    emitIfChangedLocal(e.key, false);
}

function loadControls() {
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
}

function unloadControls() {
  document.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('keyup', handleKeyUp);
}

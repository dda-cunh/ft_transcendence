
let socket = null;
let gameConstants = {};
let gameState = null;
let gmode = null;
let keyState = {
  w: false,
  s: false,
  ArrowUp: false,
  ArrowDown: false,
  move: 0,
  moveLocal: 0, // p2 in local mode
};

// Temporarily hardcoded values for testing until initial function is done
gameConstants = {
  canvas_w: 800,
  canvas_h: 600,
  paddle_w: 40,
  paddle_h: 600 / 4.5,
  ball_rad: 10,
  p1_name: "p1",
  p2_name: "p2",
};

let half_w = gameConstants.canvas_w / 2;
let half_h = gameConstants.canvas_h / 2;


export function connectWebSocket(mode) {
  // mode depends on the clicked button; send 'local', 'remote' or 'tournament'
  gmode = mode;
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
    loadControls();
  };

  socket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    if (data && data.message) {
      console.log(data.message);
    }
    if (data && data.initial) {
      gameConstants = {
        canvas_w: data.canvas_w,
        canvas_h: data.canvas_h,
        paddle_w: data.paddle_w,
        paddle_h: data.paddle_h,
        ball_rad: data.ball_radius,
        p1_name: data.p1_name,
        p2_name: data.p2_name,
      };
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
  ctx.fillText(`${gameConstants.p1_name}   ${gameState.p1_score} : ${gameState.p2_score}   ${gameConstants.p2_name}`, canvas.width / 2 - 20, 30);
}

function emitIfChanged(key, isPressed) {
  if (!gameState) return;
  if (keyState[key] !== isPressed) {
    keyState[key] = isPressed;

    let changed = keyState.move
    if (keyState.w && !keyState.s)
      keyState.move = -1;
    else if (keyState.s && !keyState.w)
      keyState.move = 1;
    else
      keyState.move = 0;

    if (changed === keyState.move)
      return;
    socket.send(JSON.stringify({ keystate: keyState.move }));
  }
}

function emitIfChangedLocal(key, isPressed) {
  if (!gameState) return;
  if (keyState[key] !== isPressed) {
    keyState[key] = isPressed;

    let changed = keyState.move
    let changedLocal = keyState.moveLocal
    if (keyState.w && !keyState.s)
      keyState.move = -1;
    else if (keyState.s && !keyState.w)
      keyState.move = 1;
    else
      keyState.move = 0;

    if (keyState.ArrowUp && !keyState.ArrowDown)
      keyState.moveLocal = -1;
    else if (keyState.ArrowDown && !keyState.ArrowUp)
      keyState.moveLocal = 1;
    else
      keyState.moveLocal = 0;

    if (changed === keyState.move && changedLocal === keyState.moveLocal)
      return;
    socket.send(JSON.stringify({ keystate_p1: keyState.move }, { keystate_p2: keyState.moveLocal }));
  }
}

function handleKeyDown(e) {
  if (gmode && gmode !== "local" && (e.key === 'w' || e.key === 's')) {
    emitIfChanged(e.key, true);
  }
  if (gmode === "local" && (['w', 's', 'ArrowUp', 'ArrowDown'].includes(e.key))) {
    emitIfChangedLocal(e.key, true);
  }
}

function handleKeyUp(e) {
  if (gmode && gmode !== "local" && (e.key === 'w' || e.key === 's')) {
    emitIfChanged(e.key, false);
  }
  if (gmode === "local" && (['w', 's', 'ArrowUp', 'ArrowDown'].includes(e.key))) {
    emitIfChangedLocal(e.key, false);
  }
}

function loadControls() {
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
}

function unloadControls() {
  document.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('keyup', handleKeyUp);
}

import { main } from "./index.js";
import { updateAccessTkn } from "./utils.js";
// import {handleHistoryPopState} from './app.js'
import PongAI from "./pongAI.js";

export let gameConstants = {};
export let gameState = null;
export let socket = null;

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
let ai = false, playerAi = null;


function adaptMode(mode) {
  switch(mode) {
    case "Single Player":
    case "Local Multiplayer":
      return "local";
    case "Online Multiplayer":
      return "remote";
    case "tournament":
        return "tournament";
    default:
      return "local";
  }
}

export async function connectWebSocket(mode) {
  // mode depends on the clicked button; send 'local', 'remote' or 'tournament'
  gmode = adaptMode(mode);
  if (mode === "Single Player")
    ai = true;
  mode = gmode;
  if (socket)
    socket.close();
  if (playerAi) {
    playerAi.destroy();
    playerAi = null;
  }
  updateAccessTkn();
  document.cookie = "access=" + sessionStorage.getItem("access") + "; path=/; Secure";
  let wsUrl = `wss://${window.location.hostname}/ws/${mode}pong/`;

  socket = new WebSocket(wsUrl);
  
  socket.onopen = function(event) {
    document.cookie = "access=; path=/; Secure; SameSite=None; expires=Thu, 01 Jan 1970 00:00:00 GMT";
   
    if (mode !== "local") socket.send(JSON.stringify({ tname: sessionStorage.getItem("alias") }));

    loadControls();
    if (document.querySelectorAll("#mainContainer")[0]) {
      let div = document.createElement("div");
      div.classList.add("w-100");
      div.classList.add("text-center");
      div.classList.add("msg-container");
      div.id = "msg-container";
      document.getElementById("mainContainer").append(div);
    }
    if (!document.getElementById("p1") || !document.getElementById("p2"))
      return ;
    if(sessionStorage.getItem("gameConstants"))
    {
      gameConstants = JSON.parse(sessionStorage.getItem("gameConstants"));
      half_w = gameConstants.canvas_w / 2;
      half_h = gameConstants.canvas_h / 2;
      document.getElementById("p1").innerText = gameConstants.p1_name;
      document.getElementById("p2").innerText = gameConstants.p2_name;
    }
    startRenderLoop();
  };

  socket.onmessage = function(event) {
    const data = JSON.parse(event.data);
  
    if (!data) 
      return;
    if (data.message)
        document.getElementById("msg-container").innerText = data.message;
    if (data.initial)
    {
      gameConstants = data.initial;
      half_w = gameConstants.canvas_w / 2;
      half_h = gameConstants.canvas_h / 2;

      document.getElementById("p1").innerText = gameConstants.p1_name;
      document.getElementById("p2").innerText = gameConstants.p2_name;
      if (gmode === "local" && ai)
        playerAi = new PongAI(gameConstants);
      sessionStorage.setItem("gameConstants", JSON.stringify(gameConstants));
    }
    if (data.gamestate)
    {
      gameState = data.gamestate;
      if (playerAi)
        playerAi.update(gameState);
    }
    // handleHistoryPopState();
  };

  socket.onclose = function(event) {
    unloadControls();
    gameState = null;
    playerAi = null;
    ai = false;
    if (document.querySelectorAll("#mainContainer")[0]) {
      let btn = document.createElement("button");
      btn.classList.add("btn");
      btn.classList.add("btn-primary");
      btn.classList.add("w-100");
      btn.innerHTML = "Back";
      btn.addEventListener("click", () => {
        sessionStorage.setItem("currentView", "home");
        main();
      });
      document.getElementById("mainContainer").append(btn);
    }
    keyState = {
      w: false,
      s: false,
      ArrowUp: false,
      ArrowDown: false,
      move: "IDLE",
      moveLocal: "IDLE", // p2 in local mode
    };
  };

  socket.onerror = function(event) {
    document.cookie = "access=; path=/; Secure; SameSite=None; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    gameState = null;
    unloadControls();
  };
}


function drawFrame() {
  const canvas = document.getElementById('game-canvas');
  if (!canvas || !gameState || !gameConstants)
    return;
  const ctx =  canvas.getContext('2d');
  ctx.fillStyle = (sessionStorage.getItem("backgroundColor") ? sessionStorage.getItem("backgroundColor") : "black");
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.fillRect( (canvas.width / 2) - ( (canvas.width / 100) / 2), 0, canvas.width / 100, canvas.height);

  ctx.fillStyle = (sessionStorage.getItem("paddleColor") ? sessionStorage.getItem("paddleColor") : "white");
  
  ctx.fillRect(0, gameState.p1_pos_y + half_h - gameConstants.paddle_h / 2, gameConstants.paddle_w, gameConstants.paddle_h);
  ctx.fillRect(gameConstants.canvas_w - gameConstants.paddle_w, gameState.p2_pos_y + half_h - gameConstants.paddle_h / 2, gameConstants.paddle_w, gameConstants.paddle_h);
  
  ctx.beginPath();
  ctx.arc(gameState.ball.x + half_w, gameState.ball.y + half_h, gameConstants.ball_rad, 0, Math.PI * 2);
  ctx.fillStyle = (sessionStorage.getItem("ballColor") ? sessionStorage.getItem("ballColor") : "white");
  ctx.fill();
  ctx.closePath();

  document.getElementById("p1_score").innerText = gameState.p1_score;
  document.getElementById("p2_score").innerText = gameState.p2_score;
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

function startRenderLoop() {
  function renderLoop() {
    drawFrame();
    requestAnimationFrame(renderLoop);
  }
  requestAnimationFrame(renderLoop);
}

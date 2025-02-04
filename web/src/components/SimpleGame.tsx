import React, { useEffect, useRef, useState } from "react";

function  collisionCheck(ball, player1Paddle, player2Paddle)
{
    // CHECK COLLISION WITH TOP/BOTTOM WALLS
    if (ball.y + ball.radius > window.innerHeight) 
      ball.dy = false;
    else if (ball.y - ball.radius < 0)
      ball.dy = true;

    // CHECK COLLISION WITH PADDLES
    if (ball.x - ball.radius < player1Paddle.x + player1Paddle.width &&
        ball.y > player1Paddle.y && ball.y < player1Paddle.y + player1Paddle.height) 
    {
      ball.dx = !ball.dx;
    }

    if (ball.x + ball.radius > player2Paddle.x &&
        ball.y > player2Paddle.y && ball.y < player2Paddle.y + player2Paddle.height) 
    {
      ball.dx = !ball.dx;
    }
}


const SimpleGame: React.FC = () => 
{
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState({ player1: 0, player2: 0 });
  const [gameStarted, setGameStarted] = useState(false);
  const [waitingForNextRound, setWaitingForNextRound] = useState(false); // New state to track if we're waiting for next round


  const paddleHeight = 100;
  const paddleWidth = 20;

//  REIMPLEMENT AS INTERFACE + DERIV CLASSES
  const player1Paddle = 
  {
    x: 10, // Left side
    y: window.innerHeight / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
  };

  const player2Paddle = 
  {
    x: window.innerWidth - paddleWidth - 10, // Right side
    y: window.innerHeight / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
  };

  const ball = 
  {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    radius: 10,
    speed: 5,
    dx: GenerateRandomDir(),
    dy: GenerateRandomDir(),  //  ONLY ONE VARIABLE REQUIRED FOR SPEED, DIRECTION SHOULD BE INITIALIZED RANDOMLY
  };

  const draw = (ctx: CanvasRenderingContext2D) => 
  {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight); // Clear canvas

    // DRAW PADDLES
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(player1Paddle.x, player1Paddle.y, player1Paddle.width, player1Paddle.height);
    ctx.fillRect(player2Paddle.x, player2Paddle.y, player2Paddle.width, player2Paddle.height);

    // DRAW BALL
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.closePath();

    // DRAW SCORES (MAKE THIS PRETTIER...)
    ctx.font = "50px Arial";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(/*`Player 1: */`${score.player1}`, (window.innerWidth / 2) - (24 * 8), 50); //  SCORE LABELS WILL BE REPLACED WITH PLAYER ALIASES
    ctx.fillText(/*`Player 2: */`${score.player2}`, (window.innerWidth / 2) + (24 * 8), 50);
  };

  const moveBall = () => 
  {
    if (waitingForNextRound) return; // Prevent ball movement when waiting for next round (SOMEHOW, IT'S NOT WORKING...)

    if (ball.dx)
      ball.x += ball.speed;
    else
      ball.x -= ball.speed;
    if (ball.dy)
      ball.y += ball.speed;
    else
      ball.y -= ball.speed;

    collisionCheck(ball, player1Paddle, player2Paddle);

    // Point scores
    if (ball.x - ball.radius < 0) // Player 2 scores
    { 
      setScore((prev) => ({ ...prev, player2: prev.player2 + 1 }));
      setWaitingForNextRound(true); // Wait for next round
      resetBall(); // Reset ball after point
    }
    if (ball.x + ball.radius > window.innerWidth) // Player 1 scores
    { 
      setScore((prev) => ({ ...prev, player1: prev.player1 + 1 }));
      setWaitingForNextRound(true); // Wait for next round
      resetBall(); // Reset ball after point
    }
  };

  const movePaddles = () => 
  {
    // Move Player 1 paddle
    player1Paddle.y += player1Paddle.dy;
    player1Paddle.y = Math.max(0, Math.min(player1Paddle.y, window.innerHeight - paddleHeight));

    // Move Player 2 paddle
    player2Paddle.y += player2Paddle.dy;
    player2Paddle.y = Math.max(0, Math.min(player2Paddle.y, window.innerHeight - paddleHeight));
  };

  const resetBall = () => 
  {
    ball.x = window.innerWidth / 2;
    ball.y = window.innerHeight / 2;
    ball.dx = GenerateRandomDir(); // Random horizontal direction
    ball.dy = GenerateRandomDir(); // Random vertical direction
  };

  const updateGame = (ctx: CanvasRenderingContext2D) => 
  {
    if (gameStarted) 
    {
      moveBall();
      movePaddles();
      draw(ctx);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => 
  {
    // Player 1 controls
    if (e.key === "w" || e.key === "W") 
    {
      player1Paddle.dy = -5;
    } 
    else if (e.key === "s" || e.key === "S") 
    {
      player1Paddle.dy = 5;
    }

    // Player 2 controls
    if (e.key === "ArrowUp") 
    {
      player2Paddle.dy = -5;
    } 
    else if (e.key === "ArrowDown") 
    {
      player2Paddle.dy = 5;
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => 
  {
    // Player 1 controls
    if (e.key === "w" || e.key === "W" || e.key === "s" || e.key === "S") 
    {
      player1Paddle.dy = 0;
    }

    // Player 2 controls
    if (e.key === "ArrowUp" || e.key === "ArrowDown") 
    {
      player2Paddle.dy = 0;
    }
  };

  const startGame = () => 
  {
    setGameStarted(true); // Start the game when Enter is pressed
    setScore({ player1: 0, player2: 0 }); // Reset score when game starts
    setWaitingForNextRound(false); // Ensure we're not in a waiting state
  };

  const nextRound = () => 
  {
    setWaitingForNextRound(false); // Allow the game to continue after point scored
    resetBall(); // Reset the ball to center for the next round
  };

  useEffect(() => 
  {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const gameLoop = () => 
    {
      updateGame(ctx);
      requestAnimationFrame(gameLoop);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("keypress", (e) => 
    {
      if (e.key === "Enter") 
      {
        if (!gameStarted) 
        {
          startGame(); // Start game when Enter key is pressed
        } 
        else if (waitingForNextRound) 
        {
          nextRound(); // Start next round when Enter is pressed
        }
      }
    });

    gameLoop(); // Start the game loop

    return () => 
    {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("keypress", () => {});
    };
  }, [gameStarted, score, waitingForNextRound]); // Re-render on score or waitingForNextRound change

  return (
    <div style={{ margin: 0, padding: 0, height: "100vh", width: "100vw", overflow: "hidden", position: "fixed", top: 0, left: 0 }}>
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        style={{ display: "block", backgroundColor: "#000" }}
      ></canvas>
      {!gameStarted && (
        <div style={{ color: "#fff", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
          <h2>Press "Enter" to Start</h2>
        </div>
      )}
      {waitingForNextRound && (
        <div style={{ color: "#fff", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
          <h2>Press "Enter" for Next Round</h2>
        </div>
      )}
    </div>
  );
};

const GenerateRandomDir = () =>
{
  Boolean(Math.floor(Math.random() * 2));
} 

export default SimpleGame; 
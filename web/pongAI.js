const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ========== GAME CONSTANTS ==========
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 60;
const BALL_SIZE = 10;
const PADDLE_SPEED = 3;
const AI_UPDATE_INTERVAL = 1000;
const AI_REACTION_JITTER = 200;
const AI_ACCURACY = 0.85;
const KEY_PRESS_DURATION = 20;

// ========== GAME STATE ==========
const gameState = {
    ball: {
        x: canvas.width / 2,
        y: canvas.height / 2,
        speedX: 4,
        speedY: 4,
    },
    paddles: {
        left: {
            y: canvas.height / 2 - PADDLE_HEIGHT / 2,
            speed: 0
        },
        right: {
            y: canvas.height / 2 - PADDLE_HEIGHT / 2,
            speed: 0
        }
    },
    scores: {
        left: 0,
        right: 0
    }
};

// ========== INPUT HANDLING ==========
function handleKeyInput() {
    document.addEventListener("keydown", (e) => {
        if (e.key === "w") gameState.paddles.left.speed = -PADDLE_SPEED;
        if (e.key === "s") gameState.paddles.left.speed = PADDLE_SPEED;
        if (e.key === "ArrowUp") gameState.paddles.right.speed = -PADDLE_SPEED;
        if (e.key === "ArrowDown") gameState.paddles.right.speed = PADDLE_SPEED;
    });

    document.addEventListener("keyup", (e) => {
        if (["w", "s"].includes(e.key)) gameState.paddles.left.speed = 0;
        if (["ArrowUp", "ArrowDown"].includes(e.key)) gameState.paddles.right.speed = 0;
        
    });
}

// ========== AI SYSTEM ==========
class PongAI {
    constructor() {
        this.predictedImpactY = canvas.height/2;
        this.activeTimeouts = [];
        this.lastPrediction = Date.now();
        this.targetY = canvas.height/2;
        this.positionThreshold = 10 + (1 - AI_ACCURACY) * 70;
        this.initializeAI();
    }

    initializeAI() {
        setInterval(() => this.updateBallPrediction(), AI_UPDATE_INTERVAL);
        setInterval(() => this.update(), AI_UPDATE_INTERVAL);
        
    }

    updateBallPrediction() {
        // Store current ball state for prediction
        const ballSnapshot = {
            x: gameState.ball.x,
            y: gameState.ball.y,
            speedX: gameState.ball.speedX,
            speedY: gameState.ball.speedY
        };

        // Prediction logic with wall bounce simulation
        let virtualX = ballSnapshot.x;
        let virtualY = ballSnapshot.y;
        let virtualSpeedX = ballSnapshot.speedX;
        let virtualSpeedY = ballSnapshot.speedY;

        for (let steps = 0; steps < 5000; steps++) {
            if (virtualSpeedX > 0 && virtualX >= canvas.width - PADDLE_WIDTH) {
                this.predictedImpactY = virtualY;
                break;
            }

            const yTravel = virtualSpeedY > 0 
                ? canvas.height - virtualY 
                : -virtualY;
            const yTime = Math.abs(yTravel / virtualSpeedY);
            const xTime = (canvas.width - PADDLE_WIDTH - virtualX) / virtualSpeedX;
            const stepTime = Math.min(xTime, yTime);

            if (xTime < yTime) {
                virtualX += virtualSpeedX * xTime;
                virtualY += virtualSpeedY * xTime;
                this.predictedImpactY = virtualY;
                break;
            } else {
                virtualX += virtualSpeedX * stepTime;
                virtualY += virtualSpeedY * stepTime;
                virtualSpeedY *= -1;
            }
        }
    }

    simulateKeyPress(key) {
        // Clear previous inputs
        this.activeTimeouts.forEach(t => clearTimeout(t));
        this.activeTimeouts = [];

        // Simulate human-like key press
        const jitterDelay = Math.random() * AI_REACTION_JITTER;
          setTimeout(() => {
          const pressEvent = new KeyboardEvent('keydown', { key, bubbles: true });
          this.simulateKeyPress(this.currentDirection); 
  
          // Simulate key release after short duration
          const releaseTimeout = setTimeout(() => {
              const releaseEvent = new KeyboardEvent('keyup', { key, bubbles: true });
              document.dispatchEvent(releaseEvent);
          }, KEY_PRESS_DURATION);
  
          this.activeTimeouts.push(releaseTimeout);
        }, jitterDelay); // Delay the entire key press
    }

    update() {
        if (!this.isMoving) {
            // Calculate new target position
            const accuracyError = (Math.random() * 200 - 100) * (1 - AI_ACCURACY);
            this.targetY = Math.max(0, Math.min(
                canvas.height - PADDLE_HEIGHT,
                this.predictedImpactY - PADDLE_HEIGHT/2 + accuracyError
            ));

            const currentY = gameState.paddles.right.y;
            const error = this.targetY - currentY;

            if (Math.abs(error) > this.positionThreshold) {
                // Determine direction
                this.currentDirection = error > 0 ? 'ArrowDown' : 'ArrowUp';
                
                // Simulate key press
                const pressEvent = new KeyboardEvent('keydown', { 
                    key: this.currentDirection, 
                    bubbles: true 
                });
                document.dispatchEvent(pressEvent);
                
                this.isMoving = true;
            }
        } else {
            // Check if reached target position
            const currentY = gameState.paddles.right.y;
            const error = this.targetY - currentY;

            if (Math.abs(error) <= this.positionThreshold) {
                // Simulate key release
                const releaseEvent = new KeyboardEvent('keyup', { 
                    key: this.currentDirection, 
                    bubbles: true 
                });
                document.dispatchEvent(releaseEvent);
                
                this.isMoving = false;
                this.currentDirection = null;
            }
        }
    }
}

// ========== GAME LOGIC ==========
function updateGameState() {
    // Update paddle positions
    gameState.paddles.left.y += gameState.paddles.left.speed;
    gameState.paddles.right.y += gameState.paddles.right.speed;

    // Paddle constraints
    gameState.paddles.left.y = Math.max(0, 
        Math.min(canvas.height - PADDLE_HEIGHT, gameState.paddles.left.y));
    gameState.paddles.right.y = Math.max(0, 
        Math.min(canvas.height - PADDLE_HEIGHT, gameState.paddles.right.y));

    // Update ball position
    gameState.ball.x += gameState.ball.speedX;
    gameState.ball.y += gameState.ball.speedY;

    // Wall collisions
    if (gameState.ball.y <= 0 || gameState.ball.y >= canvas.height) {
        gameState.ball.speedY *= -1;
    }

    // Paddle collisions
    const checkCollision = (paddle, xPos) => {
        return gameState.ball.y + BALL_SIZE > paddle.y &&
            gameState.ball.y - BALL_SIZE < paddle.y + PADDLE_HEIGHT &&
            Math.abs(gameState.ball.x - xPos) < BALL_SIZE + PADDLE_WIDTH;
    };

    if (checkCollision(gameState.paddles.left, PADDLE_WIDTH)) {
        gameState.ball.speedX = Math.abs(gameState.ball.speedX);
    }
    if (checkCollision(gameState.paddles.right, canvas.width - PADDLE_WIDTH)) {
        gameState.ball.speedX = -Math.abs(gameState.ball.speedX);
    }

    // Score handling
    if (gameState.ball.x < 0 || gameState.ball.x > canvas.width) {
        gameState.scores[gameState.ball.x < 0 ? 'right' : 'left']++;
        document.getElementById('leftScore').textContent = gameState.scores.left;
        document.getElementById('rightScore').textContent = gameState.scores.right;
        resetBall();
    }
}

function resetBall() {
    gameState.ball = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        speedX: (Math.random() > 0.5 ? 4 : -4) * (Math.random() * 0.2 + 0.9),
        speedY: (Math.random() * 8) - 4
    };
}

// ========== RENDERING ==========
function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    // Draw paddles
    ctx.fillRect(0, gameState.paddles.left.y, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillRect(canvas.width - PADDLE_WIDTH, gameState.paddles.right.y, 
                PADDLE_WIDTH, PADDLE_HEIGHT);
    // Draw ball
    ctx.beginPath();
    ctx.arc(gameState.ball.x, gameState.ball.y, BALL_SIZE, 0, Math.PI * 2);
    ctx.fill();
}

// ========== GAME LOOP ==========
function gameLoop() {
    updateGameState();
    ai.update(gameState.paddles.right);
    draw();
    requestAnimationFrame(gameLoop);
}

// ========== INITIALIZATION ==========
handleKeyInput();
const ai = new PongAI();
resetBall();
gameLoop();
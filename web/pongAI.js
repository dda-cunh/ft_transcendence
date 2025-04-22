import { gameState } from "./socket.js";

const AI_UPDATE_INTERVAL = 1000;
const AI_REACTION_JITTER = 200;
const AI_ACCURACY = 0.85;
const KEY_PRESS_DURATION = 20;


function getMovVector(x1, y1, x2, y2) {
    let dx = x2 - x1;
    let dy = y2 - y1;
    let magnitude = Math.sqrt(dx * dx + dy * dy);

    if (magnitude === 0) return { dx: 0, dy: 0 };

    return { dx: dx / magnitude, dy: dy / magnitude }
}

// ========== AI SYSTEM ==========
export default class PongAI {
    constructor(gameConstants) {
        this.predictedImpactY = gameConstants.canvas_h / 2;
        this.activeTimeouts = [];
        this.lastPrediction = Date.now();
        this.targetY = gameConstants.canvas_h / 2;
        this.positionThreshold = 10 + (1 - AI_ACCURACY) * 70;
        this.speed = 0;
        this.lastSnapshot = {x: 0, y: 0};
        this.initializeAI();
        this.gameConstants = gameConstants;
    }

    initializeAI() {
        setInterval(() => this.updateBallPrediction(), AI_UPDATE_INTERVAL);
    }

    updateBallPrediction() {
        // Store current ball state for prediction
        if (!gameState)
        {
            clearInterval(this.updateBallPrediction);
            return ;
        }

        let ballSnapshot = {
            x: gameState.ball.x,
            y: gameState.ball.y,
            speedX: this.speed,
            speedY: this.speed
        };

        let ballMov = getMovVector(this.lastSnapshot.x, this.lastSnapshot.y, gameState.ball.x, gameState.ball.y)
        if (!this.speed)
            this.speed = Math.sqrt((gameState.ball.x) ** 2 + (gameState.ball.y) ** 2);
        ballSnapshot.speedX = ballMov.dx * this.speed;
        ballSnapshot.speedY = ballMov.dy * this.speed;
        this.lastSnapshot = ballSnapshot;
        
        // Prediction logic with wall bounce simulation
        let virtualX = ballSnapshot.x;
        let virtualY = ballSnapshot.y;
        let virtualSpeedX = ballSnapshot.speedX;
        let virtualSpeedY = ballSnapshot.speedY;

        for (let steps = 0; steps < 5000; steps++) {
            if (virtualSpeedX > 0 && virtualX >= this.gameConstants.canvas_w - this.gameConstants.paddle_w) {
                this.predictedImpactY = virtualY;
                break;
            }

            const yTravel = virtualSpeedY > 0 
                ? this.gameConstants.canvas_h - virtualY 
                : -virtualY;
            const yTime = Math.abs(yTravel / virtualSpeedY);
            const xTime = (this.gameConstants.canvas_w - this.gameConstants.paddle_w - virtualX) / virtualSpeedX;
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
        
        const error = this.predictedImpactY - gameState.p2_pos_y;
    
        if (Math.abs(error) <= this.positionThreshold) return;
    
        const direction = error > 0 ? 'ArrowDown' : 'ArrowUp';
        const distance = Math.abs(error);
    
        const paddleSpeed = 10;
        const timeToHold = distance / paddleSpeed * 1000;
    
        const jitterDelay = Math.random() * AI_REACTION_JITTER;
    
        setTimeout(() => {
            const downEvent = new KeyboardEvent('keydown', { key: direction, bubbles: true });
            document.dispatchEvent(downEvent);
    
            const releaseTimeout = setTimeout(() => {
                const upEvent = new KeyboardEvent('keyup', { key: direction, bubbles: true });
                document.dispatchEvent(upEvent);
            }, timeToHold);
    
            this.activeTimeouts.push(releaseTimeout);
        }, jitterDelay);
    }
}

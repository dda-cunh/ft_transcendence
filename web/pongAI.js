export default class PongAI {
  constructor(gameConstants) {
    this.gameConstants = gameConstants;
    this.ballPhysics = new BallPhysics(gameConstants);
    this.currentDirection = null;
    this.lastPosition = null;
    this.calculatedSpeed = null;
    this.isActive = true;
    this.accuracy = 0.85;
    this.aiDelay = 500;
  }

  update(gameState) {
    if (!this.isActive) return;
    
    const currentTime = Date.now();
    // Skip processing if delay hasn't elapsed
    if (currentTime - this.lastProcessedTime < this.aiDelay) {
      return;
    }
    this.lastProcessedTime = currentTime; 
    if (gameState.ball.x === 0) {
      this.calculatedSpeed = null;
      this.lastPosition = null;
    }
  
    const currentBall = {
      x: gameState.ball.x,
      y: gameState.ball.y,
      timestamp: Date.now()
    };
    // console.log("Ball X:", currentBall.x);
    if (this.isBallApproaching(currentBall)) {
      this.calculatedSpeed = this.ballPhysics.calculateInitialSpeed(
        this.lastPosition,
        currentBall
      );
      // console.log("Calculated Speed:", this.calculatedSpeed)
    }

    if (this.calculatedSpeed) {
      const predictedY = this.ballPhysics.predictImpactY(
        currentBall,
        this.calculatedSpeed
      );
      console.log(predictedY);
      this.controlPaddle(predictedY, gameState.p2_pos_y);
    }

    this.lastPosition = currentBall;
  }

  isBallApproaching(currentBall) {
    return !this.lastPosition || this.lastPosition.x < currentBall.x;
  }

  controlPaddle(targetY, currentPaddleY) {
    const paddleCenter = currentPaddleY;
    const acc = Math.max(0.1, Math.abs(this.accuracy))
    const threshold = (this.gameConstants.paddle_h * 0.3) / acc;

    let newDirection = null;
    if (targetY < paddleCenter - threshold) {
      newDirection = 'ArrowUp'; // Corrected direction mapping
    } else if (targetY > paddleCenter + threshold) {
      newDirection = 'ArrowDown';
    }

    if (newDirection !== this.currentDirection) {
      this.dispatchKeyChange(newDirection);
    }
  }

  dispatchKeyChange(newDirection) {
    if (this.currentDirection) {
      const upEvent = new KeyboardEvent('keyup', { 
        key: this.currentDirection,
        bubbles: true
      });
      document.dispatchEvent(upEvent);
    }

    if (newDirection) {
      const downEvent = new KeyboardEvent('keydown', { 
        key: newDirection,
        bubbles: true
      });
      document.dispatchEvent(downEvent);
    }

    this.currentDirection = newDirection;
  }

  destroy() {
    this.isActive = false;
    this.dispatchKeyChange(null);
  }
}

class BallPhysics {
  constructor(gameConstants) {
    this.constants = gameConstants;
    this.paddleX = gameConstants.canvas_w - gameConstants.paddle_w;
  }

  calculateInitialSpeed(prev, current) {
    if (!prev) return null;
    const dt = (current.timestamp - prev.timestamp) / 1000;
    return dt > 0 ? {
      x: (current.x - prev.x) / dt,
      y: (current.y - prev.y) / dt
    } : null;
  }

  predictImpactY(currentBall, speed) {
    const centerOffsetY = this.constants.canvas_h / 2; // Half the canvas height
    const centerOffsetX = this.constants.canvas_w / 2; // Half the canvas height

    // Convert center-based coordinates to top-left canvas coordinates
    let virtualX = currentBall.x + centerOffsetX; // If X is also center-based
    let virtualY = currentBall.y + centerOffsetY; // Adjust Y to top-left system

    let currentSpeedY = speed.y;

    while (speed.x > 0 && virtualX < this.paddleX) {
      const timeToPaddle = (this.paddleX - virtualX) / speed.x;
      const timeToWall = currentSpeedY > 0 
        ? (this.constants.canvas_h - virtualY) / currentSpeedY // Distance to bottom wall
        : -virtualY / currentSpeedY; // Distance to top wall

      if (timeToPaddle <= timeToWall) {
        return virtualY + currentSpeedY * timeToPaddle - centerOffsetY; // Convert back to center-based Y
      }

      virtualX += speed.x * timeToWall;
      virtualY += currentSpeedY * timeToWall;
      currentSpeedY *= -1; // Reverse direction on wall bounce
      virtualY = Math.max(0, Math.min(virtualY, this.constants.canvas_h)); // Clamp to canvas bounds
    }

    return virtualY - centerOffsetY;
  }
}
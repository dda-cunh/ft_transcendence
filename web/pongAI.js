export default class PongAI {
  constructor(gameConstants) {
    this.gameConstants = gameConstants;
    this.ballPhysics = new BallPhysics(gameConstants);
    this.currentDirection = null;
    this.lastPosition = null;
    this.calculatedSpeed = null;
    this.isActive = true;
    this.accuracy = 1;
    this.aiDelay = 1000;
    this.lastKnownBall = null;
    this.predictedSpeed = null;
    this.lastProcessedTime = 0;
  }

  update(gameState) {
    console.log(this.gameConstants);
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

    const observedBall = {
      x: gameState.ball.x,
      y: gameState.ball.y,
      timestamp: currentTime,
    };
    // console.log("Ball X:", currentBall.x);
    if (this.lastKnownBall) {
      this.predictedSpeed = this.ballPhysics.calculateInitialSpeed(
        this.lastKnownBall,
        observedBall,
      );
    }

    if (this.predictedSpeed) {
      const timeSinceObservation = (currentTime - observedBall.timestamp) / 1000;
      const extrapolatedBall = this.ballPhysics.extrapolatePosition(
        observedBall,
        this.predictedSpeed,
        timeSinceObservation,
      );

      const predictedY = this.ballPhysics.predictImpactY(
        extrapolatedBall,
        this.predictedSpeed,
      );
      this.controlPaddle(predictedY, gameState.p2_pos_y);
    }

    this.lastKnownBall = observedBall;
    this.lastProcessedTime = currentTime;
  }

  controlPaddle(targetY, currentPaddleY) {
    let newDirection = null;
    const paddleCenter = currentPaddleY;
    const acc = Math.max(0.1, Math.abs(this.accuracy));
    const threshold = (this.gameConstants.paddle_h * 0.3) / acc;

    
    if (this.activeTimeout) {
      clearTimeout(this.activeTimeout);
      this.dispatchKeyChange(null);
    }
    const distance = targetY - paddleCenter;
    const absoluteDistance = Math.abs(distance);
    if (absoluteDistance < threshold) return;
    
    const direction = distance < 0 ? 'ArrowUp' : 'ArrowDown';
    const movementTime = (absoluteDistance / this.gameConstants.paddle_speed) * (1000 / this.gameConstants.framerate);

    this.dispatchKeyChange(direction);
    this.activeTimeout = setTimeout(() => {
      this.dispatchKeyChange(null);
      this.activeTimeout = null;
    }, movementTime) ; // Never exceed AI update interval
  }
  

  dispatchKeyChange(newDirection) {
    if (this.currentDirection) {
      const upEvent = new KeyboardEvent("keyup", {
        key: this.currentDirection,
        bubbles: true,
      });
      document.dispatchEvent(upEvent);
    }

    if (newDirection) {
      const downEvent = new KeyboardEvent("keydown", {
        key: newDirection,
        bubbles: true,
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
    this.centerOffsetY = this.constants.canvas_h / 2;
    this.centerOffsetX = this.constants.canvas_w / 2;
    
  }

  calculateInitialSpeed(prev, current) {
    if (!prev) return null;
    const dt = (current.timestamp - prev.timestamp) / 1000;
    return dt > 0
      ? {
          x: (current.x - prev.x) / dt,
          y: (current.y - prev.y) / dt,
        }
      : null;
  }

  predictImpactY(currentBall, speed) {
    // Convert center-based coordinates to top-left canvas coordinates
    let virtualX = currentBall.x + this.centerOffsetX; // If X is also center-based
    let virtualY = currentBall.y + this.centerOffsetY; // Adjust Y to top-left system

    let currentSpeedY = speed.y;

    while (speed.x > 0 && virtualX < this.paddleX) {
      const timeToPaddle = (this.paddleX - virtualX) / speed.x;
      const timeToWall =
        currentSpeedY > 0
          ? (this.constants.canvas_h - virtualY) / currentSpeedY // Distance to bottom wall
          : -virtualY / currentSpeedY; // Distance to top wall

      if (timeToPaddle <= timeToWall) {
        return virtualY + currentSpeedY * timeToPaddle - this.centerOffsetY; // Convert back to center-based Y
      }

      virtualX += speed.x * timeToWall;
      virtualY += currentSpeedY * timeToWall;
      currentSpeedY *= -1; // Reverse direction on wall bounce
      virtualY = Math.max(0, Math.min(virtualY, this.constants.canvas_h)); // Clamp to canvas bounds
    }

    return virtualY - this.centerOffsetY;
  }
  
  extrapolatePosition(observedBall, speed, elapsedTime) {
    let virtualX = observedBall.x + this.centerOffsetX;
    let virtualY = observedBall.y + this.centerOffsetY;
    let remainingTime = elapsedTime;
    let currentSpeedY = speed.y;

    // Simulate wall bounces during the unobserved period
    while (remainingTime > 0 && speed.x > 0) {
      const timeToWall = currentSpeedY > 0 
        ? (this.constants.canvas_h - virtualY) / currentSpeedY
        : -virtualY / currentSpeedY;
      
      const stepTime = Math.min(remainingTime, timeToWall);
      virtualX += speed.x * stepTime;
      virtualY += currentSpeedY * stepTime;
      remainingTime -= stepTime;

      if (stepTime === timeToWall) {
        currentSpeedY *= -1; // Bounce on wall
      }
    }

    return {
      x: virtualX - this.centerOffsetX,
      y: virtualY - this.centerOffsetY,
      timestamp: observedBall.timestamp + elapsedTime * 1000
    };
  }
}

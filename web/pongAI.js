export default class PongAI {
  constructor(gameConstants) {
    this.gameConstants = gameConstants;
    this.ballPhysics = new BallPhysics(gameConstants);
    this.currentDirection = null;
    this.isActive = true;
    this.accuracy = 1;
    this.aiDelay = 1000;
    this.lastKnownBall = null;
    this.predictedSpeed = null;
    this.lastProcessedTime = 0;
  }

  update(gameState) {
    if (!this.isActive) return;

    const currentTime = Date.now();
    if (currentTime - this.lastProcessedTime < this.aiDelay) return;
    
    this.lastProcessedTime = currentTime;
    const observedBall = {
      x: gameState.ball.x,
      y: gameState.ball.y,
      timestamp: currentTime,
    };

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
  }

  controlPaddle(targetY, currentPaddleY) {
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
    const movementTime = (absoluteDistance / this.gameConstants.paddle_speed) * 
      (1000 / this.gameConstants.framerate);

    this.dispatchKeyChange(direction);
    this.activeTimeout = setTimeout(() => {
      this.dispatchKeyChange(null);
      this.activeTimeout = null;
    }, movementTime);
  }

  dispatchKeyChange(newDirection) {
    if (this.currentDirection) {
      document.dispatchEvent(new KeyboardEvent("keyup", {
        key: this.currentDirection,
        bubbles: true,
      }));
    }

    if (newDirection) {
      document.dispatchEvent(new KeyboardEvent("keydown", {
        key: newDirection,
        bubbles: true,
      }));
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
  }

  calculateInitialSpeed(prev, current) {
    if (!prev) return null;
    const dt = (current.timestamp - prev.timestamp) / 1000;
    return dt > 0 ? {
      x: (current.x - prev.x) / dt,
      y: (current.y - prev.y) / dt,
    } : null;
  }

  predictImpactY(currentBall, speed) {
    let virtualY = currentBall.y + this.centerOffsetY;
    let currentSpeedY = speed.y;
    let virtualX = currentBall.x + this.constants.canvas_w / 2;

    while (speed.x > 0 && virtualX < this.paddleX) {
      const timeToPaddle = (this.paddleX - virtualX) / speed.x;
      const timeToWall = currentSpeedY > 0
        ? (this.constants.canvas_h - virtualY) / currentSpeedY
        : -virtualY / currentSpeedY;

      if (timeToPaddle <= timeToWall) {
        return virtualY + currentSpeedY * timeToPaddle - this.centerOffsetY;
      }

      virtualX += speed.x * timeToWall;
      virtualY += currentSpeedY * timeToWall;
      currentSpeedY *= -1;
      virtualY = Math.max(0, Math.min(virtualY, this.constants.canvas_h));
    }

    return virtualY - this.centerOffsetY;
  }
  
  extrapolatePosition(observedBall, speed, elapsedTime) {
    let virtualY = observedBall.y + this.centerOffsetY;
    let virtualX = observedBall.x + this.constants.canvas_w / 2;
    let remainingTime = elapsedTime;
    let currentSpeedY = speed.y;

    while (remainingTime > 0 && speed.x > 0) {
      const timeToWall = currentSpeedY > 0 
        ? (this.constants.canvas_h - virtualY) / currentSpeedY
        : -virtualY / currentSpeedY;
      
      const stepTime = Math.min(remainingTime, timeToWall);
      virtualX += speed.x * stepTime;
      virtualY += currentSpeedY * stepTime;
      remainingTime -= stepTime;

      if (stepTime === timeToWall) {
        currentSpeedY *= -1;
      }
    }

    return {
      x: virtualX - this.constants.canvas_w / 2,
      y: virtualY - this.centerOffsetY,
    };
  }
}
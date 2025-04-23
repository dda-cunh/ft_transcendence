import { gameState, gameConstants } from "./socket.js";

const AI_REACTION_TIME = 25;
const PREDICTION_FRAMES = 60;
const MOVEMENT_THRESHOLD = 5;

export default class PongAI {
  constructor() {
    this.activeDirection = null;
    this.updateInterval = null;
    this.isActive = false;
    this.currentY = 0;
    this.safeConstants = {
      canvas_w: 800,
      canvas_h: 600,
      paddle_w: 20,
      paddle_h: 100,
      ball_rad: 5
    };
    this.initialize();
  }

  initialize() {
    this.isActive = true;
    this.updateInterval = setInterval(() => {
      if (this.isActive) this.update();
    }, AI_REACTION_TIME);
  }

  getValidConstants() {
    return gameConstants || this.safeConstants;
  }

  getCurrentPaddlePosition() {
    if (!gameState) return this.currentY;
    const constants = this.getValidConstants();
    this.currentY = gameState.p2_pos_y + (constants.canvas_h / 2);
    return this.currentY;
  }

  predictImpactPosition() {
    try {
      if (!gameState?.ball) return this.currentY;
      const constants = this.getValidConstants();

      // Convert relative positions to absolute coordinates
      const ballAbsX = gameState.ball.x + (constants.canvas_w / 2);
      const ballAbsY = gameState.ball.y + (constants.canvas_h / 2);
      const paddleX = constants.canvas_w - constants.paddle_w;

      // Handle invalid ball speed
      if (Math.abs(gameState.ball.speedX) < 0.1) return this.currentY;

      // Calculate time to impact with safety checks
      const timeToImpact = (paddleX - ballAbsX) / gameState.ball.speedX;
      if (!Number.isFinite(timeToImpact)) return this.currentY;

      // Predict Y position with wall bounce simulation
      let predictedY = ballAbsY + (gameState.ball.speedY * timeToImpact);
      const maxY = constants.canvas_h - constants.ball_rad;
      const minY = constants.ball_rad;

      // Normalize predicted position
      while (predictedY > maxY || predictedY < minY) {
        predictedY = predictedY > maxY
          ? 2 * maxY - predictedY
          : 2 * minY - predictedY;
      }

      // Return paddle center position
      return predictedY - (constants.paddle_h / 2);

    } catch (error) {
      console.error('Prediction error:', error);
      return this.currentY;
    }
  }

  update() {
    if (!this.isActive) return;

    try {
      const targetY = this.predictImpactPosition();
      const currentY = this.getCurrentPaddlePosition();

      // Validate numerical values
      if (!Number.isFinite(targetY)) {
        console.warn('Invalid target position');
        return;
      }

      const deltaY = targetY - currentY;

      console.log('Current paddle Y:', currentY);
      console.log('Target Y:', targetY);
      console.log('Delta Y:', deltaY);

      if (Math.abs(deltaY) > MOVEMENT_THRESHOLD) {
        const direction = deltaY > 0 ? 'ArrowDown' : 'ArrowUp';
        this.handleMovement(direction);
      } else {
        this.releaseMovement();
      }
    } catch (error) {
      console.error('Update error:', error);
    }
  }

  destroy() {
    this.isActive = false;
    clearInterval(this.updateInterval);
    this.releaseMovement();
    console.log('AI destroyed');
  }
  handleMovement(direction) {
    if (this.activeDirection === direction) return;

    this.releaseMovement();

    const targetElement = document.getElementById('gameCanvas') || document.body;

    const downEvent = new KeyboardEvent('keydown', {
      key: direction,
      code: direction,
      bubbles: true,
      cancelable: true,
      composed: true,
      repeat: false
    });

    targetElement.dispatchEvent(downEvent);
    this.activeDirection = direction;

    setTimeout(() => {
      this.releaseMovement();
    }, AI_REACTION_TIME / 2);
  }

  releaseMovement() {
    if (!this.activeDirection) return;

    const targetElement = document.getElementById('gameCanvas') || document.body;

    const upEvent = new KeyboardEvent('keyup', {
      key: this.activeDirection,
      code: this.activeDirection,
      bubbles: true,
      cancelable: true,
      composed: true
    });

    targetElement.dispatchEvent(upEvent);
    this.activeDirection = null;
  }

}

import { gameState } from "./socket.js";
import { gameConstants } from "./socket.js";

const AI_UPDATE_INTERVAL = 1000;
const AI_REACTION_JITTER = 200;
const AI_ACCURACY = 0.85;


class Point2D {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

class Vec2D {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	normalize() {
		const length = Math.sqrt(this.x ** 2 + this.y ** 2);
		if (length === 0) return new Vec2D(0, 0);
		return new Vec2D(this.x / length, this.y / length);
	}

	dot(v) {
		return this.x * v.x + this.y * v.y;
	}

	reflect(normal) {
		const dot = this.dot(normal);
		return new Vec2D(this.x - 2 * dot * normal.x, this.y - 2 * dot * normal.y);
	}

	static fromPoints(p1, p2)
	{
		return new Vec2D(p2.x - p1.x, p2.y - p1.y);
	}
}

class Line {
	constructor(a, b, c) {
		this.a = a;
		this.b = b;
		this.c = c;
	}

	static fromPoints(p1, p2) {
		const a = p2.y - p1.y;
		const b = p1.x - p2.x;
		const c = p2.x * p1.y - p1.x * p2.y;
		return new Line(a, b, c);
	}

	intersect(line) {
		const det = this.a * line.b - this.b * line.a;
		if (det === 0) return null; // Parallel
		const x = (this.b * line.c - this.c * line.b) / det;
		const y = (this.c * line.a - this.a * line.c) / det;
		return new Point2D(x, y);
	}

	getNormalVec() {
		const len = Math.sqrt(this.a ** 2 + this.b ** 2);
		if (len === 0) return new Vec2D(0, 0);
		return new Vec2D(-this.b / len, this.a / len);
	}
}

export default class PongAI {
	constructor() {
		this.activeTimeouts = [];
		this.lastGamestate = null;
		this.targetY = 0;
		this.positionThreshold = 10 + (1 - AI_ACCURACY) * 70;
		this.isMoving = false;
		this.currentDirection = null;
		this.currentY = 0;
		this.initializeAI();
	}

	initializeAI() {
		setInterval(() => this.updateBallPrediction(), AI_UPDATE_INTERVAL);
		setInterval(() => this.doMove(), AI_REACTION_JITTER);
	}

	updateBallPrediction() {
		if (!gameState || !gameState.ball) return;

		if (this.lastGamestate)
		{
			if (this.lastGamestate.p1_score != gameState.p1_score || this.lastGamestate.p2_score != gameState.p2_score)
			{
				this.lastGamestate = JSON.parse(JSON.stringify(gameState));
				return;
			}
		}
		this.lastGamestate = JSON.parse(JSON.stringify(gameState));

			const ballSnapshot = {
				x: gameState.ball.x,
				y: gameState.ball.y,
				speedX: 4,
				speedY: 4
			};
	
			let virtualX = ballSnapshot.x;
			let virtualY = ballSnapshot.y;
			let virtualSpeedX = ballSnapshot.speedX;
			let virtualSpeedY = ballSnapshot.speedY;
			const paddleWidth = gameConstants.paddle_w;
			for (let steps = 0; steps < 5000; steps++) {
				// Predict until ball reaches right paddle
				if (virtualSpeedX > 0 && virtualX >= gameConstants.canvas_w/2 - paddleWidth) {
					this.predictedImpactY = virtualY + gameConstants.canvas_h/2;
					break;
				}
	
				// Handle wall collisions
				const nextY = virtualY + virtualSpeedY;
				if (nextY < -gameConstants.canvas_h/2 || 
					nextY > gameConstants.canvas_h/2) {
					virtualSpeedY *= -1;
				}
	
				virtualX += virtualSpeedX;
				virtualY += virtualSpeedY;
			}
		this.targetY = gameState.ball.y - gameConstants.paddle_h / 2;
		console.log("Ball Y:", gameState.ball.y, "Target Y:", this.targetY);
	}
	

	doMove() {
		if (!this.lastGamestate)
			return;
		const currentY = this.lastGamestate.p2_pos_y;
		const error = (this.targetY - currentY);
		if (Math.abs(error) > this.positionThreshold)
		{
			this.currentDirection = error > 0 ? 'ArrowDown' : 'ArrowUp';

			const pressEvent = new KeyboardEvent('keydown', { 
				key: this.currentDirection, 
				bubbles: true 
			});

			document.dispatchEvent(pressEvent);
			const releaseTimeout = setTimeout(() => {
				const upEvent = new KeyboardEvent('keyup', { key: this.currentDirection, bubbles: true });
				this.currentDirection = null;
				this.isMoving = false;
				document.dispatchEvent(upEvent);
			}, 500);
			this.activeTimeouts.push(releaseTimeout);
		}
	}
}

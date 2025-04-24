import { gameState } from "./socket.js";
import { gameConstants } from "./socket.js";

const AI_UPDATE_INTERVAL = 1000;
const AI_REACTION_JITTER = 100;
const AI_ACCURACY = 1;

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

	static fromPoints(p1, p2) {
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
		if (det === 0) return null; // Parallel lines
		const x = (this.b * line.c - this.c * line.b) / det;
		const y = (this.c * line.a - this.a * line.c) / det;
		return new Point2D(x, y);
	}

	getNormalVec() {
		const len = Math.sqrt(this.a ** 2 + this.b ** 2);
		if (len === 0) return new Vec2D(0, 0);
		return new Vec2D(-this.b / len, this.a / len); // Perpendicular normal
	}
}


export default class PongAI {
	constructor() {
		this.activeTimeouts = [];
		this.lastGamestate = null;
		this.predictedImpactY = 0;
		this.targetY = 0;
		this.positionThreshold = 5;
		this.currentDirection = null;
		this.initializeAI();
	}

	initializeAI() {
		setInterval(() => this.updateBallPrediction(), AI_UPDATE_INTERVAL);
		setInterval(() => this.doMove(), AI_REACTION_JITTER);
	}

	updateBallPrediction() {
		if (!gameState) return;
	
		if (!this.lastGamestate) {
			this.lastGamestate = JSON.parse(JSON.stringify(gameState));
			this.predictedImpactY = gameState.ball.y;
			this.targetY = this.predictedImpactY;
			return;
		}
	
		const canvasTop = gameConstants.canvas_h / 2;
		const canvasBottom = -gameConstants.canvas_h / 2;
		const canvasRight = gameConstants.canvas_w / 2;
		const canvasLeft = -gameConstants.canvas_w / 2;
	
		let pos = new Point2D(gameState.ball.x, gameState.ball.y);
		let velocity = Vec2D.fromPoints(
			new Point2D(this.lastGamestate.ball.x, this.lastGamestate.ball.y),
			pos
		).normalize();
	
		const walls = [
			{ name: "top", line: new Line(0, 1, -canvasTop) },
			{ name: "bottom", line: new Line(0, 1, -canvasBottom) },
			{ name: "left", line: new Line(1, 0, -canvasLeft) },
			{ name: "right", line: new Line(1, 0, -canvasRight) },
		];
	
		let iterations = 0;
	
		while (iterations++ < 50) {
			const trajectory = Line.fromPoints(pos, new Point2D(pos.x + velocity.x, pos.y + velocity.y));
	
			let closest = null;
			let minDist = Infinity;
	
			for (const wall of walls) {
				const point = trajectory.intersect(wall.line);
				if (!point) continue;
	
				const toHit = new Vec2D(point.x - pos.x, point.y - pos.y);
				if (velocity.dot(toHit) <= 0) continue; // Behind ball
	
				// Check bounds
				if (wall.name === "top" || wall.name === "bottom") {
					if (point.x < canvasLeft || point.x > canvasRight) continue;
				} else {
					if (point.y < canvasBottom || point.y > canvasTop) continue;
				}
	
				const dist = toHit.x ** 2 + toHit.y ** 2;
				if (dist < minDist) {
					minDist = dist;
					closest = {
						name: wall.name,
						point: point,
						normal: wall.line.getNormalVec()
					};
				}
			}
	
			if (!closest) break;
	
			pos = closest.point;
	
			if (closest.name === "right") break; // Reached paddle side
	
			velocity = velocity.reflect(closest.normal);
		}
	
		this.predictedImpactY = pos.y;
	
		const accuracyError = (Math.random() * 200 - 100) * (1 - AI_ACCURACY);
		this.targetY = this.predictedImpactY - gameConstants.paddle_h / 2 + accuracyError;
	
		this.targetY = Math.max(
			-gameConstants.canvas_h / 2,
			Math.min(gameConstants.canvas_h / 2 - gameConstants.paddle_h, this.targetY)
		);
	
		this.lastGamestate = JSON.parse(JSON.stringify(gameState));
	}
	
	

	doMove()
	{
		if (!this.lastGamestate)
			return;
		const currentY = this.lastGamestate.p2_pos_y;
		const error = this.targetY - currentY;

		// Clear previous timeouts to prevent stacking
		this.activeTimeouts.forEach(clearTimeout);
		this.activeTimeouts = [];

		if (Math.abs(error) > gameConstants.paddle_h / 2) {
			this.currentDirection = error > 0 ? 'ArrowDown' : 'ArrowUp';

			const pressEvent = new KeyboardEvent('keydown', {
				key: this.currentDirection,
				bubbles: true
			});
			document.dispatchEvent(pressEvent);

			const releaseTimeout = setTimeout(() => {
				const upEvent = new KeyboardEvent('keyup', {
					key: this.currentDirection,
					bubbles: true
				});
				this.currentDirection = null;
				document.dispatchEvent(upEvent);
			}, AI_REACTION_JITTER / 1.2);

			this.activeTimeouts.push(releaseTimeout);
		}
	}
}

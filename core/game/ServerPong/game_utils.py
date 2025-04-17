import uuid
import math
from dataclasses import dataclass
from enum import Enum

# ─── Canvas & bounds ─────────────────────────────────────────────────────────
CANVAS_W   = 800
CANVAS_H   = 600
HALF_W     = CANVAS_W  / 2
HALF_H     = CANVAS_H  / 2

LEFT_BOUND   = -HALF_W
RIGHT_BOUND  =  HALF_W
TOP_BOUND    =  HALF_H
BOTTOM_BOUND = -HALF_H

# ─── Paddle & ball sizes/speeds ─────────────────────────────────────────────
PADDLE_WIDTH   = 40
PADDLE_HEIGHT  = CANVAS_H / 4.5
PADDLE_SPEED   = 10

BALL_SIZE      = 20      # diameter
FRAME_MOVE_PX  = 1.2
SCORE_TO_WIN   = 3

# ─── Optional “defaults” for starting positions ──────────────────────────────
P1_START_X = LEFT_BOUND  + PADDLE_WIDTH/2
P1_START_Y = 0
P2_START_X = RIGHT_BOUND - PADDLE_WIDTH/2
P2_START_Y = 0

@dataclass
class Point2D:
	x: float
	y: float

class Vec2D:
	"""2D vector for direction & speed."""
	def __init__(self, x: float = 0, y: float = 0):
		self.x, self.y = x, y

	def normalize(self):
		length = math.hypot(self.x, self.y)
		if length:
			self.x /= length
			self.y /= length
		return self

	def scale(self, factor: float):
		self.x *= factor
		self.y *= factor
		return self

	def apply_to_point(self, p: Point2D) -> Point2D:
		return Point2D(p.x + self.x, p.y + self.y)

	@classmethod
	def from_points(cls, start: Point2D, end: Point2D) -> 'Vec2D':
		return cls(end.x - start.x, end.y - start.y)

@dataclass
class GameState:
	p1_pos: Point2D
	p2_pos: Point2D
	p1_score: int
	p2_score: int
	ball_pos: Point2D
	ball_vec: Vec2D

	def to_dict(self):
		return {
			'p1_pos_y': self.p1_pos.y,
			'p2_pos_y': self.p2_pos.y,
			'p1_score': self.p1_score,
			'p2_score': self.p2_score,
			'ball': {
				'x': self.ball_pos.x,
				'y': self.ball_pos.y,
			}
		}

	def to_redis(self):
		return {
			'p1_x': self.p1_pos.x,
			'p1_y': self.p1_pos.y,
			'p2_x': self.p2_pos.x,
			'p2_y': self.p2_pos.y,
			'p1_score': self.p1_score,
			'p2_score': self.p2_score,
			'ball_x': self.ball_pos.x,
			'ball_y': self.ball_pos.y,
			'vec_x': self.ball_vec.x,
			'vec_y': self.ball_vec.y,
		}

@staticmethod
def from_redis(data):
	return GameState(
		p1_pos = Point2D(float(data['p1_x']), float(data['p1_y'])),
		p2_pos = Point2D(float(data['p2_x']), float(data['p2_y'])),
		p1_score = int(data['p1_score']),
		p2_score = int(data['p2_score']),
		ball_pos = Point2D(float(data['ball_x']), float(data['ball_y'])),
		ball_vec = Vec2D(float(data['vec_x']), float(data['vec_y'])),
	)


class KeyState(Enum):
	UP   =  1
	IDLE =  0
	DOWN = -1

@dataclass
class PlayersActions:
	p1_key_scale: KeyState
	p2_key_scale: KeyState

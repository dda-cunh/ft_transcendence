import uuid
import math

from dataclasses import dataclass
from enum import Enum

CANVAS_H = 600
CANVAS_W = 800
FRAME_MOVE_PX = 0.5
PADDLE_HEIGHT = CANVAS_H / 4.5
PADDLE_WIDTH = 40
BALL_SIZE = 125
SCORE_TO_WIN = 3

@dataclass
class	Point2D:
	x: float
	y: float

class	Vec2D:
	def	__init__(self, x: float = 0, y: float = 0):
		self.x = x
		self.y = y

	def	normalize(self):
		len = math.hypot(self.x, self.y)
		if len != 0:
			self.x /= len
			self.y /= len
		else:
			self.x = 0
			self.y = 0
		return

	def	apply_to_point(self, point: Point2D) -> Point2D:
		return (Point2D(point.x + self.x, point.y + self.y))

	@classmethod
	def	from_points(cls, start: Point2D, end: Point2D) -> 'Vec2D':
		return cls(end.x - start.x, end.y - start.y)

@dataclass
class	GameState:
	player_1_id: uuid
	player_2_id: uuid
	player_1_pos: Point2D
	player_2_pos: Point2D
	player_1_score: int
	player_2_score: int
	ball_pos: Point2D
	ball_vec: Vec2D
 
class	KeyState(Enum):
	UP = 1
	IDLE = 0
	DOWN = -1

@dataclass
class	UpdateVars:
	player_1_key_scale: KeyState
	player_2_key_scale: KeyState
 
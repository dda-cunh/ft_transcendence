import uuid
import math

from dataclasses import dataclass
from enum import Enum

CANVAS_H = 600
CANVAS_W = 800
CANVAS_MID_X = 0
CANVAS_MID_Y = 0
FRAME_MOVE_PX = 1.2
PADDLE_HEIGHT = CANVAS_H / 4.5
PADDLE_WIDTH = 40
PADDLE_SPEED = 10
BALL_SIZE = 125
SCORE_TO_WIN = 3

@dataclass
class	Point2D:
	"""Represents a point in 2D space."""
	x: float
	y: float

class	Line:
	"""Represents a line in 2D space in the general form Ax + By + C = 0."""
	def	__init__(self, a: float, b: float, c: float):
		self.a = a
		self.b = b
		self.c = c

	def	intersect(self, other: 'Line')-> Point2D | None:
		determinant = self.a * other.b - other.a * self.b
		if determinant == 0:
			return None
		x = (self.b * other.c - other.b * self.c) / determinant
		y = (self.c * other.a - other.c * self.a) / determinant
		return (Point2D(x, y))

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

	def	scale(self, factor: float):
		self.x *= factor
		self.y *= factor
		return

	def	make_line(self, point: Point2D)-> Line:
		a = self.y
		b = -a
		c = a * point.y - b * point.x
		return (Line(a, b, c))

	def	apply_to_point(self, point: Point2D) -> Point2D:
		return (Point2D(point.x + self.x, point.y + self.y))

	@classmethod
	def	from_points(cls, start: Point2D, end: Point2D) -> 'Vec2D':
		return (cls(end.x - start.x, end.y - start.y))

@dataclass
class	GameState:
	# p1_id: uuid
	# p2_id: uuid
	p1_pos: Point2D
	p2_pos: Point2D
	p1_score: int
	p2_score: int
	ball_pos: Point2D
	ball_vec: Vec2D

dataclass
class	RedisGameVars:
	p1_id: uuid
	p2_id: uuid
	state: GameState

class	KeyState(Enum):
	UP = 1
	IDLE = 0
	DOWN = -1

@dataclass
class	PlayersActions:
	p1_key_scale: KeyState
	p2_key_scale: KeyState
 
import uuid
import math
from ServerPong.redis_utils import r
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
PADDLE_WIDTH   = 20
PADDLE_HEIGHT  = CANVAS_H / 4.5
PADDLE_SPEED   = 10

BALL_SIZE      = 20      # diameter
BASE_SPEED_PPS = 500      # pixels per second
TICKS_PER_SECOND = 60
# FRAME_MOVE_PX  = 5       # pixels per frame
SCORE_TO_WIN   = 5


# ─── Optional “defaults” for starting positions ──────────────────────────────
P1_START_X = LEFT_BOUND  + PADDLE_WIDTH/2
P1_START_Y = 0
P2_START_X = RIGHT_BOUND - PADDLE_WIDTH/2
P2_START_Y = 0


MATCH_PREFIX = "match_"

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

class	Match:
	def	__init__(self, p1_id: uuid, p2_id: uuid, state: GameState, room_name: str):
		self.room_name: str = room_name
		self.p1_id: uuid = p1_id
		self.p2_id: uuid = p2_id
		self.state: GameState = state
		self.player_act: PlayersActions = PlayersActions(KeyState.IDLE, KeyState.IDLE)

		# self.snapshot()
		return

	# def	snapshot(self):
	# 	r.hset(f"{MATCH_PREFIX}{self.room_name}", mapping=self.to_redis())
	# 	return

	def	to_redis(self):
		return {
			'room_name': self.room_name,
			'p1_id': self.p1_id,
			'p2_id': self.p2_id,
			'state': self.state.to_dict()
		}

	def load_snapshot(self):
		return Match((self.from_redis(r.hgetall(f"{MATCH_PREFIX}{self.room_name}"))))

	@staticmethod
	def match_from_redis(data):
		return Match(
			room_name = data['room_name'],
			p1_id = data['p1_id'],
			p2_id = data['p2_id'],
			state = from_redis(data['state'])
		)

class	MatchManager:
	def	__init__(self):
		self.matches = {}
		return

	def	create_match(self, p1_id: uuid, p2_id: uuid, state: GameState, room_name: str):
		self.matches[room_name] = Match(p1_id, p2_id, state, room_name)
		return

	def	get_match(self, room_name: str)-> Match: 
		return (self.matches.get(room_name))

	def	remove_match(self, room_name: str):
		if (room_name in self.matches):
			del self.matches[room_name]
		return

match_manager = MatchManager()

import redis
import json
import uuid

from ServerPong.constants import REDIS_URL

r = redis.Redis.from_url(REDIS_URL, decode_responses=True)

QUEUE_KEY = 'single_game_queue'
MATCH_MODE = "remote"
TOURNM_KEY = 'tournament_queue'
TOURN_MODE = "tournament"

def enqueue_user(user_id, mode):
	if mode == "remote":
		r.rpush(QUEUE_KEY, user_id)
	elif mode == "tournament":
		r.rpush(TOURNM_KEY, user_id)

def dequeue_user(mode):
	if mode == "remote":
		return r.lpop(QUEUE_KEY)
	elif mode == "tournament":
		return r.lpop(TOURNM_KEY)

def create_local_room(user_id):
	room_name = f"local_{uuid.uuid4().hex[:24]}"
	r.set(room_name, json.dumps([user_id]))
	return room_name

def create_room(user1, user2):
	room_name = f"room_{uuid.uuid4().hex[:24]}"
	r.set(room_name, json.dumps([user1, user2]))
	return room_name

def create_lobby(players):
	room_name = f"lobby_{uuid.uuid4().hex[:24]}"
	for p in players:
		r.sadd(room_name, p)
	return room_name

def create_tournament_room(user1, user2):
	players = sorted([str(user1), str(user2)])
	room_name = f"room_{players[0]}_{players[1]}"
	if not r.exists(room_name):
		r.set(room_name, json.dumps([user1, user2]))
	return room_name

def set_user_mode(user_id, mode):
	r.set(f"user_mode_{user_id}", mode)

def get_user_mode(user_id):
	return r.get(f"user_mode_{user_id}")

def set_room_by_user(user_id, room_name):
	r.set(f"user_room_{user_id}", room_name)

def get_room_by_user(user_id):
	room = r.get(f"user_room_{user_id}")
	if r.exists(f"{room}"):
		return r.get(f"user_room_{user_id}")
	return None

def cancel_expiry(user_id):
	r.persist(f"user_room_{user_id}")
	r.persist(f"user_mode_{user_id}")
	if r.exists(f"user_channel_{user_id}"):
		r.persist(f"user_channel_{user_id}")
	room_name = get_room_by_user(user_id)
	if not room_name:
		return
	room_data = r.get(room_name)
	if not room_data:
		return
	users = json.loads(room_data)
	if len(users) == 2:
		r.persist(room_name)

def get_queue_size(mode):
	if mode == "remote":
		return r.llen(QUEUE_KEY)
	elif mode == "tournament":
		return r.llen(TOURNM_KEY)

def is_user_in_queue(user_id, mode):
	if mode == "remote":
		queue = r.lrange(QUEUE_KEY, 0, -1)
		return user_id in queue
	elif mode == "tournament":
		queue = r.lrange(TOURNM_KEY, 0, -1)
		return user_id in queue

def remove_user_from_queue(user_id, mode):
	if mode == "remote":
		r.lrem(QUEUE_KEY, 0, user_id)
	elif mode == "tournament":
		r.lrem(TOURNM_KEY, 0, user_id)

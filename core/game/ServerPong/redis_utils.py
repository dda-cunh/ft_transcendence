import redis
import json
import uuid

from ServerPong.constants import REDIS_URL

r = redis.Redis.from_url(REDIS_URL, decode_responses=True)

QUEUE_KEY = 'single_game_queue'

def enqueue_user(user_id):
	r.rpush(QUEUE_KEY, user_id)

def dequeue_user():
	return r.lpop(QUEUE_KEY)

def create_room(user1, user2):
	room_name = f"room_{uuid.uuid4().hex[:24]}"
	r.set(room_name, json.dumps([user1, user2]))
	return room_name

def set_room_by_user(user_id, room_name):
	r.set(f"user_room_{user_id}", room_name)

def get_room_by_user(user_id):
	room = r.get(f"user_room_{user_id}")
	if r.exists(f"{room}"):
		return r.get(f"user_room_{user_id}")
	return None

def cancel_expiry(user_id):
	r.persist(f"user_room_{user_id}")
	room_name = get_room_by_user(user_id)
	if not room_name:
		return
	room_data = r.get(room_name)
	if not room_data:
		return
	users = json.loads(room_data)
	if len(users) == 2:
		r.persist(room_name)


def get_queue_size():
	return r.llen(QUEUE_KEY)

def is_user_in_queue(user_id):
	queue = r.lrange(QUEUE_KEY, 0, -1)
	return user_id in queue

def remove_user_from_queue(user_id):
	r.lrem(QUEUE_KEY, 0, user_id)
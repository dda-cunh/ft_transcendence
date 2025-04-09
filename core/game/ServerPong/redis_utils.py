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
    room_name = str(uuid.uuid4())
    r.set(room_name, json.dumps([]))
    return room_name

def set_room_by_user(user_id, room_name):
    r.set(f"user_room_{user_id}", room_name)

def get_room_by_user(user_id):
    return r.get(f"user_room_{user_id}")

def get_room_user_count(room_name):
    users = json.loads(r.get(room_name))
    return len(users)

def cancel_expiry(user_id):
    r.persist(f"user_room_{user_id}")
    room_data = json.loads(r.get(get_room_by_user(user_id)))
    if len(room_data) == 2:
        r.persist(room_data)

def get_queue_size():
    return r.llen(QUEUE_KEY)

def remove_user_from_queue(user_id):
    r.lrem(QUEUE_KEY, 0, user_id)
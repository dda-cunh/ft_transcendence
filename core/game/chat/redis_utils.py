import redis
import json

from ServerPong.constants import REDIS_URL

r = redis.Redis.from_url(REDIS_URL, decode_responses=True)

QUEUE_KEY = 'chat_queue'
CONV_PREFIX = 'chat_conv_'

def enqueue_user(user_id):
    r.rpush(QUEUE_KEY, user_id)

def dequeue_user():
    return r.lpop(QUEUE_KEY)

def create_conversation(user1, user2):
    conv_key = f"{CONV_PREFIX}{user1}_{user2}"
    r.set(conv_key, json.dumps([]))  # empty conversation
    return conv_key

def append_message(conv_key, message):
    messages = json.loads(r.get(conv_key))
    messages.append(message)
    r.set(conv_key, json.dumps(messages))

def get_conversation(conv_key):
    return json.loads(r.get(conv_key))

def get_queue_size():
    return r.llen(QUEUE_KEY)

def remove_user_from_queue(user_id):
    queue = r.lrange(QUEUE_KEY, 0, -1)  # Get all elements of the queue
    if user_id in queue:
        queue.remove(user_id)
        r.delete(QUEUE_KEY)  # Clear the queue
        if queue:
            r.rpush(QUEUE_KEY, *queue)

import asyncio
import json
from collections import defaultdict
from ServerPong.redis_utils import *

room_tasks = {}

async def monitor_room(room_name, channel_layer):
    try:
        while True:
            await asyncio.sleep(1)
            users_raw = r.get(room_name)
            if not users_raw:
                break

            users = json.loads(users_raw)
            still_active = [u for u in users if r.exists(f"user_room_{u}")]
            if len(still_active) != 2:
                # One or both players missing
                opponent_id = next((u for u in users if not r.exists(f"user_room_{u}")), None)
                opponent_name = r.get(f"name_{opponent_id}") if opponent_id else "Opponent"

                await channel_layer.group_send(
                    room_name,
                    {
                        'type': 'room_message',
                        'message': f'{opponent_name} has not returned. Ending game',
                        'close': True,
                        'task': False,
                    }
                )

                for u in users:
                    if r.exists(f"user_room_{u}"):
                        r.delete(f"user_room_{u}")
                    if r.exists(f"user_mode_{u}"):
                        r.delete(f"user_mode_{u}")
                    if r.exists(f"name_{u}"):
                        r.delete(f"name_{u}")

                r.delete(room_name)
                break
    except asyncio.CancelledError:
        pass
    finally:
        room_tasks.pop(room_name, None)

def start_monitor(room_name, channel_layer):
    if room_name not in room_tasks:
        task = asyncio.create_task(monitor_room(room_name, channel_layer))
        room_tasks[room_name] = task

def stop_monitor(room_name):
    task = room_tasks.get(room_name)
    if task:
        task.cancel()

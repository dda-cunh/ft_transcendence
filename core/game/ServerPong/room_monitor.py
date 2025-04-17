
import asyncio
import json
from collections import defaultdict
from ServerPong.redis_utils import *

room_tasks = {}

async def monitor_room(room_name, channel_layer):
    await asyncio.sleep(1)
    if not room_name:
        room_tasks.pop(room_name, None)
        return
    users_raw = r.get(room_name)
    if not users_raw:
        room_tasks.pop(room_name, None)
        return
    users = json.loads(users_raw)
    userName = r.get(f"name_{users[0]}")
    opponentName = r.get(f"name_{users[-1]}")
    await channel_layer.group_send(
        room_name,
        {
            'type': 'room_message',
            'message': f'Match: {opponentName} vs {userName}!',
            'close': False,
        }
    )
    mode = get_user_mode(users[0])
    r.set(f"keystate_{users[0]}", 0)
    r.set(f"keystate_{users[-1]}", 0)
    still_active = [u for u in users if r.exists(f"user_room_{u}")]
    while True:
        await asyncio.sleep(1)
        if not room_name:
            break
        users_raw = r.get(room_name)
        if not users_raw:
            break

        # Insert gameloop logic here:
        # Get the current gamestate from redis
        # call get_next_frame with gamestate and redis keystates
        # send the gamestate to the players
        # save the new gamestate to redis
        # delay loop by FRAME_RATE
        # Check if the game is still active by way of scores

        users = json.loads(users_raw)
        still_active = [u for u in users if r.exists(f"user_room_{u}")]
        if len(still_active) != 2:
            # One or both players missing
            close = True
            if mode == TOURN_MODE:
                close = False
            await channel_layer.group_send(
                room_name,
                {
                    'type': 'room_message',
                    'message': f'{opponentName} has not returned. Ending game',
                    'close': close,
                }
            )
            break
	if r.exists(f"keystate_{users[0]}"):
		r.delete(f"keystate_{users[0]}")
    if r.exists(f"keystate_{users[-1]}"):
        r.delete(f"keystate_{users[-1]}")
    still_active = [u for u in users if r.exists(f"user_room_{u}")]
    if mode == TOURN_MODE:
        for u in still_active:
            r.delete(f"user_room_{u}")
    r.delete(room_name)
    room_tasks.pop(room_name, None)

def start_monitor(room_name, channel_layer):
    if room_name not in room_tasks:
        task = asyncio.create_task(monitor_room(room_name, channel_layer))
        room_tasks[room_name] = task

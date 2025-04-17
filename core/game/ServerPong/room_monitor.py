
import asyncio
import json
from collections import defaultdict
from ServerPong.redis_utils import *
from ServerPong.game_logic import *
from ServerPong.game_utils import *

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

	await asyncio.sleep(1)
	state = GameState(
		p1_pos   = Point2D(P1_START_X, P1_START_Y),
		p2_pos   = Point2D(P2_START_X, P2_START_Y),
		p1_score = 0,
		p2_score = 0,
		ball_pos = Point2D(0, 0),
		ball_vec = Vec2D(0, 0),
	)

	await channel_layer.group_send(
		room_name,
		{
			'type': 'room_message',
			'message': False,
			'gamestate': state.to_dict(),
			'close': False,
		}
	)

	r.hset(f"gamestate_{room_name}", mapping=state.to_redis())

	while True:
		# Insert gameloop logic here:

		# Get the current gamestate from redis
		actions = PlayersActions(
			p1_key_scale = int(r.get(f"keystate_{users[0]}")),
			p2_key_scale = int(r.get(f"keystate_{users[-1]}")),
		)
		# call get_next_frame with gamestate and redis keystates
		raw_state = r.hgetall(f"gamestate_{room_name}")
		state = get_next_frame(from_redis(raw_state), actions)

		# send the gamestate to the players
		await channel_layer.group_send(
			room_name,
			{
				'type': 'room_message',
				'message': False,
				'gamestate': state.to_dict(),
				'close': False,
			}
		)
		# save the new gamestate to redis
		r.hset(f"gamestate_{room_name}", mapping=state.to_redis())

		# delay loop by FRAME_RATE
		await asyncio.sleep(0.05)

		# Check if the game is still active by way of scores
		if state.p1_score >= SCORE_TO_WIN or state.p2_score >= SCORE_TO_WIN:
			if state.p1_score >= SCORE_TO_WIN:
				delete_user_info(users[-1])
			else:
				delete_user_info(users[0])
			break

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
					'gamestate': False,
					'close': close,
				}
			)
			break
	r.delete(f"gamestate_{room_name}")
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

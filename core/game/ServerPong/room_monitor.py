
import asyncio
import json
from collections import defaultdict
from ServerPong.redis_utils import *
from ServerPong.game_logic import *
from ServerPong.game_utils import *

room_tasks = {}

async def local_monitor_room(self):
	userName = "p1"
	opponentName = "p2"
	initial = {
	'canvas_w': CANVAS_W,
	'canvas_h': CANVAS_H,
	'paddle_w': PADDLE_WIDTH,
	'paddle_h': int(PADDLE_HEIGHT),
	'ball_rad': int(BALL_SIZE * 0.5),
	'p1_name': userName,
	'p2_name': opponentName,
	}
	state = GameState(
		p1_pos   = Point2D(P1_START_X, P1_START_Y),
		p2_pos   = Point2D(P2_START_X, P2_START_Y),
		p1_score = 0,
		p2_score = 0,
		ball_pos = Point2D(0, 0),
		ball_vec = Vec2D(0, 0),
	)
	r.set(f"keystate_p1_{self.user_id}", "IDLE")
	r.set(f"keystate_p2_{self.user_id}", "IDLE")
	r.hset(f"gamestate_{self.user_id}", mapping=state.to_redis())
	await self.send(text_data=json.dumps({
		'initial': initial,
		'gamestate': state.to_dict()
	}))

	while True:
		raw_state = r.hgetall(f"gamestate_{self.user_id}")
		old_state = from_redis(raw_state)

		actions = PlayersActions(
			p1_key_scale = KeyState[r.get(f"keystate_p1_{self.user_id}")],
			p2_key_scale = KeyState[r.get(f"keystate_p2_{self.user_id}")],
		)
		
		state = get_next_frame(old_state, actions)
		await self.send(text_data=json.dumps({
			'gamestate': state.to_dict()
		}))
		
		r.hset(f"gamestate_{self.user_id}", mapping=state.to_redis())
		await asyncio.sleep(1.0/TICKS_PER_SECOND)
		if state.p1_score >= SCORE_TO_WIN or state.p2_score >= SCORE_TO_WIN:
			break
	r.delete(f"gamestate_{self.user_id}")
	if r.exists(f"keystate_p1_{self.user_id}"):
		r.delete(f"keystate_p1_{self.user_id}")
	if r.exists(f"keystate_p2_{self.user_id}"):
		r.delete(f"keystate_p2_{self.user_id}")
	await self.send(text_data=json.dumps({
		'message': 'Game ended. Leaving room...',
	}))
	del self.task
	await self.close()


async def monitor_room(room_name, channel_layer):
	from tracker.create import save_match_history
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
	initial = {
		'canvas_w': CANVAS_W,
		'canvas_h': CANVAS_H,
		'paddle_w': PADDLE_WIDTH,
		'paddle_h': int(PADDLE_HEIGHT),
		'ball_rad': int(BALL_SIZE * 0.5),
		'p1_name': userName,
		'p2_name': opponentName,
	}
	await channel_layer.group_send(
		room_name,
		{
			'type': 'room_message',
			'message': f'Match: {opponentName} vs {userName}!',
			'close': False,
			'initial': False,
			'gamestate': False,
		}
	)
	mode = get_user_mode(users[0])
	r.set(f"keystate_{users[0]}", "IDLE")
	r.set(f"keystate_{users[-1]}", "IDLE")
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
			'initial': initial,
		}
	)

	r.hset(f"gamestate_{room_name}", mapping=state.to_redis())
	winner = None
	while True:
		# Insert gameloop logic here:
		raw_state = r.hgetall(f"gamestate_{room_name}")
		old_state = from_redis(raw_state)

		# Get the current gamestate from redis
		actions = PlayersActions(
			p1_key_scale = KeyState[r.get(f"keystate_{users[0]}")],
			p2_key_scale = KeyState[r.get(f"keystate_{users[-1]}")],
		)
		# call get_next_frame with gamestate and redis keystates
		state = get_next_frame(old_state, actions)

		# send the gamestate to the players
		await channel_layer.group_send(
			room_name,
			{
				'type': 'room_message',
				'message': False,
				'gamestate': state.to_dict(),
				'close': False,
				'initial': False,
			}
		)
		# save the new gamestate to redis
		r.hset(f"gamestate_{room_name}", mapping=state.to_redis())

		# delay loop by FRAME_RATE
		await asyncio.sleep(1.0/TICKS_PER_SECOND)

		# Check if the game is still active by way of scores
		if state.p1_score >= SCORE_TO_WIN or state.p2_score >= SCORE_TO_WIN:
			if state.p1_score >= SCORE_TO_WIN:
				winner = userName
			else:
				winner = opponentName
			break

		still_active = [u for u in users if r.exists(f"user_room_{u}")]
		if len(still_active) != 2:
			# One or both players missing
			winner = r.get(f"name_{still_active[0]}")
			await channel_layer.group_send(
				room_name,
				{
					'type': 'room_message',
					'message': f'{opponentName} has not returned. Ending game',
					'gamestate': False,
					'close': False,
					'initial': False,
				}
			)
			break

	r.delete(f"gamestate_{room_name}")
	if r.exists(f"keystate_{users[0]}"):
		r.delete(f"keystate_{users[0]}")
	if r.exists(f"keystate_{users[-1]}"):
		r.delete(f"keystate_{users[-1]}")

	winningplayer = None
	losingplayer = None
	if winner == userName:
		winningplayer = users[0]
		losingplayer = users[-1]
	else:
		winningplayer = users[-1]
		losingplayer = users[0]
	
	# save match to db
	save_match = {
		"player1": users[0],
		"player2": users[-1],
		"winner": winningplayer,
	}
	
	match_info = await save_match_history(save_match)
	
	if mode == TOURN_MODE:
		r.set(f"match_id_{room_name}", match_info['id'])


	still_active = [u for u in users if r.exists(f"user_room_{u}")]
	for u in still_active:
		r.delete(f"user_room_{u}")
	if mode != TOURN_MODE:
		

		await channel_layer.group_send(
			room_name,
			{
				'type': 'room_message',
				'message': f'Winner: {winner}!. Game ended. Leaving room...',
				'close': True,
				'gamestate': False,
				'initial': False,
			}
		)
		delete_user_info(users[0])
		delete_user_info(users[-1])
		r.delete(room_name)
		room_tasks.pop(room_name, None)
		return
	
	await channel_layer.group_discard(room_name, r.get(f"user_channel_{winningplayer}"))
	r.delete(f"user_room_{winningplayer}")
	r.delete(f"user_lobby_{losingplayer}")
	await channel_layer.group_send(
		room_name,
		{
			'type': 'room_message',
			'message': f'Winner: {winner}!. Game ended. Leaving room...',
			'close': True,
			'gamestate': False,
			'initial': False,
		}
	)
	delete_user_info(losingplayer)
	r.delete(room_name)
	room_tasks.pop(room_name, None)


def start_monitor(room_name, channel_layer):
	if room_name not in room_tasks:
		task = asyncio.create_task(monitor_room(room_name, channel_layer))
		room_tasks[room_name] = task

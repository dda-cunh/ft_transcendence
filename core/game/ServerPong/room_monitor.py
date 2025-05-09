
import asyncio
import json
from collections import defaultdict
from ServerPong.redis_utils import *
from ServerPong.game_logic import *
from ServerPong.game_utils import *
from ServerPong.game_utils import Match, match_manager

room_tasks = {}

async def local_monitor_room(self):
	if (match_manager.get_match(self.room_name)):
		match_manager.remove_match(self.room_name)
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
	'paddle_speed': PADDLE_SPEED,
	'framerate': TICKS_PER_SECOND,
	}
	state = GameState(
		p1_pos   = Point2D(P1_START_X, P1_START_Y),
		p2_pos   = Point2D(P2_START_X, P2_START_Y),
		p1_score = 0,
		p2_score = 0,
		ball_pos = Point2D(0, 0),
		ball_vec = Vec2D(0, 0),
	)

	match_manager.create_match(self.user_id, self.user_id, state, self.room_name)
	match = match_manager.get_match(self.room_name)
	
	await self.send(text_data=json.dumps({
		'initial': initial,
		'gamestate': state.to_dict()
	}))

	while True:
		state = get_next_frame(match.state, match.player_act)

		await self.send(text_data=json.dumps({
			'gamestate': state.to_dict()
		}))
		
		match.state = state
		await asyncio.sleep(1.0/TICKS_PER_SECOND)
		if state.p1_score >= SCORE_TO_WIN or state.p2_score >= SCORE_TO_WIN:
			break
	match_manager.remove_match(self.room_name)
	await self.send(text_data=json.dumps({
		'message': 'Game ended.',
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
			'message': f'Match: {userName} vs {opponentName}!',
			'gamestate': state.to_dict(),
			'close': False,
			'initial': initial,
		}
	)

	match_manager.create_match(users[0], users[1], state, room_name)
	match = match_manager.get_match(room_name)
	
	winner = None
	while True:
		state = get_next_frame(match.state, match.player_act)

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
		match.state = state
		# delay loop by FRAME_RATE
		await asyncio.sleep(1.0/TICKS_PER_SECOND)

		# Check if the game is still active by way of scores
		if match.state.p1_score >= SCORE_TO_WIN or match.state.p2_score >= SCORE_TO_WIN:
			if match.state.p1_score >= SCORE_TO_WIN:
				winner = "p1"
			else:
				winner = "p2"
			break

		still_active = [u for u in users if r.exists(f"user_room_{u}")]
		if len(still_active) != 2:
			# One or both players missing
			loser = None
			if still_active[0] == users[0]:
				winner = "p1"
				loser = opponentName
			else:
				winner = "p2"
				loser = userName
			await channel_layer.group_send(
				room_name,
				{
					'type': 'room_message',
					'message': f'{loser} has not returned. Ending game',
					'gamestate': False,
					'close': False,
					'initial': False,
				}
			)
			break

	match_manager.remove_match(match.room_name)
	winningplayer = None
	losingplayer = None
	if winner == "p1":
		winningplayer = users[0]
		losingplayer = users[-1]
		winner = userName
	else:
		winningplayer = users[-1]
		losingplayer = users[0]
		winner = opponentName

	# save match to db
	save_match = {
		"player1": users[0],
		"player2": users[-1],
		"p1_score": state.p1_score,
		"p2_score": state.p2_score,
		"winner": winningplayer
	}
	
	match_info = await save_match_history(save_match)

	mode = get_user_mode(users[0])
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
				'message': f'Winner: {winner}!. Game ended.',
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
			'message': f'Winner: {winner}!. Game ended.',
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

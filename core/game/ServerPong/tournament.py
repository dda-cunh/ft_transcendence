import redis
import json
import asyncio
import random

from urllib.parse import parse_qs
from django.contrib.auth import get_user_model
from channels.generic.websocket import AsyncWebsocketConsumer

from ServerPong.constants import REDIS_URL, TIMEOUT
from ServerPong.redis_utils import *
from ServerPong.utils import asyncGet, AsyncGetData, validate_user_token, validate_mode
from ServerPong.room_monitor import start_monitor

class TournamentConsumer(AsyncWebsocketConsumer):

	async def connect(self):
		await self.accept()

		self.user_id, error_msg = await validate_user_token(self.scope)
		if self.user_id:
			error_msg = await validate_mode(self.user_id, TOURN_MODE, "single match")
		if error_msg:
			await self.send(error_msg)
			await self.close()
			return
		
		self.lobby_name = None

		user_lobby = get_lobby_by_user(self.user_id)
		if user_lobby:
			warnChannel = user_lobby
			if get_room_by_user(self.user_id):
				warnChannel = get_room_by_user(self.user_id)
			await self.channel_layer.group_add(
				warnChannel,
				self.channel_name,
			)
			await self.channel_layer.group_send(
				warnChannel,
				{
					'type': 'room_message',
					'message': 'Reconnected to peer!',
					'gamestate': False,
					'close': False,
					'initial': False,
				}
			)
			cancel_expiry(self.user_id)
			r.set(f"user_channel_{self.user_id}", self.channel_name)
			return
		elif r.exists(f"user_lobby_{self.user_id}"):
			r.delete(f"user_lobby_{self.user_id}")

		if get_queue_size(TOURN_MODE) > 2:
			r.set(f"user_channel_{self.user_id}", self.channel_name)
			players = [self.user_id]
			for i in range(3):
				players.append(dequeue_user(TOURN_MODE))
			
			random.shuffle(players)
			lobby_name = create_lobby(players)

			player_list = [p for p in r.smembers(lobby_name)]

			for player_id in player_list:
				channel = r.get(f"user_channel_{player_id}")
				await self.channel_layer.group_add(lobby_name, channel)
				set_lobby_by_user(player_id, lobby_name)

			await self.channel_layer.group_send(
				lobby_name,
				{
					'type': 'room_message',
					'message': 'Tournament is starting!',
					'gamestate': False,
					'close': False,
					'initial': False,
				}
			)

			asyncio.create_task(generate_round(self.channel_layer, lobby_name))
			return
		
		enqueue_user(self.user_id, TOURN_MODE)
		r.set(f"user_channel_{self.user_id}", self.channel_name)
		await self.send(text_data=json.dumps({"message": "queued"}))


	async def disconnect(self, close_code):
		if not hasattr(self, 'user_id') or get_user_mode(self.user_id) != TOURN_MODE:
			return
		lobby = get_lobby_by_user(self.user_id)
		if lobby:
			warnChannel = lobby
			if get_room_by_user(self.user_id):
				warnChannel = get_room_by_user(self.user_id)
			expire_user_info(self.user_id)
			await self.channel_layer.group_send(
				warnChannel,
				{
					'type': 'room_message',
					'message': 'Player disconnected',
					'gamestate': False,
					'close': False,
					'initial': False,
				}
			)
		elif is_user_in_queue(self.user_id, TOURN_MODE):
			remove_user_from_queue(self.user_id, TOURN_MODE)
			delete_user_info(self.user_id)
		else:
			delete_user_info(self.user_id)


	async def receive(self, text_data):
		data = json.loads(text_data)
		if data.get('tname') and not r.exists(f"name_{self.user_id}"):
			r.set(f"name_{self.user_id}", data['tname'])
		if data.get('keystate'):
			r.set(f"keystate_{self.user_id}", data['keystate'])


	async def room_message(self, event):
		if event['message']:
			message = event['message']
			await self.send(text_data=json.dumps({
				'message': message
			}))
		initial = event.get('initial')
		if initial is not False:
			await self.send(text_data=json.dumps({ 'initial': initial }))
		gamestate = event.get('gamestate')
		if gamestate is not False:
			await self.send(text_data=json.dumps({ 'gamestate': gamestate }))
		if event['close']:
			await self.close()


async def generate_match(channel_layer, lobby_name, player_id, opponent_id):

	userName = r.get(f"name_{player_id}")
	opponentName = r.get(f"name_{opponent_id}")

	match_name = create_tournament_room(player_id, opponent_id)
	set_room_by_user(player_id, match_name)
	set_room_by_user(opponent_id, match_name)
	
	await channel_layer.group_discard(lobby_name, r.get(f"user_channel_{player_id}"))
	await channel_layer.group_discard(lobby_name, r.get(f"user_channel_{opponent_id}"))
	await channel_layer.group_add(match_name, r.get(f"user_channel_{player_id}"))
	await channel_layer.group_add(match_name, r.get(f"user_channel_{opponent_id}"))

	start_monitor(match_name, channel_layer)
	return match_name


async def generate_round(channel, lobby_name):
	from tracker.create import save_tournament_history, save_tournament_match_history

	copy_matches = []
	winner = None
	while True:
		players = [p for p in r.smembers(lobby_name)]
		matches = []
		i = 0
		lastp = None
		for p in players:
			if i % 2 == 0:
				lastp = p
				i += 1
				continue
			match = await generate_match(channel, lobby_name, lastp, p)
			matches.append(match)
			copy_matches.append(match)
			i += 1

		while matches:
			await asyncio.sleep(1)
			matches = [m for m in matches if r.exists(m)]

		players = [p for p in r.smembers(lobby_name)]
		for p in players:
			if r.exists(f"user_channel_{p}"):
				user_channel = r.get(f"user_channel_{p}")
				await channel.group_add(lobby_name, user_channel)
			else:
				r.srem(lobby_name, p)

		await channel.group_send(
			lobby_name,
			{
				'type': 'room_message',
				'message': "You won the match!",
				'gamestate': False,
				'close': False,
				'initial': False,
			}
		)

		winner = await check_tournament_end(channel, lobby_name)
		if winner:
			break

	tournament = await save_tournament_history({"winner": winner})

	for m in copy_matches:
		singlematch = r.get(f"match_id_{m}")
		stage = "semifinal"
		if m == copy_matches[-1]:
			stage = "final"
		tmatch = {
			"tournament": tournament['id'],
			"match": singlematch,
			"stage": stage,
		}
		r.delete(f"match_id_{m}")
		await save_tournament_match_history(tmatch)


async def check_tournament_end(channel, lobby_name):
	nextplayers = [p for p in r.smembers(lobby_name)]
	for p in nextplayers:
		if not r.exists(f"user_channel_{p}"):
			r.srem(lobby_name, p)

	nextplayers = [p for p in r.smembers(lobby_name)]

	if len(nextplayers) == 1:
		await channel.group_send(
			lobby_name,
			{
				'type': 'room_message',
				'message': 'You won the tournament! CONGRATS!!! Closing lobby...',
				'gamestate': False,
				'close': True,
				'initial': False,
			}
		)
		r.delete(lobby_name)
		return nextplayers[0]
	return False

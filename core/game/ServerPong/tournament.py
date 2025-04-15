import redis
import json
import asyncio
import random

from urllib.parse import parse_qs
from django.contrib.auth import get_user_model
from channels.generic.websocket import AsyncWebsocketConsumer

from ServerPong.constants import REDIS_URL, TIMEOUT
from ServerPong.redis_utils import *
from ServerPong.utils import asyncGet, AsyncGetData


class TournamentConsumer(AsyncWebsocketConsumer):

	async def connect(self):
		await self.accept()

		scope = self.scope

		url = 'http://auth:8000/validate'

		token = scope.get('token')
		if not token:
			await self.send(json.dumps({'message': "Not authenticated"}))
			await self.close()
			return

		headers = {"Authorization": f"{token}"}

		response :AsyncGetData = await asyncGet(url, headers)

		if response.status != 200:
			await self.send(json.dumps({'message': "Not authenticated"}))
			await self.close()
			return

		data = response.json()
		self.send(json.dumps({'message': data}))
		self.user_id = data['payload']['user_id']
		self.lobby_name = None

		if not get_user_mode(self.user_id):
			set_user_mode(self.user_id, TOURN_MODE)
		elif get_user_mode(self.user_id) != TOURN_MODE:
			await self.send(text_data=json.dumps({"message": "subscribed to single match. Rejecting..."}))
			await self.close()
			return
		elif get_user_mode(self.user_id) == TOURN_MODE and is_user_in_queue(self.user_id, TOURN_MODE):
			await self.send(text_data=json.dumps({"message": "already in queue"}))
			await self.close()
			return

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
					'close': False,
					'task': False,
					'lobby_name': None,
				}
			)
			cancel_expiry(self.user_id)
			r.set(f"user_channel_{self.user_id}", self.channel_name)
			self.task = asyncio.create_task(self.periodic_check_for_room(r.get(f"user_channel_{self.user_id}"), \
			user_lobby, self.user_id))
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
					'close': False,
					'task': True,
					'lobby_name': lobby_name,
				}
			)
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
			r.setex(f"user_lobby_{self.user_id}", TIMEOUT, get_lobby_by_user(self.user_id))
			r.setex(f"user_mode_{self.user_id}", TIMEOUT, TOURN_MODE)
			if get_room_by_user(self.user_id):
				r.setex(f"user_room_{self.user_id}", TIMEOUT, get_room_by_user(self.user_id))
				warnChannel = get_room_by_user(self.user_id)
			r.setex(f"user_channel_{self.user_id}", TIMEOUT, self.channel_name)
			r.expire(f"name_{self.user_id}", TIMEOUT)
			await self.channel_layer.group_send(
				warnChannel,
				{
					'type': 'room_message',
					'message': 'Player disconnected',
					'close': False,
					'task': False,
					'lobby_name': None,
				}
			)
			self.task.cancel()
			del self.task
		elif is_user_in_queue(self.user_id, TOURN_MODE):
			remove_user_from_queue(self.user_id, TOURN_MODE)
			r.delete(f"user_mode_{self.user_id}")
			if (r.exists(f"user_channel_{self.user_id}")):
				r.delete(f"user_channel_{self.user_id}")
			r.delete(f"name_{self.user_id}")


	async def receive(self, text_data):
		data = json.loads(text_data)
		if data.get('tname') and not r.exists(f"name_{self.user_id}"):
			r.set(f"name_{self.user_id}", data['tname'])


	async def room_message(self, event):
		if event['task']:
			if hasattr(self, 'task'):
				self.task.cancel()
				del self.task
			self.task = asyncio.create_task(self.periodic_check_for_room(r.get(f"user_channel_{self.user_id}"), \
			event['lobby_name'], self.user_id))
		message = event['message']
		await self.send(text_data=json.dumps({
			'message': message
		}))
		if event['close']:
			await self.close()


	async def generate_match(self, channel, lobby_name, player_id):
		player_list = [p for p in r.smembers(lobby_name)]

		while len(player_list) < 2:
			await asyncio.sleep(1)
			player_list = [p for p in r.smembers(lobby_name)]

		match_name = None
		opponent_id = None

		i = player_list.index(player_id)
		if i % 2 == 0:
			opponent_id = player_list[i + 1]
		else:
			opponent_id = player_list[i - 1]

		userName = r.get(f"name_{player_id}")
		opponentName = r.get(f"name_{opponent_id}")

		match_name = create_tournament_room(player_id, opponent_id)
		set_room_by_user(player_id, match_name)
		
		await self.channel_layer.group_add(match_name, channel)
		await self.channel_layer.group_discard(lobby_name, channel)

		await self.send(text_data=json.dumps({"message": f"Match: {userName} against {opponentName}!"}))

		return player_list, opponent_id, match_name


	async def periodic_check_for_room(self, channel, lobby_name, player_id):
		relaunch = False
		try:
			player_list = [p for p in r.smembers(lobby_name)]
			match_name = get_room_by_user(player_id)
			opponent_id = None
			
			if not get_room_by_user(player_id):
				player_list, opponent_id, match_name = await self.generate_match(channel, lobby_name, player_id)
			else:
				for p in player_list:
					if p != player_id and get_room_by_user(p) and get_room_by_user(p) == match_name:
						opponent_id = p

			opponentName = r.get(f"name_{opponent_id}")
			while True:
				await asyncio.sleep(1)
				still_active = 0
				if r.exists(f"user_channel_{player_id}"):
					still_active += 1
				if r.exists(f"user_channel_{opponent_id}"):
					still_active += 1
				if still_active != 2:
					await self.channel_layer.group_send(
						match_name,
						{
							'type': 'room_message',
							'message': f'Player {opponentName} has not returned. Ending game',
							'close': False,
							'task': False,
							'lobby_name': None,
						}
					)
					await self.channel_layer.group_add(lobby_name, channel)
					await self.channel_layer.group_discard(match_name, channel)
					r.delete(match_name)
					break

			if r.sismember(lobby_name, opponent_id):
				r.srem(lobby_name, opponent_id)
			if not r.sismember(lobby_name, player_id):
				r.sadd(lobby_name, player_id)

			await asyncio.sleep(1)
			await self.send(text_data=json.dumps({"message": 'You won the match!'}))


			if await self.check_tournament_end(lobby_name, player_id):
				self.task.cancel()
				del self.task

			nextplayers = [p for p in r.smembers(lobby_name)]
			res = False
			while len(nextplayers) != 2:
				await asyncio.sleep(1)
				res = await self.check_tournament_end(lobby_name, player_id)
				if res:
					self.task.cancel()
					del self.task
					break
				nextplayers = [p for p in r.smembers(lobby_name)]

			if not res:
				relaunch = True

		except asyncio.CancelledError:
			return

		if hasattr(self, 'task'):
			self.task.cancel()
			del self.task
		if relaunch:
			self.task = asyncio.create_task(self.periodic_check_for_room(channel, \
			lobby_name, player_id))


	async def check_tournament_end(self, lobby_name, player_id):
		nextplayers = [p for p in r.smembers(lobby_name)]
		for p in nextplayers:
			if not r.exists(f"user_channel_{p}"):
				r.srem(lobby_name, p)
				nextplayers.remove(p)

		if len(nextplayers) == 1:
			await self.send(text_data=json.dumps({"message": "You won the tournament! CONGRATS!!!"}))
			await self.channel_layer.group_send(
				lobby_name,
				{
					'type': 'room_message',
					'message': 'Closing lobby...',
					'close': True,
					'task': False,
					'lobby_name': None,
				}
			)
			r.delete(lobby_name)
			r.delete(f"user_lobby_{player_id}")
			r.delete(f"user_mode_{player_id}")
			return True
		return False
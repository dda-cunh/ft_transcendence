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

		user_room = get_room_by_user(self.user_id)
		if user_room:
			await self.channel_layer.group_add(
				user_room,
				self.channel_name,
			)
			await self.channel_layer.group_send(
				user_room,
				{
					'type': 'room_message',
					'message': 'Reconnected to peer!',
					'close': False,
					'task': False,
					'lobby_name': None,
				}
			)
			cancel_expiry(self.user_id)
			return
		elif r.exists(f"user_room_{self.user_id}"):
			r.delete(f"user_room_{self.user_id}")

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
		user_room = get_room_by_user(self.user_id)
		if user_room:
			r.setex(f"user_room_{self.user_id}", TIMEOUT, user_room)
			r.setex(f"user_mode_{self.user_id}", TIMEOUT, TOURN_MODE)
			r.setex(f"user_channel_{self.user_id}", TIMEOUT, TOURN_MODE)
			await self.channel_layer.group_send(
				user_room,
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
		else:
			remove_user_from_queue(self.user_id, TOURN_MODE)
			r.delete(f"user_mode_{self.user_id}")
			if (r.exists(f"user_channel_{self.user_id}")):
				r.delete(f"user_channel_{self.user_id}")


	async def receive(self, text_data):
		data = json.loads(text_data)

	async def room_message(self, event):
		message = event['message']
		await self.send(text_data=json.dumps({
			'message': message
		}))
		if event['close']:
			await self.close()
		if event['task']:
			if hasattr(self, 'task'):
				self.task.cancel()
				del self.task
			self.task = asyncio.create_task(self.periodic_check_for_room(r.get(f"user_channel_{self.user_id}"), \
			event['lobby_name'], self.user_id))

	async def periodic_check_for_room(self, channel, lobby_name, player_id):
		try:
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

			await self.send(text_data=json.dumps({"message": f"You are {player_id}!"}))
			match_name = create_tournament_room(player_id, opponent_id)
			set_room_by_user(player_id, match_name)
			
			await self.channel_layer.group_add(match_name, channel)
			await self.channel_layer.group_discard(lobby_name, channel)

			await self.send(text_data=json.dumps({"message": f"Match against {opponent_id}!"}))

			while True:
				await asyncio.sleep(5)
				still_active = []
				if get_room_by_user(player_id):
					still_active.append(player_id)
				if get_room_by_user(opponent_id):
					still_active.append(opponent_id)
				if len(still_active) < 2:
					await self.channel_layer.group_send(
						match_name,
						{
							'type': 'room_message',
							'message': f'Player {opponent_id} has not returned. Ending game',
							'close': False,
							'task': False,
							'lobby_name': None,
						}
					)
					await self.channel_layer.group_add(lobby_name, channel)
					await self.channel_layer.group_discard(match_name, channel)
					r.delete(match_name)
					r.delete(f"user_room_{player_id}")
					break

			if r.sismember(lobby_name, opponent_id):
				r.srem(lobby_name, opponent_id)
			if not r.sismember(lobby_name, player_id):
				r.sadd(lobby_name, player_id)

			# check end of tournament
			nextplayers = [p for p in r.smembers(lobby_name)]

			if len(player_list) == 2 and len(nextplayers) == 1:
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
				r.delete(f"user_room_{player_id}")
				r.delete(f"user_mode_{player_id}")
				asyncio.current_task().cancel()
			elif len(nextplayers) < 2:
				asyncio.current_task().cancel()

			await self.channel_layer.group_send(
				lobby_name,
				{
					'type': 'room_message',
					'message': 'You won this match! Awaiting next round...',
					'close': False,
					'task': True,
					'lobby_name': lobby_name,
				}
			)

		except asyncio.CancelledError:
			return
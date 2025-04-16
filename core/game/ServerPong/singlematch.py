import redis
import json
import asyncio

from urllib.parse import parse_qs
from django.contrib.auth import get_user_model
from channels.generic.websocket import AsyncWebsocketConsumer

from ServerPong.constants import REDIS_URL, TIMEOUT
from ServerPong.redis_utils import *
from ServerPong.utils import asyncGet, AsyncGetData, validate_user_token
from ServerPong.room_monitor import start_monitor


class LocalPongConsumer(AsyncWebsocketConsumer):

	async def connect(self):
		await self.accept()

		self.user_id, error_msg = await validate_user_token(self.scope)
		if error_msg:
			await self.send(error_msg)
			await self.close()
			return

		self.room_name = create_local_room(self.user_id)

		await self.channel_layer.group_add(self.room_name, self.channel_name)
		await self.send(json.dumps({'message': "Welcome to local room!"}))

	async def disconnect(self, close_code):
		pass

	async def receive(self, text_data):
		data = json.loads(text_data)



class RemotePongConsumer(AsyncWebsocketConsumer):

	async def connect(self):
		await self.accept()

		self.user_id, error_msg = await validate_user_token(self.scope)
		if error_msg:
			await self.send(error_msg)
			await self.close()
			return
		
		self.room_name = None

		if not get_user_mode(self.user_id):
			set_user_mode(self.user_id, MATCH_MODE)
		elif get_user_mode(self.user_id) != MATCH_MODE:
			await self.send(text_data=json.dumps({"message": "subscribed to tournament. Rejecting..."}))
			await self.close()
			return
		elif get_user_mode(self.user_id) == MATCH_MODE and is_user_in_queue(self.user_id, MATCH_MODE):
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
				}
			)
			cancel_expiry(self.user_id)
			start_monitor(user_room, self.channel_layer)
			return
		elif r.exists(f"user_room_{self.user_id}"):
			r.delete(f"user_room_{self.user_id}")

		if get_queue_size(MATCH_MODE) > 0:
			peer_id = dequeue_user(MATCH_MODE)
			if peer_id and peer_id != self.user_id:
				self.room_name = create_room(self.user_id, peer_id)

				await self.channel_layer.group_add(self.room_name, self.channel_name)
				await self.channel_layer.group_add(self.room_name, r.get(f"user_channel_{peer_id}"))
				r.delete(f"user_channel_{peer_id}")

				set_room_by_user(self.user_id, self.room_name)
				set_room_by_user(peer_id, self.room_name)
				
				await self.channel_layer.group_send(
					self.room_name,
					{
						'type': 'room_message',
						'message': 'Connected to peer!',
						'close': False,
						'task': True,
					}
				)

				opponentName = r.get(f"name_{peer_id}")
				await self.send(text_data=json.dumps({"message": f"Playing against {opponentName}"}))

				return
		
		enqueue_user(self.user_id, MATCH_MODE)
		r.set(f"user_channel_{self.user_id}", self.channel_name)
		await self.send(text_data=json.dumps({"message": "queued"}))


	async def disconnect(self, close_code):
		if not hasattr(self, 'user_id') or get_user_mode(self.user_id) != MATCH_MODE:
			return
		user_room = get_room_by_user(self.user_id)
		if user_room:
			r.setex(f"user_room_{self.user_id}", TIMEOUT, user_room)
			r.setex(f"user_mode_{self.user_id}", TIMEOUT, MATCH_MODE)
			await self.channel_layer.group_send(
				user_room,
				{
					'type': 'room_message',
					'message': 'Player disconnected',
					'close': False,
					'task': False,
				}
			)
		elif is_user_in_queue(self.user_id, MATCH_MODE):
			remove_user_from_queue(self.user_id, MATCH_MODE)
			r.delete(f"user_mode_{self.user_id}")
			if (r.exists(f"user_channel_{self.user_id}")):
				r.delete(f"user_channel_{self.user_id}")
			r.delete(f"name_{self.user_id}")


	async def receive(self, text_data):
		data = json.loads(text_data)
		if data.get('tname') and not r.exists(f"name_{self.user_id}"):
			r.set(f"name_{self.user_id}", data['tname'])


	async def room_message(self, event):
		message = event['message']
		await self.send(text_data=json.dumps({
			'message': message
		}))
		if event['close']:
			await self.close()
		if event['task']:
			start_monitor(self.room_name, self.channel_layer)

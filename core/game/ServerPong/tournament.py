import redis
import json
import asyncio

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
		self.room_name = None

		if not get_user_mode(self.user_id):
			set_user_mode(self.user_id, TOURN_MODE)
		elif get_user_mode(self.user_id) != TOURN_MODE:
			await self.send(text_data=json.dumps({"message": "subscribed to tournament. Rejecting..."}))
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
				}
			)
			cancel_expiry(self.user_id)
			return
		elif r.exists(f"user_room_{self.user_id}"):
			r.delete(f"user_room_{self.user_id}")

		if get_queue_size(TOURN_MODE) > 0:
			peer_id = dequeue_user(TOURN_MODE)
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
					}
				)
				asyncio.create_task(self.periodic_check_for_room())
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
			await self.channel_layer.group_send(
				user_room,
				{
					'type': 'room_message',
					'message': 'Player disconnected',
					'close': False,
				}
			)
		else:
			remove_user_from_queue(self.user_id, TOURN_MODE)
			r.delete(f"user_mode_{self.user_id}")


	async def receive(self, text_data):
		data = json.loads(text_data)

	async def room_message(self, event):
		message = event['message']
		await self.send(text_data=json.dumps({
			'message': message
		}))
		if event['close']:
			await self.close()

	async def periodic_check_for_room(self):
		try:
			while True:
				await asyncio.sleep(30)
				users = json.loads(r.get(self.room_name))
				if not users:
					break
				still_active = []
				for u in users:
					if r.exists(f"user_room_{u}"):
						still_active.append(u)
				if len(still_active) != len(users):
					await self.channel_layer.group_send(
						self.room_name,
						{
							'type': 'room_message',
							'message': 'Opponent player has not returned. Ending game',
							'close': True,
						}
					)
					r.delete(f"user_room_{self.user_id}")
					r.delete(f"user_mode_{self.user_id}")
					r.delete(self.room_name)
					break
		except asyncio.CancelledError:
			return
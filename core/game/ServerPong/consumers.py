import redis
import json
import httpx

from urllib.parse import parse_qs
from django.contrib.auth import get_user_model
from channels.generic.websocket import AsyncWebsocketConsumer
from ServerPong.constants import REDIS_URL, TIMEOUT
from .redis_utils import *

class ServerPongConsumer(AsyncWebsocketConsumer):

	async def connect(self):
		scope = self.scope

		url = 'http://auth:8000/validate'

		headers = scope['headers']

		headers_dict = {k.decode(): v.decode() for k, v in headers}

		if "authorization" in headers_dict:
			token = headers_dict["authorization"]
			headers = {"Authorization": token}
		else:
			query_params = parse_qs(self.scope['query_string'].decode())
			token = query_params.get('token', [None])[0]
			if token is None:
				await self.accept()
				await self.send(json.dumps({'message': "NOPE"}))
				await self.close()
				return
			headers = {
				"Authorization": f"Bearer {token}"
			}

		async with httpx.AsyncClient() as client:
			try:
				response = await client.get(url, headers=headers)
			except httpx.RequestError as exc:
				await self.accept()
				await self.send(json.dumps({'message': "AUTH SERVER ERROR"}))
				await self.close()
				return

		await self.accept()
		if response.status_code != 200:
			await self.send(json.dumps({'message': "NOPE"}))
			return

		data = response.json()
		self.send(json.dumps({'message': data}))
		self.user_id = data['payload']['user_id']
		await self.send(json.dumps({'message': f"I can see you {self.user_id}"}))
		self.room_name = None
		
		user_room = get_room_by_user(self.user_id)
		if user_room:
			self.room_name = user_room
			await self.channel_layer.group_add(
				self.room_name,
				self.channel_name,
			)
			await self.send(text_data=json.dumps({
				"status": "reconnected",
				"user_room": user_room
			}))
			cancel_expiry(self.user_id)
			return
		elif r.exists(f"user_room_{self.user_id}"):
			await self.send(text_data=json.dumps({"message": "Uops 1!"}))
			r.delete(f"user_room_{self.user_id}")

		if get_queue_size() > 0:
			peer_id = dequeue_user()
			if peer_id and peer_id != self.user_id:
				self.room_name = create_room(self.user_id, peer_id)

				await self.channel_layer.group_add(
					self.room_name,
					self.channel_name,
				)
				set_room_by_user(self.user_id, self.room_name)
				set_room_by_user(peer_id, self.room_name)
				await self.send(text_data=json.dumps({"message": "Connected to peer!"}))
				return
		
		enqueue_user(self.user_id)
		await self.send(text_data=json.dumps({"status": "queued"}))


	async def disconnect(self, close_code):
		if not hasattr(self, 'user_id'):
			return
		user_room = get_room_by_user(self.user_id)
		if user_room:
			r.expire(f"user_room_{self.user_id}", TIMEOUT)
			room_data = json.loads(r.get(user_room))
			await self.send(text_data=json.dumps({"message": "Uops 2!"}))
			if len(room_data) == 0:
				r.expire(user_room, TIMEOUT)
		else:
			remove_user_from_queue(self.user_id)
			await self.close()


	async def receive(self, text_data):
		data = json.loads(text_data)
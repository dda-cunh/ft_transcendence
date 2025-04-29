import redis
import json
import asyncio
import re

from urllib.parse import parse_qs
from django.contrib.auth import get_user_model
from channels.generic.websocket import AsyncWebsocketConsumer
from ServerPong.game_utils import match_manager, KeyState


from ServerPong.constants import REDIS_URL, TIMEOUT
from ServerPong.redis_utils import *
from ServerPong.utils import asyncGet, AsyncGetData, validate_user_token, validate_mode
from ServerPong.room_monitor import local_monitor_room, start_monitor


class LocalPongConsumer(AsyncWebsocketConsumer):

	async def connect(self):
		await self.accept()

		self.user_id, error_msg = await validate_user_token(self.scope)
		if error_msg:
			await self.send(error_msg)
			await self.close()
			return

		self.room_name = f'local_{self.user_id}'
		await self.send(json.dumps({'message': "Welcome to local room!"}))
		self.task = asyncio.create_task(local_monitor_room(self))

	async def disconnect(self, close_code):
		if hasattr(self, 'task'):
			self.task.cancel()
			del self.task

	async def receive(self, text_data):
		data = json.loads(text_data)
		match = match_manager.get_match(self.room_name)
		if (match):
			if data.get('keystate_p1'):
				match.player_act.p1_key_scale = KeyState[data['keystate_p1']]
			if data.get('keystate_p2'):
				match.player_act.p2_key_scale = KeyState[data['keystate_p2']]



class RemotePongConsumer(AsyncWebsocketConsumer):

	async def connect(self):
		await self.accept()

		self.user_id, error_msg = await validate_user_token(self.scope)
		if self.user_id:
			error_msg = await validate_mode(self.user_id, MATCH_MODE, "tournament")
		if error_msg:
			await self.send(error_msg)
			await self.close()
			return
		
		self.room_name = None

		user_room = get_room_by_user(self.user_id)
		if user_room:
			self.room_name = user_room
			await self.channel_layer.group_add(
				user_room,
				self.channel_name,
			)
			await self.channel_layer.group_send(
				user_room,
				{
					'type': 'room_message',
					'message': 'Reconnected to peer!',
					'gamestate': False,
					'close': False,
					'initial': False,
				}
			)
			cancel_expiry(self.user_id)
			# start_monitor(user_room, self.channel_layer)
			return
		elif r.exists(f"user_room_{self.user_id}"):
			r.delete(f"user_room_{self.user_id}")

		if get_queue_size(MATCH_MODE) > 0:
			peer_id = dequeue_user(MATCH_MODE)
			if peer_id and peer_id != self.user_id:
				self.room_name = create_room(self.user_id, peer_id)

				await self.channel_layer.group_add(self.room_name, r.get(f"user_channel_{peer_id}"))
				await self.channel_layer.group_add(self.room_name, self.channel_name)
				r.delete(f"user_channel_{peer_id}")

				set_room_by_user(self.user_id, self.room_name)
				set_room_by_user(peer_id, self.room_name)
				await self.channel_layer.group_send(
					self.room_name,
					{
						'type': 'room_message',
						'message': 'Connected to peer!',
						'gamestate': False,
						'close': False,
						'initial': False,
					}
				)
				start_monitor(self.room_name, self.channel_layer)

				return
		
		enqueue_user(self.user_id, MATCH_MODE)
		r.set(f"user_channel_{self.user_id}", self.channel_name)
		await self.send(text_data=json.dumps({"message": "queued"}))


	async def disconnect(self, close_code):
		if not hasattr(self, 'user_id') or get_user_mode(self.user_id) != MATCH_MODE:
			return
		user_room = get_room_by_user(self.user_id)
		if user_room:
			await self.channel_layer.group_send(
				user_room,
				{
					'type': 'room_message',
					'message': 'Player disconnected',
					'gamestate': False,
					'close': False,
					'initial': False,
				}
			)
			await self.channel_layer.group_discard(
				user_room,
				self.channel_name,
			)
			expire_user_info(self.user_id)
		elif is_user_in_queue(self.user_id, MATCH_MODE):
			remove_user_from_queue(self.user_id, MATCH_MODE)
			delete_user_info(self.user_id)
		else:
			delete_user_info(self.user_id)


	async def receive(self, text_data):
		data = json.loads(text_data)
		tname = data.get('tname')
		if tname and not r.exists(f"name_{self.user_id}"):
			tname = tname.strip()
			if not (1 <= len(tname) <= 10) or not re.match(r'^[A-Za-z0-9_ ]+$', tname):
				await self.send(json.dumps({
					"error": "Alias must be 1–10 characters, letters/digits/underscore/space only."
				}))
				return
			# save the validated, trimmed alias
			r.set(f"name_{self.user_id}", tname)
		# if data.get('tname') and not r.exists(f"name_{self.user_id}"):
		# 	r.set(f"name_{self.user_id}", data['tname'])
		if not self.room_name:
			self.room_name = get_room_by_user(self.user_id)
		match = match_manager.get_match(self.room_name)
		if (match):
			if data.get('keystate'):
				if (self.user_id == match.p1_id):
					match.player_act.p1_key_scale = KeyState[data['keystate']]
				else:
					match.player_act.p2_key_scale = KeyState[data['keystate']]


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
		

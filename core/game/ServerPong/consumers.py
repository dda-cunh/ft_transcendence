import redis
import json

from django.contrib.auth import get_user_model
from channels.generic.websocket import AsyncWebsocketConsumer
from ServerPong.constants import REDIS_URL
from .redis_utils import *

class ServerPongConsumer(AsyncWebsocketConsumer):

    async def connect(self):

        if not self.scope['user'].id:
            await self.accept()
            await self.send(json.dumps({'message':"NOPE"}))
            return
        self.user_id = self.scope['user'].id
        self.room_name = None

        await self.accept()

        user_room = get_room_by_user(self.user_id)
        if user_room:
            self.room_name = user_room
            await self.channel_layer.group_add(
                self.room_name,
            )
            await self.send(text_data=json.dumps({
                "status": "reconnected",
                "user_room": user_room
            }))
            cancel_expiry(self.user_id)
            return

        if get_queue_size() > 0:
            peer_id = dequeue_user()
            if peer_id and int(peer_id) != self.user_id:
                self.room_name = create_room(self.user_id, peer_id)

                await self.channel_layer.group_add(
                    self.room_name,
                )
                set_room_by_user(user_id, self.room_name)
                set_room_by_user(peer_id, self.room_name)
                await self.send(json.dumps({'message': 'Connected to peer!'}))
                return
        
        enqueue_user(self.user_id)
        await self.send(text_data=json.dumps({"status": "queued"}))


    async def disconnect(self, close_code):
        if not hasattr(self, 'user_id'):
            return
        user_room = get_room_by_user(self.user_id)
        if user_room:
            await self.channel_layer.group_discard(user_room)
            r.expire(f"user_room_{self.user_id}", 180)
            room_data = json.loads(r.get(user_room))
            if len(room_data) == 0:
                r.expire(user_room, 180)
        else:
            remove_user_from_queue(self.user_id)


    async def receive(self, text_data):
        data = json.loads(text_data)
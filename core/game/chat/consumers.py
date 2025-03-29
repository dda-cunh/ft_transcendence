import json

from channels.generic.websocket import AsyncWebsocketConsumer
from .redis_utils import *

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = None
        self.conv_key = None
        self.user_id = self.scope['client'][1]  # Mock user ID, replace in prod

        await self.accept()

        if get_queue_size() > 0:
            peer_id = dequeue_user()
            if peer_id and int(peer_id) != self.user_id:
                sorted_ids = sorted([int(self.user_id), int(peer_id)])  # Ensure consistent room names
                self.room_group_name = f'chat_{sorted_ids[0]}_{sorted_ids[1]}'
                self.conv_key = create_conversation(self.user_id, peer_id)

                await self.channel_layer.group_add(
                    self.room_group_name,
                    self.channel_name
                )
                await self.send(json.dumps({'message': 'Connected to peer!'}))
                return

        enqueue_user(self.user_id)
        await self.send(json.dumps({'message': 'Waiting for peer...'}))

    async def disconnect(self, close_code):
        if self.room_group_name:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            if not self.conv_key:
                remove_user_from_queue(self.user_id) #remove user from queue if they disconnect before being matched.

    async def receive(self, text_data):
        if not self.room_group_name or not self.conv_key:
            await self.send(text_data=json.dumps({'error': 'No peer connected yet.'}))
            return

        data = json.loads(text_data)
        message = data['message']

        append_message(self.conv_key, message)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )

    async def chat_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({'message': message}))
import json
import redis
import os
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer

redis_instance = redis.StrictRedis(host=os.environ['RE__HOST'], port=os.environ['RE_PORT'], db=0, password=os.environ['RE_PASS'])

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        redis_instance.lpush('match_queue', self.channel_name)
        await self.check_for_match()

    async def disconnect(self, close_code):
        redis_instance.lrem('match_queue', 0, self.channel_name)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "message": message,
                },
            )

    async def chat_message(self, event):
        message = event["message"]
        await self.send(text_data=json.dumps({"message": message}))

    async def check_for_match(self):
        if redis_instance.llen('match_queue') >= 2:
            user1 = redis_instance.rpop('match_queue').decode('utf-8')
            user2 = redis_instance.rpop('match_queue').decode('utf-8')
            self.room_group_name = f'match_{user1}_{user2}'
            await self.channel_layer.group_add(
                self.room_group_name,
                user1,
            )
            await self.channel_layer.group_add(
                self.room_group_name,
                user2,
            )
            await self.channel_layer.send(
                user1,
                {
                    "type": "chat_message",
                    "message": "Match found!",
                },
            )
            await self.channel_layer.send(
                user2,
                {
                    "type": "chat_message",
                    "message": "Match found!",
                },
            )
import redis
import json

from django.contrib.auth import get_user_model
from channels.generic.websocket import AsyncWebsocketConsumer
from ServerPong.constants import REDIS_URL

User = get_user_model()

class ServerPongConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        await self.accept()
    async def disconnect(self, close_code):
        pass
    async def receive(self, text_data):
        data = json.loads(text_data)
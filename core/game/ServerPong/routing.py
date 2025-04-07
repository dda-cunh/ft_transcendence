from django.urls import re_path
from .consumers import *

websocket_urlpatterns = [
	re_path(r'^ws?$', consumers.ServerPongConsumer.as_asgi()),
]
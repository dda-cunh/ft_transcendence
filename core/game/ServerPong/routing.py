from django.urls import re_path
from .consumers import *

websocket_urlpatterns = [
	re_path(r'^localpong/?$', LocalPongConsumer.as_asgi()),
	re_path(r'^remotepong/?$', RemotePongConsumer.as_asgi()),
]
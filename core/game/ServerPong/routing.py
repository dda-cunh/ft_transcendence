from django.urls import re_path
from .singlematch import *
from .tournament import *

websocket_urlpatterns = [
	re_path(r'^localpong/?$', LocalPongConsumer.as_asgi()),
	re_path(r'^remotepong/?$', RemotePongConsumer.as_asgi()),
	re_path(r'^tournamentpong/?$', TournamentConsumer.as_asgi()),
]
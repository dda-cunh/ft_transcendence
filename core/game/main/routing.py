from channels.security.websocket import AllowedHostsOriginValidator
from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import re_path
from chat.consumers import ChatConsumer

websocket_urlpatterns = [
    re_path(r'^ws/chat/?$', ChatConsumer.as_asgi())
]

application = ProtocolTypeRouter({
    "websocket": AllowedHostsOriginValidator(
            URLRouter(websocket_urlpatterns)
    )
})

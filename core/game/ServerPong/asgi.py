import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from ServerPong.routing import websocket_urlpatterns
from ServerPong.middleware import TokenMiddleware

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ServerPong.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": TokenMiddleware(
        AuthMiddlewareStack(
            URLRouter(websocket_urlpatterns)
        ),
    ),
})

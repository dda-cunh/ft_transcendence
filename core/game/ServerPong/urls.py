from django.urls import re_path
from .views import pong

urlpatterns = [
    re_path(r'^pong/?$', pong, name='pong'),
]
from django.urls import re_path
from .views import game

urlpatterns = [
    re_path(r'^game/?$', game.as_view(), name='game'),
]
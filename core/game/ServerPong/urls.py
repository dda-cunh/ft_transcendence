from django.urls import re_path
from .views import singleGameView

urlpatterns = [
    re_path(r'^singlegame/?$', singleGameView.as_view(), name='singlegame'),
]

from django.urls import path, include, re_path
from .views import singleGameView, tournamentView

urlpatterns = [
    re_path(r'^singlegame/?$', singleGameView.as_view(), name='singlegame'),
    re_path(r'^tournament/?$', tournamentView.as_view(), name='tournament'),
    path('tracker/', include('tracker.urls'))
]

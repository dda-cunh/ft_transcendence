from django.urls import path

from .views import (
	MatchByUserView,
	TournamentByUserView
)

urlpatterns = [
	path('matches/user/<uuid:user_id>',
				MatchByUserView.as_view(),
				name='match-by-user'),
	path('tournament/user/<uuid:user_id>',
				TournamentByUserView.as_view(),
				name='tournament-by-user'),
]

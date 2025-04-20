from django.urls import path

from .views import (
	MatchByUserView,
	MatchByWinnerView,
	TournamentByWinnerView,
	TournamentMatchByTournamentView,
)

urlpatterns = [
	path('matches/user/<uuid:user_id>/',
				MatchByUserView.as_view(),
				name='match-by-user'),
	path('matches/winner/<uuid:winner_id>/',
				MatchByWinnerView.as_view(),
				name='match-by-winner'),
	path('tournaments/winner/<uuid:winner_id>/',
				TournamentByWinnerView.as_view(),
				name='tournament-by-winner'),
	path('tournament-matches/tournament/<int:tournament_id>/',
				TournamentMatchByTournamentView.as_view(),
				name='tournamentmatch-by-tournament'),
]

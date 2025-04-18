from .serializers import (
	TournamentHistorySerializer,
	MatchHistorySerializer,
	TournamentMatchHistorySerializer
)

def	save_tournament_history(data):
	serializer = TournamentHistorySerializer(data=data)
	if serializer.is_valid(raise_exception=True):
		return serializer.save()

def	save_match_history(data):
	serializer = MatchHistorySerializer(data=data)
	if serializer.is_valid(raise_exception=True):
		return serializer.save()

def	save_tournament_match_history(data):
	serializer = TournamentMatchHistorySerializer(data=data)
	if serializer.is_valid(raise_exception=True):
		return serializer.save()

from channels.db import database_sync_to_async
from .serializers import (
	TournamentHistorySerializer,
	MatchHistorySerializer,
	TournamentMatchHistorySerializer
)

@database_sync_to_async
def save_tournament_history(data):
	serializer = TournamentHistorySerializer(data=data)
	serializer.is_valid(raise_exception=True)
	instance = serializer.save()
	return serializer.data

@database_sync_to_async
def save_match_history(data):
	serializer = MatchHistorySerializer(data=data)
	serializer.is_valid(raise_exception=True)
	instance = serializer.save()
	return serializer.data

@database_sync_to_async
def save_tournament_match_history(data):
	serializer = TournamentMatchHistorySerializer(data=data)
	serializer.is_valid(raise_exception=True)
	instance = serializer.save()
	return serializer.data

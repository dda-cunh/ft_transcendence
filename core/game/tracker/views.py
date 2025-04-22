from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .models import TournamentHistory, MatchHistory, TournamentMatchHistory
from .serializers import (
	TournamentHistorySerializer,
	MatchHistorySerializer,
	TournamentMatchHistorySerializer
)

from rest_framework.generics import ListAPIView
from django.db.models import Q

class	TournamentHistoryListCreateView(APIView):
	permission_classes	= [AllowAny]

	def	post(self, request):
		serializer = TournamentHistorySerializer(data=request.data)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data, status=status.HTTP_201_CREATED)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class	MatchHistoryListCreateView(APIView):
	permission_classes	= [AllowAny]

	def	post(self, request):
		serializer = MatchHistorySerializer(data=request.data)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data, status=status.HTTP_201_CREATED)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class	TournamentMatchHistoryListCreateView(APIView):
	permission_classes	= [AllowAny]

	def	post(self, request):
		serializer = TournamentMatchHistorySerializer(data=request.data)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data, status=status.HTTP_201_CREATED)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class	MatchByUserView(ListAPIView):
	serializer_class	= MatchHistorySerializer
	permission_classes	= [AllowAny]

	def	get_queryset(self):
		user = self.kwargs['user']
		return MatchHistory.objects.filter(
			Q(player1_id=user) | Q(player2_id=user)
		)

class TournamentByUserView(ListAPIView):
    serializer_class = TournamentHistorySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        return TournamentHistory.objects.filter(
            Q(winner_id=user_id) |
            Q(
                id__in=TournamentMatchHistory.objects.filter(
                    match__in=MatchHistory.objects.filter(
                        Q(player1_id=user_id) | Q(player2_id=user_id)
                    )
                ).values_list('tournament_id', flat=True)
            )
        ).distinct()

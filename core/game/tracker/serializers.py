from rest_framework import serializers
from .models import TournamentHistory, MatchHistory, TournamentMatchHistory

class	TournamentHistorySerializer(serializers.ModelSerializer):
	class	Meta:
		model = TournamentHistory
		fields = '__all__'


class	MatchHistorySerializer(serializers.ModelSerializer):
	class	Meta:
		model = MatchHistory
		fields = '__all__'

	def	validate(self, data):
		if data['winner'] not in [data['player1'], data['player2']]:
			raise serializers.ValidationError("Winner must be one of the players.")
		return data


class	TournamentMatchHistorySerializer(serializers.ModelSerializer):
	class	Meta:
		model = TournamentMatchHistory
		fields = '__all__'

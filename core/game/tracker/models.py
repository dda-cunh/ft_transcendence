import json
from django.db import models
from django.conf import settings


class	TournamentHistory(models.Model):
	id = models.BigAutoField(primary_key=True)
	winner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
	ended_at = models.DateTimeField(auto_now_add=True, null=True)

	def	to_dict(self):
		return {
			"id": self.id,
			"winner_id": self.winner.id,
			"winner_username": self.winner.username,
			"ended_at": self.ended_at or None
		}

	def	__str__(self):
		return json.dumps(self.to_dict())


class	MatchHistory(models.Model):
	id = models.BigAutoField(primary_key=True)
	player1 = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
								related_name='matches_as_player1')
	player2 = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
								related_name='matches_as_player2')
	winner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
							   related_name='matches_won')
	ended_at = models.DateTimeField(auto_now_add=True, null=True)

	def	to_dict(self):
		return {
			"id": self.id,
			"player1_id": self.player1.id,
			"player1_username": self.player1.username,
			"player2_id": self.player2.id,
			"player2_username": self.player2.username,
			"winner_id": self.winner.id,
			"winner_username": self.winner.username,
			"ended_at": self.ended_at or None
		}

	def	__str__(self):
		return json.dumps(self.to_dict())


class	TournamentMatchHistory(models.Model):
	class	StageChoices(models.TextChoices):
		SEMIFINAL = 'semifinal', 'Semifinal'
		FINAL = 'final', 'Final'

	id = models.BigAutoField(primary_key=True)
	tournament = models.ForeignKey(TournamentHistory, on_delete=models.CASCADE)
	match = models.ForeignKey(MatchHistory, on_delete=models.CASCADE)
	stage = models.CharField(max_length=20, choices=StageChoices.choices)

	def	to_dict(self):
		return {
			"id": self.id,
			"tournament_id": self.tournament.id,
			"match_id": self.match.id,
			"stage": self.stage,
			"tournament": self.tournament.to_dict(),
			"match": self.match.to_dict(),
		}

	def	__str__(self):
		return json.dumps(self.to_dict())

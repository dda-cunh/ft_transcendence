import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone

class FriendRequest(models.Model):
    id = models.BigAutoField(primary_key=True)
    
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='friend_requests_sent'
    )
    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='friend_requests_received'
    )
    sent_at = models.DateTimeField(default=timezone.now)
    accepted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = (('sender', 'receiver'),)

    def __str__(self):
        return f"FriendRequest from {self.sender} to {self.receiver}"

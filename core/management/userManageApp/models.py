from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    display_name = models.CharField(
        max_length=50,
        unique=True,       # Enforces uniqueness at the DB level
        null=True,         # Allow it to be empty at first
        blank=True,
        help_text="Unique display name for tournaments"
    )

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models
import uuid
from django.core.validators import FileExtensionValidator
from django.utils import timezone
from django.core.exceptions import ValidationError
import re


def validate_username(value):
    if not re.match('^[a-zA-Z0-9_]+$', value):  
        raise ValidationError('Username must only contain letters, numbers, and underscores.')

class UserManager(BaseUserManager):
    def create_user(self, username, password, **extra_fields):
        if not username:
            raise ValueError("The Username field must be set")
        if not password:
            raise ValueError("The password field must be set")
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

class User(AbstractBaseUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=15, unique=True, validators=[validate_username])
    password = models.CharField(max_length=128)
    otp_secret   = models.CharField(max_length=32, blank=True, null=True)
    otp_enabled  = models.BooleanField(default=False)
    
    avatar = models.ImageField(
        upload_to='avatars/',
        default='avatars/default-avatar.png',
        blank=True,
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png'])]
    )
    motto = models.CharField(
        max_length=200,
        blank=True,
        default="Hello, I'm new here!"
    )

    last_activity = models.DateTimeField(auto_now=True)

    last_login = None

    USERNAME_FIELD = 'username'

    objects = UserManager()

    def __str__(self):
        return self.username

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models
import uuid

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
    username = models.CharField(max_length=15, unique=True)
    password = models.CharField(max_length=128)
    avatar = models.CharField(max_length=100, default='default-avatar.png')
    last_activity = models.DateField(auto_now=True)

    last_login = None

    USERNAME_FIELD = 'username'

    objects = UserManager()

    def __str__(self):
        return self.username

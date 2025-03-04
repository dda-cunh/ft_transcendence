from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserLoginSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username']

    def validate_username(self, value):
        user = self.instance
        qs = User.objects.filter(username=value)

        if user:
            qs = qs.exclude(pk=user.pk)
        if qs.exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

class UserAvatarSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['avatar']
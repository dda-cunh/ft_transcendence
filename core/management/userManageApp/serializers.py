from rest_framework import serializers
from .models import CustomUser

class UserDisplayNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['display_name']

    def validate_display_name(self, value):
        user = self.instance
        qs = CustomUser.objects.filter(display_name=value)

        if user:
            qs = qs.exclude(pk=user.pk)
        if qs.exists():
            raise serializers.ValidationError("This display name is already taken.")
        return value

class UserLoginSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['username']

    def validate_username(self, value):
        user = self.instance
        qs = CustomUser.objects.filter(username=value)

        if user:
            qs = qs.exclude(pk=user.pk)
        if qs.exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

class UserAvatarSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['avatar']
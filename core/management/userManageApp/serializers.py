from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import FriendRequest

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

class UserMottoSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['motto']

class UserAvatarSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['avatar']

class FriendRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = FriendRequest
        fields = ['id', 'sender', 'receiver', 'sent_at', 'accepted_at', 'rejected_at']
        read_only_fields = ['sent_at', 'accepted_at', 'rejected_at']

    def validate(self, attrs):
        sender = self.context['request'].user
        receiver = attrs.get('receiver')
        if sender == receiver:
            raise serializers.ValidationError("You cannot send a friend request to yourself.")
        return attrs
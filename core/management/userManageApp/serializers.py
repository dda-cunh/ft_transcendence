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

class UserPasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)
    confirm_new_password = serializers.CharField(required=True, write_only=True)

    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is not correct.")
        return value

    def validate(self, data):
        if data['new_password'] != data['confirm_new_password']:
            raise serializers.ValidationError("New passwords do not match.")
        return data

    def update(self, instance, validated_data):
        instance.set_password(validated_data['new_password'])
        instance.save()
        return instance

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

class PendingFriendRequestsViewSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    sender_avatar = serializers.SerializerMethodField()

    class Meta:
        model = FriendRequest

        fields = ['id', 'sender', 'sender_username', 'sender_avatar', 'sent_at']
        read_only_fields = ['sent_at', 'sender_username', 'sender_avatar']

    def get_sender_avatar(self, obj):
        if obj.sender.avatar:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.sender.avatar.url) if request else obj.sender.avatar.url
        return None
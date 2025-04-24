from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django_otp.plugins.otp_totp.models import TOTPDevice
from django.contrib.auth import authenticate

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    def validate_password(self, value):
         # Run Django's configured password validators (including your custom one)
        validate_password(value)
        return value

    class Meta:
        model = User
        fields = ['username', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

    def get_tokens(self, user):
        refresh = RefreshToken.for_user(user)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }

class TwoFactorTokenObtainSerializer(TokenObtainPairSerializer):
    otp_token = serializers.CharField(write_only=True, required=False, allow_blank=True)

    def validate(self, attrs):
        # standard username/password auth
        user = authenticate(
            username=attrs['username'],
            password=attrs['password']
        )
        if not user:
            raise serializers.ValidationError("Invalid credentials")

        # if 2FA is enabled, require & verify otp_token
        if user.otp_enabled:
            otp = attrs.get('otp_token', '').strip()
            if not otp:
                return {'TwoFA': "Enter code" }
            secret = (user.otp_secret or '').strip()
            device = TOTPDevice.objects.filter(user=user, confirmed=True).first()
            if not device or not device.verify_token(otp):
                raise ValidationError("Invalid 2FA code")

        # call super to get tokens
        data = super().get_token(user)
        return {
            'refresh': str(data),
            'access': str(data.access_token),
        }
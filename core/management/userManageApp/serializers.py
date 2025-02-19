from rest_framework import serializers
from .models import CustomUser

class UserDisplayNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['display_name']

    def validate_display_name(self, value):
        # Exclude the current user (if updating) so they can re-submit their own name
        user = self.instance
        qs = CustomUser.objects.filter(display_name=value)
        if user:
            qs = qs.exclude(pk=user.pk)
        if qs.exists():
            raise serializers.ValidationError("This display name is already taken.")
        return value

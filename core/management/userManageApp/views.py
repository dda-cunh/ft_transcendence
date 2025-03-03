from rest_framework import generics, permissions
from django.contrib.auth import get_user_model
from .serializers import UserLoginSerializer, UserAvatarSerializer

class UpdateLoginView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserLoginSerializer

    def post(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)
    def get_object(self):
        return self.request.user

class UpdateAvatarView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserAvatarSerializer

    def post(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)
    def get_object(self):
        return self.request.user
        

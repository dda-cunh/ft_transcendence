from rest_framework.generics import UpdateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response 
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from .serializers import UserLoginSerializer, UserAvatarSerializer

User = get_user_model()

class UpdateLoginView(UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserLoginSerializer

    def post(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)
    def get_object(self):
        return self.request.user

class UpdateAvatarView(UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserAvatarSerializer

    def post(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)
    def get_object(self):
        return self.request.user
        
class PublicUserDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, user_id):
        user = get_object_or_404(User, pk=user_id)
        data = {
            "id": str(user.id),
            "username": user.username,
        }
        return Response(data)

class PrivateUserInfoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        data = {
            "id": str(user.id),
            "username": user.username,
            "avatar": user.avatar.name if user.avatar else None,
            "last_activity": user.last_activity,
        }
        return Response(data)
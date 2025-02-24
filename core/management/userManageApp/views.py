from rest_framework import generics, permissions
from userManageApp.models import CustomUser
from .serializers import UserDisplayNameSerializer, UserLoginSerializer, UserAvatarSerializer

class UpdateDisplayNameView(generics.UpdateAPIView):
    # permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserDisplayNameSerializer

    def post(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)
    def get_object(self):
        user_id = self.request.user.id
        return CustomUser.objects.get(pk=user_id)

class UpdateLoginView(generics.UpdateAPIView):
    # permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserLoginSerializer

    def post(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)
    def get_object(self):
        return CustomUser.objects.get(pk=self.request.user.id)

class UpdateAvatarView(generics.UpdateAPIView):
    # permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserAvatarSerializer

    def post(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)
    def get_object(self):
        return CustomUser.objects.get(pk=self.request.user.id)

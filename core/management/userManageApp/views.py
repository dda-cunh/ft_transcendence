from rest_framework import generics, permissions
from userManageApp.models import CustomUser
from .serializers import UserDisplayNameSerializer

class UpdateDisplayNameView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserDisplayNameSerializer

    def get_object(self):
        user_id = self.request.user.id
        return CustomUser.objects.get(pk=user_id)

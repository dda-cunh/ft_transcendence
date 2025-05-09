from rest_framework.generics import UpdateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response 
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from .serializers import UserLoginSerializer, UserPasswordSerializer, UserMottoSerializer, UserAvatarSerializer, FriendRequestSerializer, PendingFriendRequestsViewSerializer
from .models import FriendRequest
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from django.db import models

User = get_user_model()

class UpdateLoginView(UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserLoginSerializer

    def post(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)
    def get_object(self):
        return self.request.user

class UpdatePasswordView(UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserPasswordSerializer

    def post(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)
    def get_object(self):
        return self.request.user

class UpdateMottoView(UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserMottoSerializer

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
        now = timezone.now()
        ONLINE_THRESHOLD = timedelta(minutes=5)
        is_online = (now - user.last_activity) <= ONLINE_THRESHOLD

        # <-- this only ever looks for a request *from* the current viewer
        request_sent = False
        if request.user.is_authenticated:
            request_sent = FriendRequest.objects.filter(
                sender=request.user,
                receiver=user,
                accepted_at__isnull=True,
                rejected_at__isnull=True
            ).exists()

        data = {
            "id": str(user.id),
            "username": user.username,
            "online": is_online,
            "request_sent":  request_sent,
            "motto": user.motto,
            "avatar": user.avatar.name if user.avatar else None,
            "last_activity": user.last_activity,
        }
        return Response(data)

class PrivateUserInfoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        data = {
            "id": str(user.id),
            "username": user.username,
            "motto": user.motto,
            "avatar": user.avatar.name if user.avatar else None,
            "last_activity": user.last_activity,
            "otp_enabled": user.otp_enabled,
        }
        return Response(data)

class FriendRequestCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data.copy()
        data['sender'] = str(request.user.id) 

        serializer = FriendRequestSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FriendRequestAcceptView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            friend_request = FriendRequest.objects.get(pk=pk, receiver=request.user, accepted_at__isnull=True, rejected_at__isnull=True)
        except FriendRequest.DoesNotExist:
            return Response({"detail": "No pending friend request with that ID."}, status=status.HTTP_404_NOT_FOUND)

        friend_request.accepted_at = timezone.now()
        friend_request.save()
        return Response({"detail": "Friend request accepted."}, status=status.HTTP_200_OK)


class FriendRequestRejectView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            friend_request = FriendRequest.objects.get(pk=pk, receiver=request.user, accepted_at__isnull=True, rejected_at__isnull=True)
        except FriendRequest.DoesNotExist:
            return Response({"detail": "No pending friend request with that ID."}, status=status.HTTP_404_NOT_FOUND)

        friend_request.rejected_at = timezone.now()
        friend_request.save()
        return Response({"detail": "Friend request rejected."}, status=status.HTTP_200_OK)


class FriendListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        accepted_reqs = FriendRequest.objects.filter(
            accepted_at__isnull=False, # accepted
            rejected_at__isnull=True # not rejected
        ).filter(
            models.Q(sender=user) | models.Q(receiver=user)
        )

        friend_ids = []
        for fr in accepted_reqs:
            if fr.sender == user:
                friend_ids.append(fr.receiver.id)
            else:
                friend_ids.append(fr.sender.id)

        friends = User.objects.filter(id__in=friend_ids)

        ONLINE_THRESHOLD = timedelta(minutes=5)
        response_data = []
        now = timezone.now() 
        for f in friends:
            last_active_delta = now - f.last_activity

            is_online = (last_active_delta <= ONLINE_THRESHOLD)
            response_data.append({
                "id": str(f.id),
                "username": f.username,
                "online": is_online,
                "last_activity": f.last_activity.isoformat(),
                "avatar": f.avatar.name if f.avatar else None,
            })

        return Response(response_data, status=status.HTTP_200_OK)

class PublicFriendListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, user_id):
        # Fetch the target user or return 404
        user = get_object_or_404(User, pk=user_id)

        # Find all accepted, non-rejected friend requests involving that user
        accepted_reqs = FriendRequest.objects.filter(
            accepted_at__isnull=False,
            rejected_at__isnull=True
        ).filter(
            models.Q(sender=user) | models.Q(receiver=user)
        )

        # Collect the IDs of the friends
        friend_ids = []
        for fr in accepted_reqs:
            friend_ids.append(fr.receiver.id if fr.sender == user else fr.sender.id)

        # Query the user records for those friend IDs
        friends = User.objects.filter(id__in=friend_ids)

        ONLINE_THRESHOLD = timedelta(minutes=5)
        now = timezone.now()
        response_data = []
        for f in friends:
            last_active_delta = now - f.last_activity
            is_online = last_active_delta <= ONLINE_THRESHOLD
            response_data.append({
                "id": str(f.id),
                "username": f.username,
                "online": is_online,
                "last_activity": f.last_activity.isoformat(),
                "avatar": f.avatar.name if f.avatar else None,
            })

        return Response(response_data, status=status.HTTP_200_OK)

class PendingFriendRequestsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        pending_requests = FriendRequest.objects.filter(
            receiver=user,
            accepted_at__isnull=True,
            rejected_at__isnull=True
        )

        serializer = PendingFriendRequestsViewSerializer(pending_requests, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
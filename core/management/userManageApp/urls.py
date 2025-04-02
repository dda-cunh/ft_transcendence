
from django.urls import re_path
from .views import UpdateLoginView, UpdatePasswordView, UpdateMottoView, UpdateAvatarView, PublicUserDetailView, PrivateUserInfoView, FriendRequestCreateView, FriendRequestAcceptView, FriendRequestRejectView, FriendListView, PendingFriendRequestsView

urlpatterns = [
    re_path(r'^username/?$', UpdateLoginView.as_view(), name='update_username'),
    re_path(r'^password/?$', UpdatePasswordView.as_view(), name='update_password'),
    re_path(r'^motto/?$', UpdateMottoView.as_view(), name='update_motto'),
    re_path(r'^avatar/?$', UpdateAvatarView.as_view(), name='update_avatar'),
    re_path(r'^user/(?P<user_id>[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/?$', PublicUserDetailView.as_view(), name='public_user_detail'),
    re_path(r'^user/?$', PrivateUserInfoView.as_view(), name='private_user_info'),
    re_path(r'^friends/request/?$', FriendRequestCreateView.as_view(), name='friend_request_create'),
    re_path(r'^friends/request/(?P<pk>\d+)/accept/?$', FriendRequestAcceptView.as_view(), name='friend_request_accept'),
    re_path(r'^friends/request/(?P<pk>\d+)/reject/?$', FriendRequestRejectView.as_view(), name='friend_request_reject'),
    re_path(r'^friends/?$', FriendListView.as_view(), name='friend_list'),
    re_path(r'^friends/pending/?$', PendingFriendRequestsView.as_view(), name='pending_friend_requests'),
]

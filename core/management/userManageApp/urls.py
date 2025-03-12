
from django.urls import path
from .views import UpdateLoginView, UpdateAvatarView, PublicUserDetailView, PrivateUserInfoView, FriendRequestCreateView, FriendRequestAcceptView, FriendListView

urlpatterns = [
    path('login/', UpdateLoginView.as_view(), name='update_login'),
    path('avatar/', UpdateAvatarView.as_view(), name='update_avatar'),
    path('user/<uuid:user_id>/', PublicUserDetailView.as_view(), name='public_user_detail'),
    path('user/', PrivateUserInfoView.as_view(), name='private_user_info'),
    path('friends/request/', FriendRequestCreateView.as_view(), name='friend_request_create'),
    path('friends/request/<int:pk>/accept/', FriendRequestAcceptView.as_view(), name='friend_request_accept'),
    path('friends/', FriendListView.as_view(), name='friend_list'),
]

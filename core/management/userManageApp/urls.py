
from django.urls import path
from .views import UpdateLoginView, UpdateAvatarView, PublicUserDetailView, PrivateUserInfoView

urlpatterns = [
    path('login/', UpdateLoginView.as_view(), name='update_login'),
    path('avatar/', UpdateAvatarView.as_view(), name='update_avatar'),
    path('user/<uuid:user_id>/', PublicUserDetailView.as_view(), name='public_user_detail'),
    path('user/', PrivateUserInfoView.as_view(), name='private_user_info'),
]

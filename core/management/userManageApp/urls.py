
from django.urls import path
from .views import UpdateLoginView, UpdateAvatarView

urlpatterns = [
    path('login/', UpdateLoginView.as_view(), name='update_login'),
    path('avatar/', UpdateAvatarView.as_view(), name='update_avatar'),
]

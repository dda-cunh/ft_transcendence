
from django.urls import path
from .views import UpdateDisplayNameView, UpdateLoginView, UpdateAvatarView

urlpatterns = [
    path('display-name/', UpdateDisplayNameView.as_view(), name='update_display_name'),
    path('login/', UpdateLoginView.as_view(), name='update_login'),
    path('avatar/', UpdateAvatarView.as_view(), name='update_avatar'),
]

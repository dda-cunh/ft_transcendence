"""
URL configuration for auth project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.urls import re_path
from user.views import RegisterView, DeleteUserView, TwoFactorTokenObtainView, ValidateTokenView, TwoFactorEnable, TwoFactorVerify, TwoFactorDisable

urlpatterns = [
    re_path(r'^refresh/?$', TokenRefreshView.as_view(), name='token_refresh'),
    re_path(r'^/?$', TwoFactorTokenObtainView.as_view(), name='token_obtain_pair'),
    re_path(r'^register/?$', RegisterView.as_view(), name='register'),
    re_path(r'^delete/?$', DeleteUserView.as_view(), name='delete'),
    re_path(r'^validate/?$', ValidateTokenView.as_view(), name='validate'),
    re_path(r'^twoFactor_enable/?$', TwoFactorEnable.as_view(), name='enable'),
    re_path(r'^twoFactor_verify/?$', TwoFactorVerify.as_view(), name='verify'),
    re_path(r'^twoFactor_disable/?$', TwoFactorDisable.as_view(), name='disable'),
]

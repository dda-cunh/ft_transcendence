
from django.urls import path
from .views import UpdateDisplayNameView

urlpatterns = [
    path('display-name/', UpdateDisplayNameView.as_view(), name='update_display_name'),
]


from django.urls import path, include, re_path

urlpatterns = [
    path('tracker/', include('tracker.urls'))
]

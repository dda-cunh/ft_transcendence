from django.http import JsonResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView


@permission_classes([IsAuthenticated])
def pong(request):
    if request.method == 'GET':
        return JsonResponse({'status': 'pong'})
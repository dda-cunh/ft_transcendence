from django.http import JsonResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView

class game(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        print("Authorization Header:", request.headers.get('Authorization'))
        return JsonResponse({'status': 'pong'})
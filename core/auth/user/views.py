from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.conf import settings
import jwt
from .serializers import RegisterSerializer, TwoFactorTokenObtainSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from django_otp.plugins.otp_totp.models import TOTPDevice
import qrcode, base64
from io import BytesIO
from django.http import JsonResponse
import json


class ValidateTokenView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return Response({'valid': False, 'error': 'Missing Authorization header'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            token_type, token = auth_header.split(' ')
            if token_type.lower() != 'bearer':
                raise ValueError('Invalid token type')

            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])

            return Response({'valid': True, 'payload': payload}, status=status.HTTP_200_OK)

        except jwt.ExpiredSignatureError:
            return Response({'valid': False, 'error': 'Token expired'}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({'valid': False, 'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            return Response({'valid': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = serializer.get_tokens(user)
            return Response({
                "tokens": tokens
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DeleteUserView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user

        user.delete()
        return Response({"message": "User deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

class TwoFactorTokenObtainView(TokenObtainPairView):
    serializer_class = TwoFactorTokenObtainSerializer

class TwoFactorEnable(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user

            if user.otp_enabled:
                return JsonResponse({"message": "Two-factor authentication is already enabled"}, status=status.HTTP_400_BAD_REQUEST)

            device, created = TOTPDevice.objects.get_or_create(user=user, name="default")

            if created:
                device.save()
            
            # Generate the QR code URL
            secret = base64.b32encode(bytes.fromhex(device.key)).decode('utf-8')
            user.otp_secret = secret

            uri = (
                f"otpauth://totp/transcendence:{user.username}"
                f"?secret={secret}&issuer=transcendence&algorithm=SHA1&digits=6&period=30"
            )

            qr = qrcode.make(uri)
            BUFFER = BytesIO()
            qr.save(BUFFER, format="png")
            qr_code64 = base64.b64encode(BUFFER.getvalue()).decode('utf-8')

            return JsonResponse({ "qr_code": qr_code64 }, status=status.HTTP_200_OK)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TwoFactorDisable(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        TOTPDevice.objects.filter(user=user, name="default").delete()
        user.otp_enabled = False
        user.otp_secret = ""
        user.save()
        return JsonResponse({"message": "Two-factor authentication disabled"}, status=status.HTTP_200_OK)


class TwoFactorVerify(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            data = json.loads(request.body)
            user = request.user
            qrcode = data.get('qrcode')

            if not qrcode:
                return JsonResponse({"message": "QR code not provided"}, status=400)

            device = TOTPDevice.objects.filter(user=user, name="default").first()
            if not device:
                return JsonResponse({"message": "Device not found"}, status=404)

            if not device.verify_token(qrcode):
                return JsonResponse({"message": "Invalid QR code"}, status=400)
            user.otp_enabled = True
            user.save()
            return JsonResponse({"message": "Two-factor authentication enabled"}, status=200)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


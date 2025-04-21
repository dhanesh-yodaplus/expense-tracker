from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
import logging
import random

from .models import OneTimePassword
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    EmailVerificationSerializer,  #  Added for OTP verification
)
from .tasks import send_otp_email  #  Celery task to send OTP

User = get_user_model()
logger = logging.getLogger(__name__)


class RegisterView(APIView):
    """
    API endpoint for user registration.
    Accepts email, username, password.
    Generates OTP and sends it to email.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            # Save user with is_active=False
            user = serializer.save(is_active=False)

            # Generate 6-digit OTP
            otp = str(random.randint(100000, 999999))

            # Store OTP in DB
            OneTimePassword.objects.create(user=user, otp=otp)

            # Send OTP via Celery
            send_otp_email.delay(user.email, otp)

            return Response(
                {"message": "User registered successfully. OTP sent to email."},
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyEmailOTPView(APIView):
    """
    Verifies user's email using the OTP.
    Marks the user as active and OTP as used.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = EmailVerificationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]
            otp_obj = serializer.validated_data["otp_obj"]

            # Activate user
            user.mark_verified()

            # Mark OTP as used
            otp_obj.is_used = True
            otp_obj.save()

            return Response({"message": "Email verified successfully. You can now log in."}, status=200)

        return Response(serializer.errors, status=400)

class ResendOTPView(APIView):
    """
    Resends a new OTP to the user's email.
    Only allowed if user is inactive (not verified).
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"detail": "Email is required."}, status=400)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "User with this email does not exist."}, status=404)

        if user.is_active:
            return Response({"detail": "User is already verified."}, status=400)

        # Optional: Mark previous OTPs as used
        OneTimePassword.objects.filter(user=user, is_used=False).update(is_used=True)

        # Generate and save new OTP
        otp = str(random.randint(100000, 999999))
        OneTimePassword.objects.create(user=user, otp=otp)

        # Send it via Celery
        send_otp_email.delay(user.email, otp)

        return Response({"message": "A new OTP has been sent to your email."}, status=200)


class LoginView(APIView):
    """
    API endpoint for user login.
    Authenticates email and password using serializer.
    Returns JWT access and refresh tokens on success.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            # Fetch the user from validated email
            user = User.objects.get(email=serializer.validated_data['email'])

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access = refresh.access_token

            return Response({
                'access': str(access),
                'refresh': str(refresh),
                'user': {
                    'email': user.email,
                    'username': user.username,
                    'role': user.role,
                }
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    """
    Blacklists the refresh token to effectively log the user out.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            logger.debug(f"Received refresh token: {refresh_token}")

            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response({"detail": "Logout successful."}, status=status.HTTP_205_RESET_CONTENT)

        except Exception as e:
            logger.error(f"Logout failed: {str(e)}")
            return Response({"detail": "Invalid refresh token."}, status=status.HTTP_400_BAD_REQUEST)


class ProtectedTestView(APIView):
    """
    A simple protected view to confirm token authentication.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"message": f"Hello, {request.user.username}! You're authenticated ✅"})

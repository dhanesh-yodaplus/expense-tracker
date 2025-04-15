from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterSerializer, LoginSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated
import logging

User = get_user_model()

class RegisterView(APIView):
    """
    API endpoint for user registration.
    Accepts email, username, password, and role.
    """

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    API endpoint for user login.
    Authenticates email and password using serializer.
    Returns JWT access and refresh tokens on success.
    """

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            # Fetch the user from validated email
            user = User.objects.get(email=serializer.validated_data['email'])

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access = refresh.access_token

            # Respond with tokens + basic user info
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


logger = logging.getLogger(__name__)

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
            logger.debug("Refresh token is valid and will be blacklisted.")

            token.blacklist()

            return Response({"detail": "Logout successful."}, status=status.HTTP_205_RESET_CONTENT)

        except Exception as e:
            logger.error(f"Logout failed: {str(e)}")
            return Response({"detail": "Invalid refresh token."}, status=status.HTTP_400_BAD_REQUEST)


class ProtectedTestView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"message": f"Hello, {request.user.username}! You're authenticated ✅"})
from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from rest_framework.exceptions import AuthenticationFailed

# Get the custom user model defined in settings.AUTH_USER_MODEL
User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for returning basic user information in API responses.
    Used after login or for user profile endpoints.
    """

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'role']


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for handling user registration.
    Validates input fields and creates a new user using create_user().
    """

    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'role']

    def create(self, validated_data):
        """
        Create a new user instance after validating data.
        Uses Django's built-in create_user method for password hashing.
        """
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
            role=validated_data.get('role', 'user')
        )
        return user


class LoginSerializer(serializers.Serializer):
    """
    Serializer for authenticating users using email and password.
    Does not use a model, just raw field validation.
    """

    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        """
        Validates provided credentials using Django's authenticate().
        Returns user info on success or raises AuthenticationFailed on failure.
        """
        user = authenticate(email=data['email'], password=data['password'])
        if not user:
            raise AuthenticationFailed("Invalid credentials or user does not exist.")

        return {
            'email': user.email,
            'username': user.username,
            'role': user.role,
        }

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
    Includes validations for email, names, and password confirmation.
    """

    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    email = serializers.EmailField()

    class Meta:
        model = User
        fields = [
            'email',
            'username',
            'password',
            'confirm_password',
            'first_name',
            'last_name',
        ]

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email is already registered.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken.")
        return value

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match.")
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')

        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role='user',
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

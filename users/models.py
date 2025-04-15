from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _  # For internationalization (i18n)

class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser.
    Adds a role field and makes email the primary login field.
    """

    # Choices for user roles
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('manager', 'Manager'),
        ('user', 'User'),
    ]

    # Email field is used for login, must be unique
    # Wrapped in _() for i18n — allows translation to other languages
    email = models.EmailField(_('email address'), unique=True)

    # Role determines the user's access level (Admin/Manager/User)
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='user',
        help_text='Defines role-based access permissions.'
    )

    # Override default username-based login to use email
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']  # Required when using createsuperuser

    def __str__(self):
        """
        String representation of the User object.
        Returns the email with role (e.g., admin@xyz.com (admin)).
        """
        return f"{self.email} ({self.role})"

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.conf import settings


class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser.
    Adds a role field and makes email the primary login field.
    """

    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('manager', 'Manager'),
        ('user', 'User'),
    ]

    email = models.EmailField(_('email address'), unique=True)

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='user',
        help_text='Defines role-based access permissions.'
    )

    email_verified_at = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return f"{self.email} ({self.role})"

    def mark_verified(self):
        """
        Mark the user as verified and activate the account.
        """
        self.is_active = True
        self.email_verified_at = timezone.now()
        self.save()


class OneTimePassword(models.Model):
    """
    Model to store OTP codes for email verification.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def is_expired(self):
        """
        Check if the OTP has expired (10-minute window).
        """
        return timezone.now() > self.created_at + timezone.timedelta(minutes=10)

    def __str__(self):
        return f"OTP for {self.user.email} - {self.otp}"

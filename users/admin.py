from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User,OneTimePassword

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Custom admin configuration for the User model.
    Extends Django's default UserAdmin to support 'role', email login,
    and email verification timestamp display.
    """
    model = User

    # Fields to display in the list view
    list_display = ('email', 'username', 'role', 'is_active', 'is_staff', 'email_verified_at')

    # Filters in the right sidebar
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')

    # Fields to show on user detail/edit page
    fieldsets = BaseUserAdmin.fieldsets + (
        (None, {'fields': ('role', 'email_verified_at')}),
    )

    # Fields to show on user creation form (e.g. in admin panel)
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        (None, {'fields': ('role',)}),
    )

    search_fields = ('email', 'username')
    ordering = ('email',)


@admin.register(OneTimePassword)
class OTPAdmin(admin.ModelAdmin):
    list_display = ('user', 'otp', 'created_at', 'is_used')
    list_filter = ('is_used',)
    search_fields = ('user__email', 'otp')
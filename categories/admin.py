from django.contrib import admin
from .models import Category

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """
    Admin config for Category model.
    Enables list display and filters in Django Admin.
    """
    list_display = ('id', 'name', 'type')
    list_filter = ('type',)
    search_fields = ('name',)

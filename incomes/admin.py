from django.contrib import admin
from .models import Income, Category

@admin.register(Income)
class IncomeAdmin(admin.ModelAdmin):
    """
    Admin panel configuration for the Income model.
    """
    list_display = ("title", "amount", "category", "user", "date")
    list_filter = ("category", "user", "date")
    search_fields = ("title", "notes")
    ordering = ("-date",)
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "category":
            kwargs["queryset"] = Category.objects.filter(type="income")
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

from django.contrib import admin
from .models import Expense
from categories.models import Category


class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'amount', 'category', 'date', 'user')
    list_filter = ('category', 'date')
    search_fields = ('title', 'user__email')
    ordering = ('-date',)

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "category":
            kwargs["queryset"] = Category.objects.filter(type="expense")
        return super().formfield_for_foreignkey(db_field, request, **kwargs)


admin.site.register(Expense, ExpenseAdmin)

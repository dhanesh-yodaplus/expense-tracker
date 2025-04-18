from django.contrib import admin
from .models import Budget, MonthlyBudget

@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ('user', 'category', 'month', 'amount')
    list_filter = ('month', 'category')
    search_fields = ('user__email', 'category__name')

@admin.register(MonthlyBudget)
class MonthlyBudgetAdmin(admin.ModelAdmin):
    list_display = ('user', 'month', 'amount')
    list_filter = ('month',)
    search_fields = ('user__email',)





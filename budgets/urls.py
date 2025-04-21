from rest_framework.routers import DefaultRouter
from .views import (
    BudgetViewSet,
    MonthlyBudgetViewSet,
    confirm_budget_update,
    reject_budget_update,
)
from django.urls import path

router = DefaultRouter()

# Register monthly viewset FIRST
router.register(r'monthlybudgets', MonthlyBudgetViewSet, basename='monthly-budget')

# Then register the general budget viewset
router.register(r'', BudgetViewSet, basename='budget')

# Add token-based confirmation endpoints
urlpatterns = router.urls + [
    path('confirm/<str:token>/', confirm_budget_update, name='confirm-budget'),
    path('reject/<str:token>/', reject_budget_update, name='reject-budget'),
]

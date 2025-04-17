from rest_framework.routers import DefaultRouter
from .views import BudgetViewSet,MonthlyBudgetViewSet

router = DefaultRouter()

# Register monthly viewset FIRST
router.register(r'monthlybudgets', MonthlyBudgetViewSet, basename='monthly-budget')

# Then register the general budget viewset
router.register(r'', BudgetViewSet, basename='budget')


urlpatterns = router.urls

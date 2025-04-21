from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import IncomeViewSet,monthly_income_summary, SalaryCheckAPIView

# Create a router and register our viewset
router = DefaultRouter()
router.register(r'', IncomeViewSet, basename='income')

# Include the router in urlpatterns
urlpatterns = [
    path('summary/', monthly_income_summary, name='monthly_income_summary'),
    path("check-salary-exists/", SalaryCheckAPIView.as_view(), name="check-salary"),
    path('', include(router.urls)),
]


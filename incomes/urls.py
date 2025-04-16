from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import IncomeViewSet

# Create a router and register our viewset
router = DefaultRouter()
router.register(r'', IncomeViewSet, basename='income')

# Include the router in urlpatterns
urlpatterns = [
    path('', include(router.urls)),
]

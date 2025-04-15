from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExpenseViewSet

# DRF router to auto-generate URL patterns
router = DefaultRouter()
router.register(r'', ExpenseViewSet, basename='expense')

urlpatterns = [
    path('', include(router.urls)),
]

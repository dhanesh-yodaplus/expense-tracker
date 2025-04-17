from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExpenseViewSet, ExpenseBulkUploadView

# DRF router to auto-generate URL patterns
router = DefaultRouter()
router.register(r'', ExpenseViewSet, basename='expense')
# router.register(r'expense', ExpenseViewSet, basename='expense')



urlpatterns = [
    path('', include(router.urls)),
    path('upload/bulk/', ExpenseBulkUploadView.as_view(), name='expense-bulk-upload'),
]

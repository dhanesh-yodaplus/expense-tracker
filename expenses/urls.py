from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExpenseViewSet, ExpenseBulkUploadView, summary_by_category, monthly_expense_summary,income_vs_expense_summary

# DRF router to auto-generate URL patterns
router = DefaultRouter()
router.register(r'', ExpenseViewSet, basename='expense')
# router.register(r'expense', ExpenseViewSet, basename='expense')



urlpatterns = [
    path('monthly-summary/', monthly_expense_summary, name="monthly-expense-summary"),
    path("summary-by-category/", summary_by_category, name="summary-by-category"),
    path("summary/income-vs-expense/", income_vs_expense_summary, name="income-vs-expense-summary"),

    path('', include(router.urls)),
    path('upload/bulk/', ExpenseBulkUploadView.as_view(), name='expense-bulk-upload'),
]

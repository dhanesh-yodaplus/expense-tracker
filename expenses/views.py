from rest_framework import viewsets, permissions
from .models import Expense
from .serializers import ExpenseSerializer


class ExpenseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for performing CRUD operations on Expense model.
    Only authenticated users can access their own expenses.
    """
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Return expenses that belong to the logged-in user.
        """
        return Expense.objects.filter(user=self.request.user).order_by('-date')

    def perform_create(self, serializer):
        """
        Automatically set the user when a new expense is created.
        """
        serializer.save(user=self.request.user)

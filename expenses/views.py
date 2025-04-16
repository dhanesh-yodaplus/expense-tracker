from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Expense
from .serializers import ExpenseSerializer


class ExpenseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for performing CRUD operations on the Expense model.
    Only authenticated users can access and modify their own expenses.
    """
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Returns a queryset of expenses belonging to the logged-in user,
        ordered by most recent date first.
        """
        return Expense.objects.filter(user=self.request.user).order_by('-date')

    def create(self, request, *args, **kwargs):
        """
        Handles creation of a new expense entry.
        Automatically sets the user and logs validation errors if any.
        """
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("Validation errors:", serializer.errors)  # Logs specific field errors
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

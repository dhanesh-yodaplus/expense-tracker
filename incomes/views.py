from rest_framework import viewsets, permissions
from .models import Income
from .serializers import IncomeSerializer


class IncomeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for performing CRUD operations on Income.
    Only authenticated users can access and manage their own incomes.
    """
    serializer_class = IncomeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Return incomes that belong only to the currently logged-in user.
        """
        return Income.objects.filter(user=self.request.user).order_by('-date')

    def perform_create(self, serializer):
        """
        Automatically set the user when a new income is created.
        """
        serializer.save(user=self.request.user)

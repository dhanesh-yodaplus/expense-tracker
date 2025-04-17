from rest_framework import viewsets, permissions, status
from .models import Income
from .serializers import IncomeSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum
from datetime import datetime

class IncomeViewSet(viewsets.ModelViewSet):
    serializer_class = IncomeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Income.objects.filter(user=self.request.user).order_by('-date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def monthly_income_summary(request):
    month_str = request.query_params.get('month')
    if not month_str:
        return Response(
            {"error": "Query parameter 'month' is required in format YYYY-MM."},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        month_start = datetime.strptime(month_str, "%Y-%m").date().replace(day=1)
    except ValueError:
        return Response(
            {"error": "Invalid month format. Use YYYY-MM (e.g., 2025-04)."},
            status=status.HTTP_400_BAD_REQUEST
        )

    total_income = Income.objects.filter(
        user=request.user,
        date__year=month_start.year,
        date__month=month_start.month
    ).aggregate(total=Sum('amount'))['total'] or 0

    return Response({
        "total_income": round(float(total_income), 2)
    }, status=status.HTTP_200_OK)

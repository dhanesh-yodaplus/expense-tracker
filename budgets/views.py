from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
from datetime import datetime
from .models import Budget, MonthlyBudget
from .serializers import BudgetSerializer, MonthlyBudgetSerializer
from expenses.models import Expense
from incomes.models import Income

class BudgetViewSet(viewsets.ModelViewSet):
    """
    ViewSet for performing CRUD and summary operations on Budgets.
    Only allows access to budgets of the logged-in user.
    """
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user).order_by('-month')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'], url_path='summary')
    def budget_summary(self, request):
        """
        Returns a summary of budget vs actual expenses per category for a given month.
        Query param: ?month=YYYY-MM
        """
        month_param = request.query_params.get('month')
        if not month_param:
            return Response({"error": "Month query param is required (e.g., ?month=2025-04)"}, status=400)

        try:
            month_start = datetime.strptime(month_param, "%Y-%m").date().replace(day=1)
        except ValueError:
            return Response({"error": "Invalid month format. Use YYYY-MM."}, status=400)

        budgets = Budget.objects.filter(user=request.user, month=month_start)
        results = []

        for budget in budgets:
            expenses = Expense.objects.filter(
                user=request.user,
                category=budget.category,
                date__year=month_start.year,
                date__month=month_start.month
            )
            spent = expenses.aggregate(total=Sum('amount'))['total'] or 0
            spent = float(spent)
            budget_amount = float(budget.amount)

            remaining = round(budget_amount - spent, 2)
            percentage_used = round((spent / budget_amount) * 100, 2) if budget_amount > 0 else 0

            if spent == budget_amount:
                status_label = "perfect_match"
            elif spent > budget_amount:
                status_label = "over_budget"
            elif spent >= 0.8 * budget_amount:
                status_label = "near_limit"
            else:
                status_label = "under_budget"

            results.append({
                "category": budget.category.name,
                "budget": budget_amount,
                "spent": spent,
                "remaining": remaining,
                "percentage_used": percentage_used,
                "status": status_label
            })

        return Response(results, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='by-month')
    def get_budgets_by_month(self, request):
        """
        Returns all budgets for the authenticated user for a specific month.
        Example: /api/budgets/by-month/?month=2025-04
        """
        month_param = request.query_params.get("month")
        if not month_param:
            return Response(
                {"error": "Month query param is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            month_start = datetime.strptime(month_param, "%Y-%m").date().replace(day=1)
        except ValueError:
            return Response(
                {"error": "Invalid format. Use YYYY-MM."},
                status=status.HTTP_400_BAD_REQUEST
            )

        budgets = Budget.objects.filter(user=request.user, month=month_start)
        serializer = BudgetSerializer(budgets, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='analytics')
    def get_analytics(self, request):
        """
        Returns high-level analytics for the selected month:
        - total budget, total spent, total income
        - savings (income - spent)
        - top 3 over-budget categories
        """
        user = request.user
        month_param = request.query_params.get("month")

        try:
            if month_param:
                month_start = datetime.strptime(month_param, "%Y-%m").date().replace(day=1)
            else:
                month_start = datetime.today().replace(day=1)
        except ValueError:
            return Response({"error": "Invalid month format. Use YYYY-MM."}, status=400)

        budgets = Budget.objects.filter(user=user, month=month_start)
        expenses = Expense.objects.filter(user=user, date__year=month_start.year, date__month=month_start.month)
        incomes = Income.objects.filter(user=user, date__year=month_start.year, date__month=month_start.month)

        total_budget = budgets.aggregate(total=Sum('amount'))['total'] or 0
        total_expense = expenses.aggregate(total=Sum('amount'))['total'] or 0
        total_income = incomes.aggregate(total=Sum('amount'))['total'] or 0

        over_budget = []
        for budget in budgets:
            cat_exp = expenses.filter(category=budget.category).aggregate(sum=Sum('amount'))['sum'] or 0
            if cat_exp > budget.amount:
                over_budget.append({
                    "category": budget.category.name,
                    "budget": float(budget.amount),
                    "spent": float(cat_exp),
                    "excess": float(cat_exp - budget.amount)
                })

        top_over_budget = sorted(over_budget, key=lambda x: x['excess'], reverse=True)[:3]

        return Response({
            "total_budget": float(total_budget),
            "total_spent": float(total_expense),
            "total_income": float(total_income),
            "savings": float(total_income - total_expense),
            "top_over_budget_categories": top_over_budget,
        })


class MonthlyBudgetViewSet(viewsets.ModelViewSet):
    """
    ViewSet to manage the overall monthly budget cap.
    """
    queryset = MonthlyBudget.objects.all()
    serializer_class = MonthlyBudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user and self.request.user.is_authenticated:
            return MonthlyBudget.objects.filter(user=self.request.user).order_by('-month')
        return MonthlyBudget.objects.none()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

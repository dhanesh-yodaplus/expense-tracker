from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Expense
from incomes.models import Income
from .serializers import ExpenseSerializer
import csv
import io
from rest_framework.views import APIView
from django.db import transaction
from categories.models import Category
from rest_framework.decorators import api_view, permission_classes
from datetime import datetime
from django.db.models import Sum
import calendar
from dateutil.relativedelta import relativedelta
from django.utils.timezone import now
from budgets.models import Budget
from datetime import datetime
from users.tasks import send_budget_alert_email

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
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("Validation errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        expense = serializer.save(user=request.user)
        user = request.user
        category = expense.category
        month = expense.date.replace(day=1)

        # Check matching budget
        try:
            budget = Budget.objects.get(user=user, category=category, month=month)
            total_spent = Expense.objects.filter(
                user=user,
                category=category,
                date__year=month.year,
                date__month=month.month
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            budget_amount = float(budget.amount)

            if total_spent > budget_amount:
                subject = "❗ Budget Overspent"
                message = f"You have exceeded your budget for {category.name} in {month.strftime('%B')}. Limit: ₹{budget_amount}, Spent: ₹{total_spent}"
                send_budget_alert_email.delay(user.email, subject, message)

            elif total_spent >= 0.8 * budget_amount:
                subject = "⚠️ Budget Near Limit"
                message = f"You've spent over 80% of your {category.name} budget for {month.strftime('%B')}. Limit: ₹{budget_amount}, Spent: ₹{total_spent}"
                send_budget_alert_email.delay(user.email, subject, message)

        except Budget.DoesNotExist:
            pass

        return Response(serializer.data, status=status.HTTP_201_CREATED)



class ExpenseBulkUploadView(APIView):
    """
    API view to handle CSV bulk upload of expenses.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        file = request.FILES.get("file")
        if not file or not file.name.endswith(".csv"):
            return Response({"error": "Please upload a valid CSV file."}, status=status.HTTP_400_BAD_REQUEST)

        decoded_file = file.read().decode("utf-8")
        io_string = io.StringIO(decoded_file)
        reader = csv.DictReader(io_string)

        required_fields = {"title", "amount", "date", "category"}
        success_count = 0
        errors = []

        with transaction.atomic():
            for i, row in enumerate(reader, start=2):
                row_errors = []

                if not required_fields.issubset(row.keys()):
                    return Response({"error": "CSV header must include title, amount, date, category"}, status=400)

                title = row.get("title", "").strip()
                amount = row.get("amount", "").strip()
                date = row.get("date", "").strip()
                category_name = row.get("category", "").strip()
                notes = row.get("notes", "").strip() if "notes" in row else ""

                if not title:
                    row_errors.append("Missing title")
                if not amount or not amount.isdigit():
                    row_errors.append("Invalid or missing amount")
                if not date:
                    row_errors.append("Missing date")

                try:
                    category = Category.objects.get(name__iexact=category_name, type="expense")
                except Category.DoesNotExist:
                    row_errors.append(f"Category '{category_name}' not found")

                if row_errors:
                    errors.append({"row": i, "errors": row_errors})
                    continue

                Expense.objects.create(
                    title=title,
                    amount=int(amount),
                    date=date,
                    category=category,
                    notes=notes,
                    user=request.user
                )
                success_count += 1

        return Response(
            {"success_count": success_count, "errors": errors},
            status=status.HTTP_200_OK
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def summary_by_category(request):
    """
    Returns total expenses grouped by category for the selected month.
    Query param: ?month=YYYY-MM
    """
    month_param = request.query_params.get("month")
    if not month_param:
        return Response({"error": "Month is required (YYYY-MM)"}, status=400)

    try:
        month_date = datetime.strptime(month_param, "%Y-%m").date()
    except ValueError:
        return Response({"error": "Invalid month format. Use YYYY-MM."}, status=400)

    expenses = Expense.objects.filter(
        user=request.user,
        date__year=month_date.year,
        date__month=month_date.month
    )

    summary = (
        expenses.values("category__name")
        .annotate(total=Sum("amount"))
        .order_by("-total")
    )

    formatted = [
        {"category": item["category__name"], "total": float(item["total"])}
        for item in summary
    ]

    return Response(formatted)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def monthly_expense_summary(request):
    """
    Returns total expense per month for the last 6 months.
    Used for bar chart visualization.
    """
    from django.utils.timezone import now
    from dateutil.relativedelta import relativedelta

    user = request.user
    today = now().date()
    summary = []

    # Iterate through the last 6 months
    for i in range(6):
        month_date = today - relativedelta(months=i)
        total = Expense.objects.filter(
            user=user,
            date__year=month_date.year,
            date__month=month_date.month
        ).aggregate(sum=Sum("amount"))["sum"] or 0

        summary.append({
            "month": month_date.strftime("%Y-%m"),
            "total": float(total)
        })

    # Sort months from oldest to latest
    summary = sorted(summary, key=lambda x: x["month"])
    return Response(summary)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def income_vs_expense_summary(request):
    """
    Returns income and expense totals per month (last 6 months) for line chart.
    """
    user = request.user
    today = now().date()
    summary = []

    for i in range(6):
        month_date = today - relativedelta(months=i)
        month_label = calendar.month_abbr[month_date.month] + f" {month_date.year}"

        income_total = Income.objects.filter(
            user=user,
            date__year=month_date.year,
            date__month=month_date.month
        ).aggregate(sum=Sum("amount"))["sum"] or 0

        expense_total = Expense.objects.filter(
            user=user,
            date__year=month_date.year,
            date__month=month_date.month
        ).aggregate(sum=Sum("amount"))["sum"] or 0

        summary.append({
            "month": month_label,
            "income": float(income_total),
            "expense": float(expense_total),
        })

    # Sort by date ascending
    summary = sorted(summary, key=lambda x: datetime.strptime(x["month"], "%b %Y"))
    return Response(summary)
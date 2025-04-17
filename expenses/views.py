from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Expense
from .serializers import ExpenseSerializer
import csv
import io
from rest_framework.views import APIView
from django.db import transaction
from categories.models import Category

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


class ExpenseBulkUploadView(APIView):
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
            for i, row in enumerate(reader, start=2):  # start=2 to account for header row
                row_errors = []

                # Check for missing fields
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

                # Create expense
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
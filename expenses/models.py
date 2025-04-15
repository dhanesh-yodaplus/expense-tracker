from django.db import models
from django.conf import settings
# from categories.models import Category

class Expense(models.Model):
    """
    Expense model representing a financial expense made by a user.

    Fields:
        title (str): A short description of the expense.
        amount (decimal): Amount of money spent.
        category (FK): Foreign key to Category model.
        date (date): Date the expense occurred.
        user (FK): Foreign key to the user who owns this expense.
    """
    title = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    # category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='expenses')
    date = models.DateField()
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='expenses')

    def __str__(self):
        return f"{self.title} - ₹{self.amount} by {self.user.email}"

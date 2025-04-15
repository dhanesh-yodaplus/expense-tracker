# categories/models.py

from django.db import models

class Category(models.Model):
    """
    Category model used to classify expenses and incomes.

    Fields:
        name (str): The name of the category (e.g., Food, Rent, Transport).
        type (str): Either 'income' or 'expense' to distinguish category usage.
    """
    CATEGORY_TYPES = [
        ('expense', 'Expense'),
        ('income', 'Income'),
    ]

    name = models.CharField(max_length=100)
    type = models.CharField(max_length=10, choices=CATEGORY_TYPES)

    def __str__(self):
        return f"{self.name} ({self.type})"

    class Meta:
        verbose_name_plural = "Categories"
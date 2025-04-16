from django.db import models
from django.conf import settings
from categories.models import Category  # assuming shared category table

class Income(models.Model):
    """
    Model to represent an income record for a user.
    """
    title = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']
        verbose_name = "Income"
        verbose_name_plural = "Incomes"

    def __str__(self):
        return f"{self.title} - ₹{self.amount}"

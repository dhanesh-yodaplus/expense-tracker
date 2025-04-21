from django.db import models
from django.contrib.auth import get_user_model
from categories.models import Category
from django.utils import timezone


User = get_user_model()

class Budget(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="budgets" )
    category = models.ForeignKey(Category, on_delete=models.CASCADE, limit_choices_to={"type": "expense"})
    month = models.DateField()  # We'll use the first day of the month to represent it
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        unique_together = ('user', 'category', 'month')
        verbose_name_plural = "Budgets"

    def __str__(self):
        return f"{self.user.email} | {self.category.name} | {self.month.strftime('%B %Y')} → ₹{self.amount}"


class MonthlyBudget(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    month = models.DateField()  
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        unique_together = ('user', 'month')
        verbose_name_plural = "Monthly Budgets"

    def __str__(self):
        return f"{self.user.email} | {self.month.strftime('%B %Y')} → ₹{self.amount}"

class PendingBudgetUpdate(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    original_budget = models.ForeignKey(Budget, on_delete=models.CASCADE)
    proposed_amount = models.DecimalField(max_digits=10, decimal_places=2)
    token = models.CharField(max_length=100, unique=True)
    is_confirmed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        return timezone.now() > self.created_at + timezone.timedelta(minutes=30)

    def __str__(self):
        return f"Pending update for {self.original_budget} → ₹{self.proposed_amount}"




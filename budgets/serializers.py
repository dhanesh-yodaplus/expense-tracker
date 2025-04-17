from rest_framework import serializers
from .models import Budget
from django.db.models import Sum
from .models import MonthlyBudget

class BudgetSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Budget
        fields = ['id', 'user', 'category', 'category_name', 'month', 'amount']
        read_only_fields = ['user']

    def validate(self, data):
        """
        Ensure total monthly budget per category does not exceed the user-defined monthly limit.
        """
        user = self.context['request'].user
        month = data.get('month') or self.instance.month
        amount = data.get('amount') or self.instance.amount

        # Optional: You can pass the monthly_limit via context (or replace with a fixed value)
        monthly_limit = self.context.get('monthly_limit', None)

        if monthly_limit is not None:
            # Exclude current record if updating
            existing_total = Budget.objects.filter(
                user=user,
                month=month
            ).exclude(pk=self.instance.pk if self.instance else None).aggregate(
                total=Sum('amount')
            )['total'] or 0

            new_total = existing_total + amount
            if new_total > monthly_limit:
                raise serializers.ValidationError(
                    f"Total monthly budget ({new_total}) exceeds your allowed limit ({monthly_limit})."
                )

        return data


class MonthlyBudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = MonthlyBudget
        fields = ['id', 'user', 'month', 'amount']
        read_only_fields = ['user']

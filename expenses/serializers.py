from rest_framework import serializers
from .models import Expense


class ExpenseSerializer(serializers.ModelSerializer):
    """
    Serializer for the Expense model.
    Handles serialization and validation of Expense data,
    and assigns the logged-in user automatically when creating an Expense.
    """

    class Meta:
        model = Expense
        fields = ['id', 'title', 'amount', 'category', 'date', 'notes', 'user', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

    def validate_amount(self, value):
        """
        Ensure the amount is a positive number.
        """
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0.")
        return value

    def create(self, validated_data):
        """
        Assign the logged-in user to the expense before saving.
        """
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

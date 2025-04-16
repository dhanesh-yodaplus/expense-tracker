from rest_framework import serializers
from .models import Expense, Category

class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer for the Category model.
    Used to represent category details (id and name) in nested output.
    """
    class Meta:
        model = Category
        fields = ['id', 'name']


class ExpenseSerializer(serializers.ModelSerializer):
    """
    Serializer for the Expense model.
    Handles both read and write logic:
    - Accepts category as an ID on input (write-only field)
    - Returns full category object (id and name) on output
    - Automatically assigns the logged-in user on creation
    """
    category = CategorySerializer(read_only=True)  # Shown in GET responses
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        write_only=True,
        source='category'
    )  # Used in POST/PUT input

    class Meta:
        model = Expense
        fields = [
            'id', 'title', 'amount', 'category', 'category_id',
            'date', 'notes', 'user', 'created_at'
        ]
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
        Assigns the authenticated user to the expense instance.
        """
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

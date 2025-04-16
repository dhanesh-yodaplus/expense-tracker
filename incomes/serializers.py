from rest_framework import serializers
from .models import Income


class IncomeSerializer(serializers.ModelSerializer):
    """
    Serializer for the Income model.
    Ensures clean validation and auto-assigns the logged-in user.
    """
    category = serializers.SerializerMethodField()  
    class Meta:
        model = Income
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
        Assign the logged-in user automatically during income creation.
        """
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
    
    def get_category(self, obj):
        if obj.category:
            return {'id': obj.category.id, 'name': obj.category.name}
        return None

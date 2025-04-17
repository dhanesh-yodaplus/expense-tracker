from rest_framework import serializers
from .models import Income

class IncomeSerializer(serializers.ModelSerializer):
    """
    Serializer for the Income model.
    Ensures clean validation and auto-assigns the logged-in user.
    """
    category = serializers.SerializerMethodField()  # Used for frontend display
    category_id = serializers.IntegerField(write_only=True)  # Accepts input from frontend form

    class Meta:
        model = Income
        fields = ['id', 'title', 'amount', 'category', 'category_id', 'date', 'notes', 'user', 'created_at']
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

    def update(self, instance, validated_data):
        """
        Ensure category can be updated properly.
        """
        category_id = validated_data.pop('category_id', None)
        if category_id:
            instance.category_id = category_id
        return super().update(instance, validated_data)

    def get_category(self, obj):
        """
        Display category as nested object {id, name}.
        """
        if obj.category:
            return {'id': obj.category.id, 'name': obj.category.name}
        return None

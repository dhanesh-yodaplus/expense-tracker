from rest_framework import serializers
from .models import Category

class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer for the Category model.
    Includes id, name, and type fields.
    """
    class Meta:
        model = Category
        fields = ['id', 'name', 'type']

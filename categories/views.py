from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Category
from .serializers import CategorySerializer

class CategoryListAPIView(generics.ListAPIView):
    """
    Authenticated API view to retrieve all categories.
    
    - Supports optional filtering by `type` query parameter.
    - `type` can be either 'expense' or 'income'.
    
    Example:
        GET /api/categories/             → All categories
        GET /api/categories/?type=expense → Only expense categories
    """
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        category_type = self.request.query_params.get('type')
        if category_type in ['expense', 'income']:
            return Category.objects.filter(type=category_type)
        return Category.objects.all()


class CategoryDetailAPIView(generics.RetrieveAPIView):
    """
    Authenticated API view to retrieve a single category by ID.
    
    Example:
        GET /api/categories/3/  → Category with ID = 3
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

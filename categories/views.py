from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Category
from .serializers import CategorySerializer
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.authentication import JWTAuthentication


class CategoryListAPIView(generics.ListAPIView):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    """
    Authenticated API view to retrieve all categories.
    
    - Supports optional filtering by `type` query parameter.
    - `type` can be either 'expense' or 'income'.
    
    Example:
        GET /api/categories/             → All categories
        GET /api/categories/?type=expense → Only expense categories
    """
    def get_queryset(self):
        return Category.objects.all()

    def get_queryset(self):
        category_type = self.request.query_params.get('type')
        
        if category_type:
            # lowered = category_type.lower()
            if category_type in ['expense', 'income']:
                return Category.objects.filter(type__iexact=category_type)
        
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




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def test_category_ping(request):
    print("TEST CATEGORY VIEW HIT")
    return Response({"ping": "pong", "user": str(request.user)})

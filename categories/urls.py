from django.urls import path
from .views import CategoryListAPIView, CategoryDetailAPIView,test_category_ping

urlpatterns = [
    path('', CategoryListAPIView.as_view(), name='category-list'),
    path('<int:pk>/', CategoryDetailAPIView.as_view(), name='category-detail'),
    path('categories/', CategoryListAPIView.as_view()),  # this must be there
    path('ping/', test_category_ping),  # new test route
    # path('', CategoryListAPIView.as_view(), name='category-list'),
]


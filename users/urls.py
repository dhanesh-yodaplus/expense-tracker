from django.urls import path
from .views import RegisterView, LoginView, LogoutView,ProtectedTestView
from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [
# Renamed default 'login/' route to 'login-expense/' to reduce exposure to automated scanners.
# Helps protect authentication endpoints by avoiding commonly targeted paths like '/login/'.
    path('register/', RegisterView.as_view(), name='register'),
    path('login-expense/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('protected/', ProtectedTestView.as_view()),

]

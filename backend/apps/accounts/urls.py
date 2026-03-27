from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.routers import DefaultRouter
from .views import LogoutView, RegisterView, ProfileView, CookieTokenObtainPairView, CookieTokenRefreshView, CustomerAddressViewSet, SavedPaymentMethodViewSet

router = DefaultRouter()
router.register(r'addresses', CustomerAddressViewSet, basename='addresses')
router.register(r'payment-methods', SavedPaymentMethodViewSet, basename='payment-methods')

urlpatterns = [
    # JWT Login Flow
    path('login/', CookieTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    # User Management
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('', include(router.urls)),
]
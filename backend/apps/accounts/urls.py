from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProfileView, CustomerAddressViewSet, SavedPaymentMethodViewSet, SyncUserView

router = DefaultRouter(trailing_slash=False)
router.register(r'addresses', CustomerAddressViewSet, basename='addresses')
router.register(r'payment-methods', SavedPaymentMethodViewSet, basename='payment-methods')

urlpatterns = [
    # User Management
    path('profile/', ProfileView.as_view(), name='profile'),
    # 🌟 Internal: Called by Better Auth on signup (no trailing slash to match APPEND_SLASH=False)
    path('sync-user', SyncUserView.as_view(), name='sync-user'),
    path('', include(router.urls)),
]
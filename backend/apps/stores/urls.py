from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StoreDiscoveryViewSet, StoreManagementViewSet, ProductViewSet

router = DefaultRouter()
router.register(r'manage', StoreManagementViewSet, basename='store-manage')
router.register(r'discovery', StoreDiscoveryViewSet, basename='store-discovery')
router.register(r'products', ProductViewSet, basename='product')

urlpatterns = [
    path('', include(router.urls)),
]
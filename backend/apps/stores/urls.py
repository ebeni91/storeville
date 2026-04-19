from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StoreManagementViewSet, StoreDiscoveryViewSet

router = DefaultRouter(trailing_slash=True)
router.register(r'manage', StoreManagementViewSet, basename='store-manage')

# CRITICAL FIX: You must register the Discovery ViewSet here!
router.register(r'discovery', StoreDiscoveryViewSet, basename='store-discovery')

urlpatterns = [
    path('', include(router.urls)),
]
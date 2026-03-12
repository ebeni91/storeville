from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SellerProductViewSet, PublicProductViewSet

router = DefaultRouter()
# /api/products/manage/ -> For the seller dashboard
router.register(r'manage', SellerProductViewSet, basename='product-manage')
# /api/products/catalog/ -> For the public storefronts
router.register(r'catalog', PublicProductViewSet, basename='product-catalog')

urlpatterns = [
    path('', include(router.urls)),
]
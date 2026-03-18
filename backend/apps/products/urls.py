from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, CategoryViewSet, PublicProductViewSet

router = DefaultRouter()
router.register(r'manage', ProductViewSet, basename='product-manage')
router.register(r'categories', CategoryViewSet, basename='category-manage')
router.register(r'storefront', PublicProductViewSet, basename='public-products')
urlpatterns = [
    path('', include(router.urls)),
]
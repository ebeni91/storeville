from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, CategoryViewSet

router = DefaultRouter()
router.register(r'manage', ProductViewSet, basename='product-manage')
router.register(r'categories', CategoryViewSet, basename='category-manage')

urlpatterns = [
    path('', include(router.urls)),
]
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RetailCategoryViewSet, RetailProductViewSet

router = DefaultRouter()
router.register(r'categories', RetailCategoryViewSet, basename='retail-category')
router.register(r'products', RetailProductViewSet, basename='retail-product')

urlpatterns = [
    path('', include(router.urls)),
]
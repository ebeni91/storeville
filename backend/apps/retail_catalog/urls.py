from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RetailCategoryViewSet, RetailProductViewSet, RetailFavoriteViewSet

router = DefaultRouter(trailing_slash=False)
router.register(r'categories', RetailCategoryViewSet, basename='retail-category')
router.register(r'products', RetailProductViewSet, basename='retail-product')
router.register(r'favorites', RetailFavoriteViewSet, basename='retail-favorite')

urlpatterns = [
    path('', include(router.urls)),
]
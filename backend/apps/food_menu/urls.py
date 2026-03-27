from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MenuCategoryViewSet, MenuItemViewSet, FoodFavoriteViewSet

router = DefaultRouter()
router.register(r'categories', MenuCategoryViewSet, basename='menu-category')
router.register(r'items', MenuItemViewSet, basename='menu-item')
router.register(r'favorites', FoodFavoriteViewSet, basename='food-favorite')

urlpatterns = [
    path('', include(router.urls)),
]
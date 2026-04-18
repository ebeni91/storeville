from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MenuCategoryViewSet, MenuItemViewSet,
    MenuItemOptionViewSet, MenuItemExtraViewSet,
    FoodFavoriteViewSet,
)

router = DefaultRouter(trailing_slash=True)
router.register(r'categories', MenuCategoryViewSet, basename='menu-category')
router.register(r'items', MenuItemViewSet, basename='menu-item')
router.register(r'favorites', FoodFavoriteViewSet, basename='food-favorite')

urlpatterns = [
    path('', include(router.urls)),
    # Nested: /food/items/{item_pk}/options/ and /food/items/{item_pk}/options/{pk}/
    path('items/<str:item_pk>/options/', MenuItemOptionViewSet.as_view({'get': 'list', 'post': 'create'}), name='item-options-list'),
    path('items/<str:item_pk>/options/<str:pk>/', MenuItemOptionViewSet.as_view({'get': 'retrieve', 'patch': 'partial_update', 'delete': 'destroy'}), name='item-options-detail'),
    # Nested: /food/items/{item_pk}/extras/ and /food/items/{item_pk}/extras/{pk}/
    path('items/<str:item_pk>/extras/', MenuItemExtraViewSet.as_view({'get': 'list', 'post': 'create'}), name='item-extras-list'),
    path('items/<str:item_pk>/extras/<str:pk>/', MenuItemExtraViewSet.as_view({'get': 'retrieve', 'patch': 'partial_update', 'delete': 'destroy'}), name='item-extras-detail'),
]
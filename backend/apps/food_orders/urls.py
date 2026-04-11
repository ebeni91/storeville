from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CartDetailView, FoodOrderViewSet, CartMergeView

router = DefaultRouter(trailing_slash=False)
router.register(r'', FoodOrderViewSet, basename='food-orders')

urlpatterns = [
    path('cart/merge/', CartMergeView.as_view(), name='food-cart-merge'),
    path('cart/', CartDetailView.as_view(), name='cart-detail'),
    path('', include(router.urls))
]
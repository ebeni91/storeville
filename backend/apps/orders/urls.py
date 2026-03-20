from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CartViewSet, CheckoutView, CustomerOrderViewSet, SellerOrderViewSet

router = DefaultRouter()
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'my-orders', CustomerOrderViewSet, basename='customer-orders')
router.register(r'store-orders', SellerOrderViewSet, basename='seller-orders')

urlpatterns = [
    # THIS MUST BE FIRST
    path('checkout/', CheckoutView.as_view(), name='api-checkout'),
    path('', include(router.urls)),
]
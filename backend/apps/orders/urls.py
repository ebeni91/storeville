from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CartViewSet, CheckoutView, CustomerOrderViewSet, SellerOrderViewSet

router = DefaultRouter()
# /api/orders/cart/ -> For adding/viewing items on a subdomain
router.register(r'cart', CartViewSet, basename='cart')
# /api/orders/my-orders/ -> For the customer's personal history
router.register(r'my-orders', CustomerOrderViewSet, basename='customer-orders')
# /api/orders/manage/ -> For the seller dashboard
router.register(r'manage', SellerOrderViewSet, basename='seller-orders')

urlpatterns = [
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('', include(router.urls)),
]
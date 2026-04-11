from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RetailOrderViewSet, CartMergeView, CartDetailView

router = DefaultRouter(trailing_slash=False)
router.register(r'', RetailOrderViewSet, basename='retail-orders')

urlpatterns = [
    # Explicit paths must go before the router include
    path('cart/merge/', CartMergeView.as_view(), name='cart-merge'),
    path('cart/', CartDetailView.as_view(), name='cart-detail'),
    path('', include(router.urls))
]
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, OrderStatusView

router = DefaultRouter()
# Register the OrderViewSet at the root of /api/orders/
router.register(r'', OrderViewSet, basename='order')

urlpatterns = [
    # Custom status endpoint
    path('status/', OrderStatusView.as_view(), name='order-status'),
    
    # Router URLs (handles POST /api/orders/ and GET /api/orders/)
    path('', include(router.urls)),
]
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DriverActionViewSet, DriverLocationUpdateView, PublicTrackingView

router = DefaultRouter(trailing_slash=True)
# /api/delivery/driver/ -> Driver's assigned deliveries
router.register(r'driver', DriverActionViewSet, basename='driver-deliveries')

urlpatterns = [
    path('location/update/', DriverLocationUpdateView.as_view(), name='update-location'),
    path('track/<str:tracking_code>/', PublicTrackingView.as_view(), name='track-delivery'),
    path('', include(router.urls)),
]
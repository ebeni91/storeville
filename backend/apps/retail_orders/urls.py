from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RetailOrderViewSet

router = DefaultRouter()
router.register(r'', RetailOrderViewSet, basename='retail-orders')

urlpatterns = [
    path('', include(router.urls)),
]
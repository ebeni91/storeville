from rest_framework.routers import DefaultRouter
from .views import OrderViewSet

router = DefaultRouter()
# 👇 ADD basename='order' HERE
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = router.urls
from django.urls import path, include
from rest_framework.routers import DefaultRouter
# 👇 Import ChatProductSearchView here
from .views import StoreViewSet, ProductViewSet, ChatProductSearchView

router = DefaultRouter()
router.register(r'stores', StoreViewSet, basename='store')
router.register(r'products', ProductViewSet, basename='product')

urlpatterns = [
    path('', include(router.urls)),
    # 👇 Add this line so the API exists!
    path('chat-search/', ChatProductSearchView.as_view(), name='chat-search'),
]
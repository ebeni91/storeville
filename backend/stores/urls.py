from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StoreViewSet, ProductViewSet, ChatProductSearchView

router = DefaultRouter()
router.register(r'stores', StoreViewSet, basename='store')
router.register(r'products', ProductViewSet, basename='product')

urlpatterns = [
    # 👇 MOVED UP & RENAMED: 
    # Must be BEFORE router.urls to prevent "chat-search" being treated as a store slug.
    # We also changed 'chat-search/' to 'stores/chat-search/' to match the frontend.
    path('stores/chat-search/', ChatProductSearchView.as_view(), name='chat-search'),

    # Standard routes (stores/, products/)
    path('', include(router.urls)),
]
from rest_framework import viewsets, permissions
from core.permissions import IsSeller
from rest_framework.exceptions import PermissionDenied
from .models import Product
from .serializers import ProductSerializer

class SellerProductViewSet(viewsets.ModelViewSet):
    """
    For the Seller Dashboard (storeville.app/dashboard).
    Sellers can perform full CRUD on their products.
    """
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated, IsSeller]

    def get_queryset(self):
        # A seller can only manage products for stores they own
        return Product.objects.filter(store__owner=self.request.user)

    def perform_create(self, serializer):
        # We need the store ID from the request data to link the product
        store_id = self.request.data.get('store')
        serializer.save(store_id=store_id)


class PublicProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    For the Public Subdomain Storefront (e.g., abel-electronics.storeville.app).
    Customers can only view products, and ONLY for the store they are currently visiting.
    """
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        # THIS IS THE MULTI-TENANT MAGIC!
        # request.store_context is populated by our SubdomainStoreMiddleware.
        if hasattr(self.request, 'store_context') and self.request.store_context:
            return Product.objects.filter(store=self.request.store_context, is_active=True)
        
        # If accessed directly without a subdomain, return nothing to prevent data leaks
        return Product.objects.none()
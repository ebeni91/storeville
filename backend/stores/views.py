from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Store, Product
from .serializers import StoreSerializer, ProductSerializer

class StoreViewSet(viewsets.ModelViewSet): # <--- Changed to ModelViewSet (allows create/edit)
    serializer_class = StoreSerializer
    lookup_field = 'slug'

    def get_permissions(self):
        # Allow anyone to browse, but only logged-in users to create/edit
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        # Public browsing only shows active stores
        return Store.objects.filter(is_active=True)

    def perform_create(self, serializer):
        # Automatically assign the logged-in user as the owner
        serializer.save(owner=self.request.user)

    # 👇 NEW: Endpoint to get the logged-in user's store
    @action(detail=False, methods=['get'])
    def mine(self, request):
        store = Store.objects.filter(owner=request.user).first()
        if store:
            serializer = self.get_serializer(store)
            return Response(serializer.data)
        return Response({}) # <--- Return empty JSON object instead

class ProductViewSet(viewsets.ModelViewSet): # <--- Changed to ModelViewSet
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        # Only show available products
        return Product.objects.filter(is_available=True)
        
    def perform_create(self, serializer):
        # Ensure user can only add products to THEIR store
        store = Store.objects.filter(owner=self.request.user).first()
        if store:
            serializer.save(store=store)
        else:
            raise Exception("You must have a store to add products")
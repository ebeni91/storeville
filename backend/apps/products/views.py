from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from django.utils.text import slugify
from .models import Product, Category
from .serializers import ProductSerializer, CategorySerializer
from apps.stores.models import Store  # <-- Explicitly import the Store model

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role != 'SELLER':
            return Category.objects.none()
        return Category.objects.filter(store__owner=user)

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'SELLER':
            raise PermissionDenied("Only sellers can create categories.")
        
        # FIX: Direct query instead of using the fragile reverse accessor
        store = Store.objects.filter(owner=user).first()
        if not store:
            raise PermissionDenied("You do not have an active store.")
        
        name = serializer.validated_data.get('name')
        slug = slugify(name)
        
        original_slug = slug
        counter = 1
        while Category.objects.filter(store=store, slug=slug).exists():
            slug = f"{original_slug}-{counter}"
            counter += 1
            
        serializer.save(store=store, slug=slug)


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role != 'SELLER':
            return Product.objects.none()
        return Product.objects.filter(store__owner=user).order_by('-created_at')

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'SELLER':
            raise PermissionDenied("Only sellers can create products.")
            
        # FIX: Direct query instead of using the fragile reverse accessor
        store = Store.objects.filter(owner=user).first()
        if not store:
            raise PermissionDenied("You do not have an active store.")
            
        category = serializer.validated_data.get('category')
        if category and category.store != store:
            raise PermissionDenied("You cannot assign a product to another store's category.")
            
        serializer.save(store=store) 
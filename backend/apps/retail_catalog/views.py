from rest_framework import viewsets, permissions
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from django.utils.text import slugify
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from .models import RetailCategory, RetailProduct, RetailFavorite
from .serializers import RetailCategorySerializer, RetailProductSerializer, RetailFavoriteSerializer
from apps.stores.models import Store


from core.permissions import IsStoreOwnerOrReadOnly


class RetailCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = RetailCategorySerializer
    permission_classes = [IsStoreOwnerOrReadOnly]

    def get_queryset(self):
        store_id = self.request.query_params.get('store_id')
        if store_id:
            return RetailCategory.objects.filter(store_id=store_id).order_by('name')
        if self.request.user.is_authenticated:
            return RetailCategory.objects.filter(store__owner=self.request.user).order_by('name')
        return RetailCategory.objects.none()

    def perform_create(self, serializer):
        store_id = self.request.data.get('store_id')
        # Require explicit store_id to prevent silently creating the category under the wrong store.
        if not store_id:
            raise ValidationError({'store_id': 'This field is required when creating a category.'})
        store = get_object_or_404(Store, id=store_id, owner=self.request.user)

        # Auto-generate URL-friendly slug from the category name.
        # Handles uniqueness collisions by appending an incremental counter.
        name = self.request.data.get('name', '')
        base_slug = slugify(name) or 'category'
        slug = base_slug
        counter = 2
        while RetailCategory.objects.filter(store=store, slug=slug).exists():
            slug = f'{base_slug}-{counter}'
            counter += 1

        serializer.save(store=store, slug=slug)


@method_decorator(
    # Cache the product list response for 10 minutes to improve read performance.
    # The cache is keyed by URL (including query params like ?store_id=) to ensure 
    # store-specific results are returned correctly.
    cache_page(60 * 10),
    name='list'
)
class RetailProductViewSet(viewsets.ModelViewSet):
    serializer_class = RetailProductSerializer
    permission_classes = [IsStoreOwnerOrReadOnly]

    def get_queryset(self):
        store_id = self.request.query_params.get('store_id')

        if store_id and self.request.method in permissions.SAFE_METHODS:
            return RetailProduct.objects.filter(
                store_id=store_id, is_active=True
            ).select_related('store', 'category').order_by('-id')

        # Seller write requests: MUST own the store — no cross-store reads.
        if self.request.user.is_authenticated:
            return RetailProduct.objects.filter(
                store__owner=self.request.user
            ).select_related('store', 'category').order_by('-id')

        return RetailProduct.objects.none()

    def perform_create(self, serializer):
        store_id = self.request.data.get('store_id')

        if not store_id:
            raise ValidationError({'store_id': 'This field is required when creating a product.'})
        store = get_object_or_404(Store, id=store_id, owner=self.request.user)
        serializer.save(store=store)


class RetailFavoriteViewSet(viewsets.ModelViewSet):
    serializer_class = RetailFavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return RetailFavorite.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        user = self.request.user
        product = serializer.validated_data['product']
        if RetailFavorite.objects.filter(user=user, product=product).exists():
            raise ValidationError("Product is already in your wishlist.")
        serializer.save(user=user)
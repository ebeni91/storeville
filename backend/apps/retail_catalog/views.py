from rest_framework import viewsets, permissions
from rest_framework.exceptions import ValidationError
from .models import RetailCategory, RetailProduct, RetailFavorite
from .serializers import RetailCategorySerializer, RetailProductSerializer, RetailFavoriteSerializer
from apps.stores.models import Store

class IsStoreOwnerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS: 
            return True
        return request.user and request.user.is_authenticated
        
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS: 
            return True
        return obj.store.owner == request.user # Fixed the request.request.user typo

class RetailCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = RetailCategorySerializer
    permission_classes = [IsStoreOwnerOrReadOnly]

    def get_queryset(self):
        store_id = self.request.query_params.get('store_id')
        if store_id: 
            # Added order_by to fix the UnorderedObjectListWarning
            return RetailCategory.objects.filter(store_id=store_id).order_by('name')
        
        if self.request.user.is_authenticated: 
            return RetailCategory.objects.filter(store__owner=self.request.user).order_by('name')
            
        return RetailCategory.objects.none()

    def perform_create(self, serializer):
        serializer.save(store=Store.objects.get(owner=self.request.user))

class RetailProductViewSet(viewsets.ModelViewSet):
    serializer_class = RetailProductSerializer
    permission_classes = [IsStoreOwnerOrReadOnly]

    def get_queryset(self):
        store_id = self.request.query_params.get('store_id')
        if store_id: 
            # Added order_by to fix the UnorderedObjectListWarning
            return RetailProduct.objects.filter(store_id=store_id, is_active=True).order_by('-id')
            
        if self.request.user.is_authenticated: 
            return RetailProduct.objects.filter(store__owner=self.request.user).order_by('-id')
            
        return RetailProduct.objects.none()


    def perform_create(self, serializer):
        serializer.save(store=Store.objects.get(owner=self.request.user))

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
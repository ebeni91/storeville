from rest_framework import viewsets, permissions
from .models import RetailCategory, RetailProduct
from .serializers import RetailCategorySerializer, RetailProductSerializer
from apps.stores.models import Store

class IsStoreOwnerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS: return True
        return request.user and request.user.is_authenticated
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS: return True
        return obj.store.owner == request.request.user

class RetailCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = RetailCategorySerializer
    permission_classes = [IsStoreOwnerOrReadOnly]

    def get_queryset(self):
        store_id = self.request.query_params.get('store_id')
        if store_id: return RetailCategory.objects.filter(store_id=store_id)
        if self.request.user.is_authenticated: return RetailCategory.objects.filter(store__owner=self.request.user)
        return RetailCategory.objects.none()

    def perform_create(self, serializer):
        serializer.save(store=Store.objects.get(owner=self.request.user))

class RetailProductViewSet(viewsets.ModelViewSet):
    serializer_class = RetailProductSerializer
    permission_classes = [IsStoreOwnerOrReadOnly]

    def get_queryset(self):
        store_id = self.request.query_params.get('store_id')
        if store_id: return RetailProduct.objects.filter(store_id=store_id, is_active=True)
        if self.request.user.is_authenticated: return RetailProduct.objects.filter(store__owner=self.request.user)
        return RetailProduct.objects.none()

    def perform_create(self, serializer):
        serializer.save(store=Store.objects.get(owner=self.request.user))
from rest_framework import viewsets, permissions
from .models import MenuCategory, MenuItem
from .serializers import MenuCategorySerializer, MenuItemSerializer
from apps.stores.models import Store

class IsStoreOwnerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS: return True
        return request.user and request.user.is_authenticated
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS: return True
        return obj.store.owner == request.user

class MenuCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = MenuCategorySerializer
    permission_classes = [IsStoreOwnerOrReadOnly]

    def get_queryset(self):
        store_id = self.request.query_params.get('store_id')
        if store_id: return MenuCategory.objects.filter(store_id=store_id).order_by('order')
        if self.request.user.is_authenticated: return MenuCategory.objects.filter(store__owner=self.request.user).order_by('order')
        return MenuCategory.objects.none()

    def perform_create(self, serializer):
        serializer.save(store=Store.objects.get(owner=self.request.user))

class MenuItemViewSet(viewsets.ModelViewSet):
    serializer_class = MenuItemSerializer
    permission_classes = [IsStoreOwnerOrReadOnly]

    def get_queryset(self):
        store_id = self.request.query_params.get('store_id')
        if store_id: return MenuItem.objects.filter(store_id=store_id, is_available=True)
        if self.request.user.is_authenticated: return MenuItem.objects.filter(store__owner=self.request.user)
        return MenuItem.objects.none()

    def perform_create(self, serializer):
        serializer.save(store=Store.objects.get(owner=self.request.user))
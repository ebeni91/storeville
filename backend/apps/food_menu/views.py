from rest_framework import viewsets, permissions
from rest_framework.exceptions import ValidationError
from .models import MenuCategory, MenuItem, MenuItemOption, MenuItemExtra, FoodFavorite
from .serializers import MenuCategorySerializer, MenuItemSerializer, MenuItemOptionSerializer, MenuItemExtraSerializer, FoodFavoriteSerializer
from apps.stores.models import Store


class IsStoreOwnerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        # Support both direct store ownership and menu_item → store ownership
        if hasattr(obj, 'store'):
            return obj.store.owner == request.user
        if hasattr(obj, 'menu_item'):
            return obj.menu_item.store.owner == request.user
        return False


class MenuCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = MenuCategorySerializer
    permission_classes = [IsStoreOwnerOrReadOnly]

    def get_queryset(self):
        store_id = self.request.query_params.get('store_id')
        if store_id:
            return MenuCategory.objects.filter(store_id=store_id).order_by('order')
        if self.request.user.is_authenticated:
            return MenuCategory.objects.filter(store__owner=self.request.user).order_by('order')
        return MenuCategory.objects.none()

    def perform_create(self, serializer):
        store_id = self.request.data.get('store_id')
        store = Store.objects.filter(id=store_id, owner=self.request.user).first() if store_id else Store.objects.filter(owner=self.request.user).first()
        serializer.save(store=store)


class MenuItemViewSet(viewsets.ModelViewSet):
    serializer_class = MenuItemSerializer
    permission_classes = [IsStoreOwnerOrReadOnly]

    def get_queryset(self):
        store_id = self.request.query_params.get('store_id')
        if store_id:
            return MenuItem.objects.filter(store_id=store_id, is_available=True).prefetch_related('options', 'extras')
        if self.request.user.is_authenticated:
            return MenuItem.objects.filter(store__owner=self.request.user).prefetch_related('options', 'extras')
        return MenuItem.objects.none()

    def perform_create(self, serializer):
        store_id = self.request.data.get('store_id')
        store = Store.objects.filter(id=store_id, owner=self.request.user).first() if store_id else Store.objects.filter(owner=self.request.user).first()
        serializer.save(store=store)


class MenuItemOptionViewSet(viewsets.ModelViewSet):
    """CRUD for a menu item's options (variants like size/crust)."""
    serializer_class = MenuItemOptionSerializer
    permission_classes = [IsStoreOwnerOrReadOnly]

    def get_queryset(self):
        item_id = self.kwargs.get('item_pk')
        return MenuItemOption.objects.filter(menu_item_id=item_id)

    def perform_create(self, serializer):
        item_id = self.kwargs.get('item_pk')
        menu_item = MenuItem.objects.get(id=item_id)
        serializer.save(menu_item=menu_item)


class MenuItemExtraViewSet(viewsets.ModelViewSet):
    """CRUD for a menu item's extras (add-ons like extra cheese)."""
    serializer_class = MenuItemExtraSerializer
    permission_classes = [IsStoreOwnerOrReadOnly]

    def get_queryset(self):
        item_id = self.kwargs.get('item_pk')
        return MenuItemExtra.objects.filter(menu_item_id=item_id)

    def perform_create(self, serializer):
        item_id = self.kwargs.get('item_pk')
        menu_item = MenuItem.objects.get(id=item_id)
        serializer.save(menu_item=menu_item)


class FoodFavoriteViewSet(viewsets.ModelViewSet):
    serializer_class = FoodFavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return FoodFavorite.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        user = self.request.user
        menu_item = serializer.validated_data['menu_item']
        if FoodFavorite.objects.filter(user=user, menu_item=menu_item).exists():
            raise ValidationError("Menu item is already in your wishlist.")
        serializer.save(user=user)
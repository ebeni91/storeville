from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import MenuCategory, MenuItem
from .serializers import MenuCategorySerializer, MenuItemSerializer

class MenuCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MenuCategorySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        store_id = self.request.query_params.get('store_id')
        if store_id:
            return MenuCategory.objects.filter(store_id=store_id).order_by('order')
        return MenuCategory.objects.none()

class MenuItemViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MenuItemSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        store_id = self.request.query_params.get('store_id')
        if store_id:
            return MenuItem.objects.filter(store_id=store_id, is_available=True)
        return MenuItem.objects.none()
from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import RetailCategory, RetailProduct
from .serializers import RetailCategorySerializer, RetailProductSerializer

class RetailCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = RetailCategorySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        store_id = self.request.query_params.get('store_id')
        if store_id:
            return RetailCategory.objects.filter(store_id=store_id)
        return RetailCategory.objects.none()

class RetailProductViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = RetailProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        store_id = self.request.query_params.get('store_id')
        if store_id:
            return RetailProduct.objects.filter(store_id=store_id, is_active=True)
        return RetailProduct.objects.none()
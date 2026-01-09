from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from .models import Store, Product
from .serializers import StoreSerializer, ProductSerializer

class StoreViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows Stores to be viewed.
    We look up stores by 'slug' (e.g., /api/stores/addis-gadgets/)
    """
    queryset = Store.objects.filter(is_active=True)
    serializer_class = StoreSerializer
    lookup_field = 'slug' 

class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.filter(is_available=True)
    serializer_class = ProductSerializer
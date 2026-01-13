from rest_framework import serializers
from .models import Store, Product

# 1. Product Serializer (Kept as is, assuming Product model has description)
class ProductSerializer(serializers.ModelSerializer):
    store_slug = serializers.CharField(source='store.slug', read_only=True)
    store_name = serializers.CharField(source='store.name', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'stock', 
            'is_available', 'image', 'created_at', 
            'store', 'store_slug', 'store_name' 
        ]
        read_only_fields = ['store'] 

# 2. Store Serializer (FIXED: Removed 'description', 'logo', 'banner')
class StoreSerializer(serializers.ModelSerializer):
    # This fetches all products related to this store
    products = ProductSerializer(many=True, read_only=True)

    class Meta:
        model = Store
        fields = [
            'id', 'name', 'slug', 'created_at', 'owner', 'products', 
            'primary_color', 'category', 'is_active'
        ]
        # Removed 'description', 'logo', 'banner' from fields above ^
        
        read_only_fields = ['owner', 'slug', 'products']
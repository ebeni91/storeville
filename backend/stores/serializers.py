from rest_framework import serializers
from .models import Store, Product

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

class StoreSerializer(serializers.ModelSerializer):
    products = ProductSerializer(many=True, read_only=True)
    
    # 📍 New: Distance field (calculated on the fly)
    distance = serializers.FloatField(read_only=True, required=False)

    class Meta:
        model = Store
        fields = [
            'id', 'name', 'slug', 'category', 'primary_color', 
            'latitude', 'longitude', 'address', 'distance', # 👈 Added location fields
            'products', 'owner', 'created_at', 'is_active'
        ]
        read_only_fields = ['owner', 'slug', 'products', 'distance']
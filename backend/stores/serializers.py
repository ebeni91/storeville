from rest_framework import serializers
from .models import Store, Product

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'stock', 'is_available']

class StoreSerializer(serializers.ModelSerializer):
    # We include products so we can see what's inside a store easily
    products = ProductSerializer(many=True, read_only=True)

    class Meta:
        model = Store
        fields = ['id', 'name', 'slug', 'category', 'primary_color', 'products']
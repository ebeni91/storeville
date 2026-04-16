from rest_framework import serializers
from .models import RetailCategory, RetailProduct

class RetailCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = RetailCategory
        fields = ['id', 'name', 'slug']

class RetailProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    store_id = serializers.UUIDField(source='store.id', read_only=True)
    store_name = serializers.CharField(source='store.name', read_only=True)
    store_slug = serializers.CharField(source='store.slug', read_only=True)
    
    class Meta:
        model = RetailProduct
        fields = ['id', 'name', 'description', 'price', 'image', 'sku', 'stock_quantity', 'category', 'category_name', 'is_active', 'store_id', 'store_name', 'store_slug']

    def validate_sku(self, value):
        if value == "":
            return None
        return value

from .models import RetailFavorite

class RetailFavoriteSerializer(serializers.ModelSerializer):
    product_details = RetailProductSerializer(source='product', read_only=True)
    
    class Meta:
        model = RetailFavorite
        fields = ['id', 'product', 'product_details', 'created_at']
        read_only_fields = ['id', 'created_at']
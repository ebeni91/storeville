from rest_framework import serializers
from .models import RetailCategory, RetailProduct

class RetailCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = RetailCategory
        fields = ['id', 'name', 'slug']

class RetailProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = RetailProduct
        fields = ['id', 'name', 'description', 'price', 'image', 'sku', 'stock_quantity', 'category', 'category_name', 'is_active']
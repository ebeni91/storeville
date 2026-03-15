from rest_framework import serializers
from .models import Product, Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        # We exclude 'store' because the view will auto-assign it securely
        fields = ['id', 'name', 'slug']
        read_only_fields = ['id', 'slug']

class ProductSerializer(serializers.ModelSerializer):
    # Allows the frontend to send { "category_id": "uuid-here" }
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), 
        source='category', 
        required=False, 
        allow_null=True
    )
    
    # We send the category name back for the frontend table to display beautifully
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'stock', 
            'image', 'is_active', 'category_id', 'category_name', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
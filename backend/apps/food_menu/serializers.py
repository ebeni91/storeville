from rest_framework import serializers
from .models import MenuCategory, MenuItem

class MenuCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuCategory
        fields = ['id', 'name', 'order']

class MenuItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = MenuItem
        fields = ['id', 'name', 'description', 'price', 'image', 'preparation_time_minutes', 
                  'is_vegetarian', 'is_vegan', 'is_spicy', 'category', 'category_name', 'is_available']
from rest_framework import serializers
from .models import MenuCategory, MenuItem

class MenuCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuCategory
        fields = ['id', 'name', 'order']

class MenuItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    store_id = serializers.UUIDField(source='store.id', read_only=True)
    store_name = serializers.CharField(source='store.name', read_only=True)
    store_slug = serializers.CharField(source='store.slug', read_only=True)
    
    class Meta:
        model = MenuItem
        fields = ['id', 'name', 'description', 'price', 'image', 'preparation_time_minutes', 
                  'is_vegetarian', 'is_vegan', 'is_spicy', 'category', 'category_name', 'is_available', 'store_id', 'store_name', 'store_slug']

from .models import FoodFavorite

class FoodFavoriteSerializer(serializers.ModelSerializer):
    menu_item_details = MenuItemSerializer(source='menu_item', read_only=True)
    
    class Meta:
        model = FoodFavorite
        fields = ['id', 'menu_item', 'menu_item_details', 'created_at']
        read_only_fields = ['id', 'created_at']
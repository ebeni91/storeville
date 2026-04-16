from rest_framework import serializers
from .models import MenuCategory, MenuItem, MenuItemOption, MenuItemExtra, FoodFavorite


class MenuCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuCategory
        fields = ['id', 'name', 'order']


class MenuItemOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItemOption
        fields = ['id', 'name', 'choices', 'is_required']


class MenuItemExtraSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItemExtra
        fields = ['id', 'name', 'price']


class MenuItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    store_id = serializers.UUIDField(source='store.id', read_only=True)
    store_name = serializers.CharField(source='store.name', read_only=True)
    store_slug = serializers.CharField(source='store.slug', read_only=True)
    # Nested read-only option/extra sets
    options = MenuItemOptionSerializer(many=True, read_only=True)
    extras = MenuItemExtraSerializer(many=True, read_only=True)

    class Meta:
        model = MenuItem
        fields = [
            'id', 'name', 'description', 'price', 'image',
            'preparation_time_minutes', 'is_vegetarian', 'is_vegan', 'is_spicy',
            'category', 'category_name', 'is_available',
            'store_id', 'store_name', 'store_slug',
            'options', 'extras',
        ]


class FoodFavoriteSerializer(serializers.ModelSerializer):
    menu_item_details = MenuItemSerializer(source='menu_item', read_only=True)

    class Meta:
        model = FoodFavorite
        fields = ['id', 'menu_item', 'menu_item_details', 'created_at']
        read_only_fields = ['id', 'created_at']
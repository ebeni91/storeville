from rest_framework import serializers
from .models import Store

class StoreDiscoverySerializer(serializers.ModelSerializer):
    distance = serializers.FloatField(read_only=True) 

    class Meta:
        model = Store
        # Includes the premium visual fields so the public store page can render them
        fields = [
            'id', 'name', 'slug', 'category', 'description', 'logo', 'banner', 
            'latitude', 'longitude', 'distance', 'theme', 'primary_color', 
            'secondary_color', 'background_color', 'heading_font', 'body_font',
            'header_layout', 'card_style', 'announcement_is_active', 
            'announcement_text', 'announcement_color', 'social_instagram', 
            'social_tiktok', 'social_facebook', 'social_twitter'
        ]

class StoreManagementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Store
        fields = '__all__'
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at']
from rest_framework import serializers
from .models import Store, StoreTheme

class StoreThemeMixin(serializers.Serializer):
    """
    Mixin to flatten the StoreTheme fields onto the StoreSerializer,
    keeping the API backwards-compatible so the frontend doesn't break.
    """
    theme = serializers.CharField(source='theme_config.theme', required=False, allow_blank=True)
    primary_color = serializers.CharField(source='theme_config.primary_color', required=False, allow_blank=True)
    secondary_color = serializers.CharField(source='theme_config.secondary_color', required=False, allow_blank=True)
    background_color = serializers.CharField(source='theme_config.background_color', required=False, allow_blank=True)
    
    heading_font = serializers.CharField(source='theme_config.heading_font', required=False, allow_blank=True)
    body_font = serializers.CharField(source='theme_config.body_font', required=False, allow_blank=True)
    header_layout = serializers.CharField(source='theme_config.header_layout', required=False, allow_blank=True)
    card_style = serializers.CharField(source='theme_config.card_style', required=False, allow_blank=True)
    
    working_days = serializers.JSONField(source='theme_config.working_days', required=False)
    opening_time = serializers.TimeField(source='theme_config.opening_time', required=False, allow_null=True)
    closing_time = serializers.TimeField(source='theme_config.closing_time', required=False, allow_null=True)
    delivery_hours = serializers.CharField(source='theme_config.delivery_hours', required=False, allow_blank=True)
    is_open = serializers.SerializerMethodField()

    def get_is_open(self, obj):
        return obj.is_open
    
    announcement_is_active = serializers.BooleanField(source='theme_config.announcement_is_active', required=False)
    announcement_text = serializers.CharField(source='theme_config.announcement_text', required=False, allow_blank=True)
    announcement_color = serializers.CharField(source='theme_config.announcement_color', required=False, allow_blank=True)
    
    social_instagram = serializers.URLField(source='theme_config.social_instagram', required=False, allow_blank=True)
    social_tiktok = serializers.URLField(source='theme_config.social_tiktok', required=False, allow_blank=True)
    social_facebook = serializers.URLField(source='theme_config.social_facebook', required=False, allow_blank=True)
    social_twitter = serializers.URLField(source='theme_config.social_twitter', required=False, allow_blank=True)

    def update(self, instance, validated_data):
        # Extract theme data
        theme_data = validated_data.pop('theme_config', {})
        
        # Update core Store instance
        instance = super().update(instance, validated_data)
        
        # Update nested StoreTheme
        if theme_data:
            theme_config = instance.theme_config
            for attr, value in theme_data.items():
                setattr(theme_config, attr, value)
            theme_config.save()
            
        return instance

    def create(self, validated_data):
        theme_data = validated_data.pop('theme_config', {})
        instance = super().create(validated_data)
        
        if theme_data:
            theme_config = instance.theme_config
            for attr, value in theme_data.items():
                setattr(theme_config, attr, value)
            theme_config.save()
            
        return instance


class StoreDiscoverySerializer(StoreThemeMixin, serializers.ModelSerializer):
    class Meta:
        model = Store
        fields = [
            # Identity
            'id', 'name', 'slug', 'store_type', 'category', 'description',
            # Media & Location
            'logo', 'banner', 'latitude', 'longitude', 'city',
            # Theme (needed by storefront renderer)
            'theme', 'primary_color', 'secondary_color', 'background_color',
            'heading_font', 'body_font', 'header_layout', 'card_style',
            # Storefront features
            'announcement_is_active', 'announcement_text', 'announcement_color',
            'social_instagram', 'social_tiktok', 'social_facebook', 'social_twitter',
            'working_days', 'opening_time', 'closing_time', 'delivery_hours', 'is_open',
        ]


class StoreManagementSerializer(StoreThemeMixin, serializers.ModelSerializer):
    class Meta:
        model = Store
        fields = [
            # Identity
            'id', 'name', 'slug', 'store_type', 'category', 'description',
            # Ownership
            'owner',
            # Media & Location
            'logo', 'banner', 'latitude', 'longitude', 'city',
            # Subscription
            'subscription_plan', 'subscription_status',
            # Status
            'is_active',
            # Theme
            'theme', 'primary_color', 'secondary_color', 'background_color',
            'heading_font', 'body_font', 'header_layout', 'card_style',
            # Business info
            'working_days', 'opening_time', 'closing_time', 'delivery_hours',
            'announcement_is_active', 'announcement_text', 'announcement_color',
            # Social
            'social_instagram', 'social_tiktok', 'social_facebook', 'social_twitter',
            # Timestamps
            'created_at', 'updated_at',
            # Computed
            'is_open',
        ]
        read_only_fields = ['id', 'owner', 'slug', 'created_at', 'updated_at', 'is_open']
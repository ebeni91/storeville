from rest_framework import serializers
from .models import Store
class StoreDiscoverySerializer(serializers.ModelSerializer):
    distance = serializers.FloatField(read_only=True) # Populated by our LocationService

    class Meta:
        model = Store
        fields = ['id', 'name', 'slug', 'category', 'logo', 'latitude', 'longitude', 'distance']



class StoreManagementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Store
        fields = '__all__'
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at']

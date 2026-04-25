from rest_framework import serializers
from .models import Driver, Delivery
from apps.orders.serializers import OrderSerializer

class DriverLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Driver
        fields = ['current_latitude', 'current_longitude', 'is_available']

class DeliverySerializer(serializers.ModelSerializer):

    order_detail = OrderSerializer(source='order', read_only=True)
    driver_name = serializers.CharField(source='driver.user.get_full_name', read_only=True)
    driver_phone = serializers.CharField(source='driver.user.phone_number', read_only=True)

    class Meta:
        model = Delivery
        fields = [
            'id', 'tracking_code', 'status', 'pickup_latitude', 'pickup_longitude',
            'driver', 'driver_name', 'driver_phone', 'order_detail', 'delivered_at'
        ]
        read_only_fields = ['id', 'tracking_code', 'pickup_latitude', 'pickup_longitude', 'driver']
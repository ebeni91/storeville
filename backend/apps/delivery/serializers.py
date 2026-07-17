from rest_framework import serializers
from .models import DriverProfile, Delivery

class DriverLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = DriverProfile
        fields = ['current_latitude', 'current_longitude', 'is_available']

class DeliverySerializer(serializers.ModelSerializer):

    order_detail = serializers.SerializerMethodField()
    driver_name = serializers.CharField(source='driver.user.get_full_name', read_only=True)
    driver_phone = serializers.CharField(source='driver.user.phone_number', read_only=True)

    def get_order_detail(self, obj):
        order = obj.order
        if not order:
            return None
        return {
            'id': order.id,
            'total_price': order.total_price,
            'status': order.status,
            'delivery_method': order.delivery_method
        }

    class Meta:
        model = Delivery
        fields = [
            'id', 'tracking_code', 'status', 'pickup_latitude', 'pickup_longitude',
            'driver', 'driver_name', 'driver_phone', 'order_detail', 'delivered_at'
        ]
        read_only_fields = ['id', 'tracking_code', 'pickup_latitude', 'pickup_longitude', 'driver']
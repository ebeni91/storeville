from rest_framework import serializers
from django.db import transaction
from .models import FoodOrder, FoodOrderItem
from apps.food_menu.models import MenuItem

class FoodOrderItemSerializer(serializers.ModelSerializer):
    menu_item_id = serializers.UUIDField(write_only=True)
    menu_item_name = serializers.CharField(source='menu_item.name', read_only=True)

    class Meta:
        model = FoodOrderItem
        fields = ['id', 'menu_item_id', 'menu_item_name', 'quantity', 'price_at_time', 'special_requests']
        read_only_fields = ['price_at_time']

class FoodOrderSerializer(serializers.ModelSerializer):
    items = FoodOrderItemSerializer(many=True)

    class Meta:
        model = FoodOrder
        fields = ['id', 'store', 'status', 'total_amount', 'delivery_address', 'delivery_instructions', 'is_asap', 'scheduled_time', 'delivery_fee', 'created_at', 'items']
        read_only_fields = ['status', 'total_amount', 'delivery_fee']

    def validate_scheduled_time(self, value):
        """
        ✅ FIX (Issue #11): Reject scheduled delivery times that are in the past.
        A food order scheduled for the past creates impossible delivery windows.
        """
        if value is not None:
            from django.utils import timezone
            if value < timezone.now():
                raise serializers.ValidationError(
                    "Scheduled delivery time must be in the future."
                )
        return value

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        customer = self.context['request'].user

        # ✅ DATA INTEGRITY FIX (mirrors RetailOrderSerializer):
        # Resolve all menu items in a single query before creating the order.
        # This ensures the order is never written to the DB with total_amount=0.
        menu_item_ids = [item['menu_item_id'] for item in items_data]
        menu_items = {
            m.id: m
            for m in MenuItem.objects.filter(id__in=menu_item_ids)
        }

        # Validate all items exist and compute total before touching the DB.
        total = 0
        resolved_items = []
        for item_data in items_data:
            menu_item = menu_items.get(item_data['menu_item_id'])
            if not menu_item:
                raise serializers.ValidationError(
                    f"Menu item {item_data['menu_item_id']} not found."
                )
            quantity = item_data['quantity']
            total += menu_item.price * quantity
            resolved_items.append((menu_item, quantity, item_data.get('special_requests', '')))

        # Create order with correct total in a single atomic write — no 0-price orphan risk.
        order = FoodOrder.objects.create(
            customer=customer,
            total_amount=total,
            **validated_data
        )

        for menu_item, quantity, special_requests in resolved_items:
            FoodOrderItem.objects.create(
                order=order,
                menu_item=menu_item,
                quantity=quantity,
                price_at_time=menu_item.price,
                special_requests=special_requests
            )

        return order
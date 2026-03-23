from rest_framework import serializers
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

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        customer = self.context['request'].user
        
        total = 0
        order = FoodOrder.objects.create(customer=customer, **validated_data)
        
        for item_data in items_data:
            menu_item = MenuItem.objects.get(id=item_data['menu_item_id'])
            quantity = item_data['quantity']
            price = menu_item.price
            total += price * quantity
            
            FoodOrderItem.objects.create(
                order=order,
                menu_item=menu_item,
                quantity=quantity,
                price_at_time=price,
                special_requests=item_data.get('special_requests', '')
            )
        
        order.total_amount = total
        order.save()
        return order
from rest_framework import serializers
from .models import RetailOrder, RetailOrderItem
from apps.retail_catalog.models import RetailProduct

class RetailOrderItemSerializer(serializers.ModelSerializer):
    product_id = serializers.UUIDField(write_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = RetailOrderItem
        fields = ['id', 'product_id', 'product_name', 'quantity', 'price_at_time']
        read_only_fields = ['price_at_time']

class RetailOrderSerializer(serializers.ModelSerializer):
    items = RetailOrderItemSerializer(many=True)

    class Meta:
        model = RetailOrder
        fields = ['id', 'store', 'status', 'total_amount', 'shipping_address', 'tracking_number', 'shipping_fee', 'created_at', 'items']
        read_only_fields = ['status', 'total_amount', 'tracking_number', 'shipping_fee']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        customer = self.context['request'].user
        
        total = 0
        order = RetailOrder.objects.create(customer=customer, **validated_data)
        
        for item_data in items_data:
            product = RetailProduct.objects.get(id=item_data['product_id'])
            quantity = item_data['quantity']
            price = product.price
            total += price * quantity
            
            # Create the order line item
            RetailOrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                price_at_time=price
            )
            
            # 🌟 Deduct from inventory stock
            if product.stock_quantity >= quantity:
                product.stock_quantity -= quantity
                product.save()
            else:
                raise serializers.ValidationError(f"Not enough stock for {product.name}")
        
        order.total_amount = total
        order.save()
        return order
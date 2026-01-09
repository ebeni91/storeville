from rest_framework import serializers
from .models import Order, OrderItem
from stores.models import Product

class OrderItemSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField() # We receive ID, not the object

    class Meta:
        model = OrderItem
        fields = ['product_id', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = ['id', 'store', 'buyer_name', 'buyer_phone', 'total_amount', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        # 1. Create the Order
        order = Order.objects.create(**validated_data)

        # 2. Create the Items
        for item in items_data:
            product_id = item['product_id']
            # Security: Ensure price matches DB, don't trust frontend price!
            product = Product.objects.get(id=product_id) 
            
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item['quantity'],
                price=product.price # Use server price
            )

        return order
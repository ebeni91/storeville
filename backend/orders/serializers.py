from rest_framework import serializers
from django.db import transaction # <--- NEW IMPORT
from .models import Order, OrderItem
from stores.models import Product

class OrderItemSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField()

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
        
        # 🔒 ATOMIC TRANSACTION: Do everything or nothing.
        # This prevents "half-finished" orders if an error occurs mid-way.
        with transaction.atomic():
            order = Order.objects.create(**validated_data)

            for item in items_data:
                product = Product.objects.get(id=item['product_id'])
                qty = item['quantity']

                # 1. Check Stock Logic
                if product.stock < qty:
                    raise serializers.ValidationError(
                        f"Stock Error: Only {product.stock} units of '{product.name}' are left."
                    )

                # 2. Deduct Stock
                product.stock -= qty
                product.save() # Update the database

                # 3. Create Item Record
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=qty,
                    price=product.price
                )

        return order
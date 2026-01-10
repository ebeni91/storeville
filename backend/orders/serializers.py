from rest_framework import serializers
from django.db import transaction
from .models import Order, OrderItem
from stores.models import Product

class OrderItemSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField()

    class Meta:
        model = OrderItem
        fields = ['product_id', 'quantity', 'price']
        read_only_fields = ['price'] # Price is fetched from DB, not user input

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    
    # 👇 Store & Total are auto-calculated (read-only)
    store = serializers.PrimaryKeyRelatedField(read_only=True)
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    # 👇 Buyer Info is OPTIONAL (required=False) so we can accept it from Frontend OR auto-fill it
    buyer_name = serializers.CharField(required=False)
    buyer_phone = serializers.CharField(required=False)

    class Meta:
        model = Order
        fields = ['id', 'store', 'buyer_name', 'buyer_phone', 'total_amount', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        if not items_data:
            raise serializers.ValidationError("Order must have at least one item.")

        # 🔍 1. Infer Store from the first product
        first_product_id = items_data[0]['product_id']
        try:
            first_product = Product.objects.get(id=first_product_id)
            store = first_product.store
        except Product.DoesNotExist:
            raise serializers.ValidationError("Product not found.")

        # 👤 2. Determine Buyer Info
        # 👇 FIX: Use .pop() to REMOVE these from validated_data so they aren't passed twice
        buyer_name_input = validated_data.pop('buyer_name', None)
        buyer_phone = validated_data.pop('buyer_phone', 'N/A')
        
        # Remove shipping_address if it exists (since it's not in the Order model yet)
        # If you added a shipping_address field to your model, you can keep it.
        validated_data.pop('shipping_address', None) 

        request = self.context.get('request')
        
        # Logic: Use input name > Logged in user > Guest
        if buyer_name_input:
            buyer_name = buyer_name_input
        elif request and request.user.is_authenticated:
            buyer_name = request.user.username
        else:
            buyer_name = "Guest"

        # 🔒 ATOMIC TRANSACTION
        with transaction.atomic():
            order = Order.objects.create(
                store=store,
                buyer_name=buyer_name,
                buyer_phone=buyer_phone,
                total_amount=0,
                **validated_data # Now this is safe because we popped the colliding keys
            )

            calculated_total = 0

            for item in items_data:
                try:
                    product = Product.objects.get(id=item['product_id'])
                except Product.DoesNotExist:
                    raise serializers.ValidationError(f"Product {item['product_id']} does not exist.")

                qty = item['quantity']

                if product.store != store:
                    raise serializers.ValidationError("All items must be from the same store.")

                if product.stock < qty:
                    raise serializers.ValidationError(
                        f"Stock Error: Only {product.stock} units of '{product.name}' are left."
                    )

                product.stock -= qty
                product.save()

                line_total = product.price * qty
                calculated_total += line_total

                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=qty,
                    price=product.price
                )

            order.total_amount = calculated_total
            order.save()

        return order
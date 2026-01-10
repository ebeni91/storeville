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
    
    # 👇 Set these to read_only so the frontend doesn't need to send them
    store = serializers.PrimaryKeyRelatedField(read_only=True)
    buyer_name = serializers.CharField(read_only=True)
    buyer_phone = serializers.CharField(read_only=True)
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'store', 'buyer_name', 'buyer_phone', 'total_amount', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        if not items_data:
            raise serializers.ValidationError("Order must have at least one item.")

        # 🔍 1. Infer Store from the first product
        # (We assume all items in a cart belong to the same store for now)
        first_product_id = items_data[0]['product_id']
        try:
            first_product = Product.objects.get(id=first_product_id)
            store = first_product.store
        except Product.DoesNotExist:
            raise serializers.ValidationError("Product not found.")

        # 👤 2. Get Buyer Info from Logged-in User
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            buyer_name = request.user.username
            # If you had a UserProfile model, you'd pull the phone number here
            buyer_phone = getattr(request.user, 'phone', 'N/A') 
        else:
            buyer_name = "Guest"
            buyer_phone = "N/A"

        # 🔒 ATOMIC TRANSACTION
        with transaction.atomic():
            # Create Order (Total starts at 0, we calculate it below)
            order = Order.objects.create(
                store=store,
                buyer_name=buyer_name,
                buyer_phone=buyer_phone,
                total_amount=0,
                **validated_data
            )

            calculated_total = 0

            for item in items_data:
                try:
                    product = Product.objects.get(id=item['product_id'])
                except Product.DoesNotExist:
                    raise serializers.ValidationError(f"Product {item['product_id']} does not exist.")

                qty = item['quantity']

                # Safety: Ensure all items belong to the same store
                if product.store != store:
                    raise serializers.ValidationError("All items must be from the same store.")

                # 3. Check Stock
                if product.stock < qty:
                    raise serializers.ValidationError(
                        f"Stock Error: Only {product.stock} units of '{product.name}' are left."
                    )

                # 4. Deduct Stock
                product.stock -= qty
                product.save()

                # 5. Add to Total (Using strict database price, not frontend price)
                line_total = product.price * qty
                calculated_total += line_total

                # Create Item Record
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=qty,
                    price=product.price
                )

            # 6. Save Final Total
            order.total_amount = calculated_total
            order.save()

        return order
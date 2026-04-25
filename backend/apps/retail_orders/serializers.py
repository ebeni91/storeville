from rest_framework import serializers
from django.db import transaction
from django.db.models import F
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

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        customer = self.context['request'].user

        # ✅ SECURITY FIX: Resolve and lock all products BEFORE creating the order.
        # Using select_for_update() acquires a row-level lock in Postgres, preventing
        # two concurrent transactions from both passing the stock check for the same unit.
        product_ids = [item['product_id'] for item in items_data]
        products = {
            p.id: p
            for p in RetailProduct.objects.select_for_update().filter(id__in=product_ids)
        }

        # ✅ DATA INTEGRITY FIX: Compute the total before creating the order record.
        # This prevents an order from ever existing in the DB with total_amount=0.
        total = 0
        resolved_items = []
        for item_data in items_data:
            product = products.get(item_data['product_id'])
            if not product:
                raise serializers.ValidationError(f"Product {item_data['product_id']} not found.")
            quantity = item_data['quantity']
            if product.stock_quantity < quantity:
                raise serializers.ValidationError(f"Not enough stock for '{product.name}'.")
            total += product.price * quantity
            resolved_items.append((product, quantity))

        # Now create the order with the correct total in a single write.
        order = RetailOrder.objects.create(
            customer=customer,
            total_amount=total,
            **validated_data
        )

        # Create order items and deduct stock atomically using F() expressions.
        # F() generates a SQL UPDATE that runs on the DB server — no Python read needed.
        for product, quantity in resolved_items:
            RetailOrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                price_at_time=product.price
            )
            # ✅ RACE CONDITION FIX: DB-level atomic decrement — immune to concurrent orders.
            RetailProduct.objects.filter(pk=product.pk).update(
                stock_quantity=F('stock_quantity') - quantity
            )

        return order
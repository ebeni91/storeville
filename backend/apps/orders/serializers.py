from rest_framework import serializers
from .models import Cart, CartItem, Order, OrderItem
from apps.products.serializers import ProductSerializer

class CartItemSerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source='product', read_only=True)
    product_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'product_id', 'product_detail', 'quantity']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'store', 'items', 'total_price', 'created_at']

    def get_total_price(self, obj):
        # Calculate cart total on the fly
        return sum(item.product.price * item.quantity for item in obj.items.all())

class CheckoutSerializer(serializers.Serializer):
    """
    Write-only serializer used strictly to validate checkout input.
    """
    delivery_method = serializers.ChoiceField(choices=Order.DeliveryMethod.choices)
    delivery_address = serializers.CharField(required=False, allow_blank=True)

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product_name', 'quantity', 'price_at_checkout']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    store_name = serializers.CharField(source='store.name', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'store_name', 'status', 'payment_status', 
            'delivery_method', 'delivery_address', 'total_price', 
            'items', 'created_at'
        ]
        read_only_fields = ['id', 'total_price', 'created_at', 'payment_status']
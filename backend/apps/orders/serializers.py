from rest_framework import serializers
from .models import Cart, CartItem, Order, OrderItem

class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)
    product_image = serializers.ImageField(source='product.image', read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_name', 'product_price', 'product_image', 'quantity']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'store', 'items', 'total_price']

    def get_total_price(self, obj):
        return sum(item.product.price * item.quantity for item in obj.items.all())

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'product_name', 'price', 'quantity']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    store_name = serializers.CharField(source='store.name', read_only=True)
    customer_email = serializers.EmailField(source='customer.email', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'store', 'store_name', 'customer', 'customer_email',
            'delivery_method', 'payment_method', 'status',
            'customer_name', 'contact_phone', 'delivery_address',
            'delivery_latitude', 'delivery_longitude',
            'total_amount', 'created_at', 'updated_at', 'items'
        ]
        read_only_fields = ['id', 'customer', 'total_amount', 'status', 'created_at', 'updated_at']

class CheckoutSerializer(serializers.Serializer):
    store_id = serializers.UUIDField()
    customer_name = serializers.CharField(max_length=100)
    contact_phone = serializers.CharField(max_length=20)
    delivery_address = serializers.CharField(required=False, allow_blank=True)
    
    # 🌟 NEW: Match the exact fields from our updated Order model
    delivery_method = serializers.ChoiceField(choices=Order.DELIVERY_CHOICES)
    payment_method = serializers.ChoiceField(choices=Order.PAYMENT_CHOICES)
    
    # 🌟 NEW: GPS Coordinates for the Map App
    delivery_latitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, allow_null=True)
    delivery_longitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, allow_null=True)
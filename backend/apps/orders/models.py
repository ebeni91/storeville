import uuid
from django.db import models
from django.conf import settings
from apps.stores.models import Store
from apps.products.models import Product

class Cart(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='carts')
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='active_carts')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # A user can only have one active cart per store
        unique_together = ('user', 'store')

class CartItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        CONFIRMED = 'CONFIRMED', 'Confirmed'
        PREPARING = 'PREPARING', 'Preparing'
        READY = 'READY', 'Ready for Pickup/Delivery'
        OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY', 'Out for Delivery'
        DELIVERED = 'DELIVERED', 'Delivered'
        CANCELLED = 'CANCELLED', 'Cancelled'

    class DeliveryMethod(models.TextChoices):
        # Food / Cafe Options
        DELIVERY_ASAP = 'DELIVERY_ASAP', 'Delivery (ASAP)'
        PICKUP = 'PICKUP', 'Store Pickup'
        # Retail Options
        STANDARD_DELIVERY = 'STANDARD_DELIVERY', 'Standard Delivery'
        EXPRESS_COURIER = 'EXPRESS_COURIER', 'Express Courier'

    class PaymentStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        PAID = 'PAID', 'Paid'
        FAILED = 'FAILED', 'Failed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='orders')
    store = models.ForeignKey(Store, on_delete=models.PROTECT, related_name='orders')
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    payment_status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    delivery_method = models.CharField(max_length=20, choices=DeliveryMethod.choices)
    
    # Store address as simple text for now; we will normalize this in the delivery phase
    delivery_address = models.TextField(null=True, blank=True)
    
    total_price = models.DecimalField(max_digits=11, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)

class OrderItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField()
    # SNAPSHOT: The exact price paid at the time of checkout
    price_at_checkout = models.DecimalField(max_digits=11, decimal_places=2)
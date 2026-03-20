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
    DELIVERY_CHOICES = [
        ('ASAP_DELIVERY', 'ASAP Delivery (Food)'),
        ('PICKUP_FOOD', 'Pick Up In-Store (Food)'),
        ('STANDARD_DELIVERY', 'Standard Local Delivery'),
        ('EXPRESS_COURIER', 'Express Courier (2 Hours)'),
        ('STORE_PICKUP_RETAIL', 'Store Pickup (Retail)'),
    ]

    PAYMENT_CHOICES = [
        ('COD', 'Cash on Delivery'),
        ('TELEBIRR', 'Telebirr'),
    ]

    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('ACCEPTED', 'Accepted by Seller'),
        ('PREPARING', 'Preparing / Packing'),
        ('ON_THE_WAY', 'Out for Delivery'),
        ('READY_FOR_PICKUP', 'Ready for Pickup'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='orders')
    
    # 🌟 FIX: Use settings.AUTH_USER_MODEL instead of User
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    
    delivery_method = models.CharField(max_length=30, choices=DELIVERY_CHOICES, default='STANDARD_DELIVERY')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES, default='COD')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')

    customer_name = models.CharField(max_length=100, default="Guest")
    contact_phone = models.CharField(max_length=20, default="0000000000")
    delivery_address = models.TextField(blank=True, null=True, help_text="Written address or directions")
    delivery_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    delivery_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order {self.id} - {self.store.name}"

class OrderItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product_name = models.CharField(max_length=255, default="Unknown Product")
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.quantity}x {self.product_name}"
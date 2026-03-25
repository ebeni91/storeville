from django.db import models
from django.contrib.auth import get_user_model
from apps.stores.models import Store
from apps.retail_catalog.models import RetailProduct
import uuid

User = get_user_model()

class RetailOrder(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending Payment'
        PROCESSING = 'PROCESSING', 'Processing Order'
        SHIPPED = 'SHIPPED', 'Shipped'
        DELIVERED = 'DELIVERED', 'Delivered'
        CANCELLED = 'CANCELLED', 'Cancelled'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='retail_orders')
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='retail_orders')
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Retail Specifics
    shipping_address = models.TextField()
    tracking_number = models.CharField(max_length=100, blank=True, null=True)
    shipping_fee = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Retail Order {self.id} - {self.store.name}"

class RetailOrderItem(models.Model):
    order = models.ForeignKey(RetailOrder, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(RetailProduct, on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField(default=1)
    price_at_time = models.DecimalField(max_digits=10, decimal_places=2) # Snapshot of price when ordered

    def __str__(self):
        return f"{self.quantity}x {self.product.name if self.product else 'Deleted Product'}"

# ==========================================
# NEW MODELS FOR LAZY AUTHENTICATION CARTS
# ==========================================

class Cart(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='retail_carts')
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='carts')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # A user can only have one active cart per store at a time
        unique_together = ('user', 'store')

    def __str__(self):
        return f"Cart for {self.user.email} at {self.store.name}"

class CartItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(RetailProduct, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Prevent duplicate rows for the same product in the same cart
        unique_together = ('cart', 'product')

    def __str__(self):
        return f"{self.quantity}x {self.product.name} in Cart {self.cart.id}"
from django.db import models
from django.contrib.auth import get_user_model
from apps.stores.models import Store
from apps.food_menu.models import MenuItem
import uuid

User = get_user_model()

class FoodOrder(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending Payment'
        ACCEPTED = 'ACCEPTED', 'Restaurant Accepted'
        COOKING = 'COOKING', 'In Kitchen'
        READY = 'READY', 'Ready for Pickup/Driver'
        OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY', 'Out for Delivery'
        DELIVERED = 'DELIVERED', 'Delivered'
        CANCELLED = 'CANCELLED', 'Cancelled'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='food_orders')
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='food_orders')
    
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.PENDING)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Food Specifics
    delivery_address = models.TextField() 
    delivery_instructions = models.TextField(blank=True, help_text="e.g., Leave at door, ring bell")
    is_asap = models.BooleanField(default=True)
    scheduled_time = models.DateTimeField(null=True, blank=True)
    delivery_fee = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Food Order {self.id} - {self.store.name}"

class FoodOrderItem(models.Model):
    order = models.ForeignKey(FoodOrder, on_delete=models.CASCADE, related_name='items')
    menu_item = models.ForeignKey(MenuItem, on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField(default=1)
    price_at_time = models.DecimalField(max_digits=10, decimal_places=2)
    special_requests = models.TextField(blank=True, help_text="e.g., No onions, extra spicy")

    def __str__(self):
        return f"{self.quantity}x {self.menu_item.name if self.menu_item else 'Deleted Item'}"
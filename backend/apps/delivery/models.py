from django.db import models
from django.contrib.auth import get_user_model
from apps.retail_orders.models import RetailOrder
from apps.food_orders.models import FoodOrder
import uuid

User = get_user_model()

class DriverProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='driver_profile')
    current_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    current_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    is_available = models.BooleanField(default=False)

    def __str__(self):
        return f"Driver: {self.user.username}"
class Delivery(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending Assignment'
        PICKED_UP = 'PICKED_UP', 'Picked Up by Driver'
        IN_TRANSIT = 'IN_TRANSIT', 'In Transit'
        DELIVERED = 'DELIVERED', 'Delivered'
        FAILED = 'FAILED', 'Failed Delivery'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
 
    retail_order = models.ForeignKey(RetailOrder, on_delete=models.CASCADE, related_name='deliveries', null=True, blank=True)
    food_order = models.ForeignKey(FoodOrder, on_delete=models.CASCADE, related_name='deliveries', null=True, blank=True)
    
    driver = models.ForeignKey(DriverProfile, on_delete=models.SET_NULL, null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    tracking_code = models.CharField(max_length=50, unique=True, null=True, blank=True)
    tracking_notes = models.TextField(blank=True)
    pickup_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    pickup_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    delivered_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    @property
    def order(self):
        return self.retail_order or self.food_order

    def __str__(self):
        return f"Delivery {self.id} - {self.status}"
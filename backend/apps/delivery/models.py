from django.db import models
from django.contrib.auth import get_user_model
from apps.retail_orders.models import RetailOrder
from apps.food_orders.models import FoodOrder
import uuid

User = get_user_model()

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
    
    driver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, limit_choices_to={'role': 'DRIVER'})
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    tracking_notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    @property
    def order(self):
        return self.retail_order or self.food_order

    def __str__(self):
        return f"Delivery {self.id} - {self.status}"
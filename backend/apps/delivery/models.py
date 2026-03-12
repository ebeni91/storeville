import uuid
from django.db import models
from django.conf import settings
from apps.orders.models import Order

class Driver(models.Model):
    class VehicleType(models.TextChoices):
        BICYCLE = 'BICYCLE', 'Bicycle'
        MOTORCYCLE = 'MOTORCYCLE', 'Motorcycle'
        CAR = 'CAR', 'Car'
        VAN = 'VAN', 'Van'

    # Tied to the custom User model (role=DRIVER)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='driver_profile')
    
    vehicle_type = models.CharField(max_length=20, choices=VehicleType.choices, default=VehicleType.MOTORCYCLE)
    license_plate = models.CharField(max_length=20, null=True, blank=True)
    
    # Real-time availability and tracking
    is_available = models.BooleanField(default=False)
    current_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    current_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    last_location_update = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.get_vehicle_type_display()})"


class Delivery(models.Model):
    class Status(models.TextChoices):
        SEARCHING = 'SEARCHING', 'Searching for Driver'
        ASSIGNED = 'ASSIGNED', 'Driver Assigned'
        ARRIVED_AT_STORE = 'ARRIVED_AT_STORE', 'Arrived at Store'
        PICKED_UP = 'PICKED_UP', 'Picked Up'
        ON_THE_WAY = 'ON_THE_WAY', 'On The Way'
        DELIVERED = 'DELIVERED', 'Delivered'
        FAILED = 'FAILED', 'Delivery Failed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='delivery')
    driver = models.ForeignKey(Driver, on_delete=models.SET_NULL, null=True, blank=True, related_name='deliveries')
    
    # Snapshot of locations at time of assignment to prevent route corruption if store moves
    pickup_latitude = models.DecimalField(max_digits=9, decimal_places=6)
    pickup_longitude = models.DecimalField(max_digits=9, decimal_places=6)
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SEARCHING)
    tracking_code = models.CharField(max_length=12, unique=True, editable=False)
    
    # Proof of delivery
    delivery_photo = models.ImageField(upload_to='deliveries/proof/', null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Auto-generate a readable 12-character tracking code if it doesn't exist
        if not self.tracking_code:
            self.tracking_code = uuid.uuid4().hex[:12].upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Delivery {self.tracking_code} - {self.status}"
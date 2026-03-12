import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        SUPER_ADMIN = 'SUPER_ADMIN', 'Super Admin'
        ADMIN = 'ADMIN', 'Admin'
        SELLER = 'SELLER', 'Seller'
        CUSTOMER = 'CUSTOMER', 'Customer'
        DRIVER = 'DRIVER', 'Driver'
    
    # Security: UUIDs prevent ID enumeration (attackers guessing user IDs)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # RBAC Core
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CUSTOMER)
    
    # Ethiopian Market specifics (OTP login support)
    phone_number = models.CharField(max_length=20, unique=True, null=True, blank=True)
    is_phone_verified = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
import uuid
from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model
User = get_user_model()
class Store(models.Model):
    # Security: UUIDs prevent competitors from scraping sequential store IDs
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Ownership: Tied securely to the custom user model
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.PROTECT, 
        related_name='stores',
        limit_choices_to={'role': 'SELLER'}
    )
    
    # Core Details
    name = models.CharField(max_length=255)
    # db_index=True is CRITICAL here because the middleware queries this on every request
    slug = models.SlugField(max_length=255, unique=True, db_index=True)
    category = models.CharField(max_length=100) # e.g., Electronics, Cafes
    description = models.TextField(blank=True)
    
    # Media
    logo = models.ImageField(upload_to='stores/logos/', null=True, blank=True)
    banner = models.ImageField(upload_to='stores/banners/', null=True, blank=True)
    
    # Location Discovery (For the Uber Eats / Google Maps style interface)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    city = models.CharField(max_length=100, default='Addis Ababa')
    
    # Store Customization Engine
    is_active = models.BooleanField(default=True)
    theme = models.CharField(max_length=50, default='modern-retail')
    primary_color = models.CharField(max_length=7, default='#2563EB') # Hex code
    
    # Audit timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.slug})"
    
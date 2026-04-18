import uuid
from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils.text import slugify

User = get_user_model()

class Store(models.Model):
    STORE_TYPE_CHOICES = [
        ('RETAIL', 'Retail Shop (Fashion, Tech, etc.)'),
        ('FOOD', 'Food & Coffee (Cafes, Restaurants)'),
    ]
    store_type = models.CharField(
        max_length=20, 
        choices=STORE_TYPE_CHOICES, 
        default='RETAIL',
        help_text="Determines which map gateway this store appears on."
    )
    # Security & Ownership
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.PROTECT, 
        related_name='stores',
        limit_choices_to={'role': 'SELLER'}
    )
    
    # Core Details
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, db_index=True)
    category = models.CharField(max_length=100) 
    description = models.TextField(blank=True)
    
    # Media & Location
    logo = models.ImageField(upload_to='stores/logos/', null=True, blank=True)
    banner = models.ImageField(upload_to='stores/banners/', null=True, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    city = models.CharField(max_length=100, default='Addis Ababa')
    
    # Subscriptions & Billing
    SUBSCRIPTION_CHOICES = [
        ('STARTER', 'Starter (Free Trial)'),
        ('PRO', 'Pro'),
        ('ELITE', 'Elite'),
    ]
    subscription_plan = models.CharField(max_length=20, choices=SUBSCRIPTION_CHOICES, default='STARTER')
    
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('PAST_DUE', 'Past Due'),
        ('CANCELED', 'Canceled'),
    ]
    subscription_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')

    
    # ==========================================
    # 🎨 PREMIUM STORE CUSTOMIZATION ENGINE
    # ==========================================
    is_active = models.BooleanField(default=True)
    theme = models.CharField(max_length=50, default='modern') # modern, minimal, bold
    
    # Colors
    primary_color = models.CharField(max_length=7, default='#4F46E5') # Indigo
    secondary_color = models.CharField(max_length=7, default='#111827') # Dark Gray
    background_color = models.CharField(max_length=7, default='#F9FAFB') # Light Gray (for the whole store)
    
    # Typography
    heading_font = models.CharField(max_length=50, default='Inter') 
    body_font = models.CharField(max_length=50, default='Inter')
    
    # Layout Preferences
    header_layout = models.CharField(max_length=50, default='logo-left') # logo-left, logo-center
    card_style = models.CharField(max_length=50, default='rounded-shadow') # sharp, rounded, rounded-shadow
    
    # Business Hours
    working_days = models.CharField(max_length=100, blank=True, default='', help_text="e.g. Monday – Saturday")
    delivery_hours = models.CharField(max_length=100, blank=True, default='', help_text="e.g. 09:00 – 22:00")

    # Marketing: Announcement Bar
    announcement_is_active = models.BooleanField(default=False)
    announcement_text = models.CharField(max_length=255, blank=True)
    announcement_color = models.CharField(max_length=7, default='#000000')
    
    # Social Links
    social_instagram = models.URLField(max_length=255, blank=True)
    social_tiktok = models.URLField(max_length=255, blank=True)
    social_facebook = models.URLField(max_length=255, blank=True)
    social_twitter = models.URLField(max_length=255, blank=True)

    # Audit timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            # Generate slug from name
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            # Ensure uniqueness
            while Store.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.slug})"
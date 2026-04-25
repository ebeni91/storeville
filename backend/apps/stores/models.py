import uuid
from django.db import models, IntegrityError, transaction
from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from django.core.exceptions import ValidationError
from django.core.validators import (
    MinValueValidator, MaxValueValidator, validate_image_file_extension
)

User = get_user_model()


def _validate_image_size(value):
    """Rejects images over 5MB to prevent storage abuse and slow uploads."""
    limit_mb = 5
    if value.size > limit_mb * 1024 * 1024:
        raise ValidationError(f'Image file too large. Maximum size is {limit_mb}MB.')

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
    logo = models.ImageField(
        upload_to='stores/logos/', null=True, blank=True,
        validators=[validate_image_file_extension, _validate_image_size]
    )
    banner = models.ImageField(
        upload_to='stores/banners/', null=True, blank=True,
        validators=[validate_image_file_extension, _validate_image_size]
    )
    latitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True,
        # ✅ FIX (Issue #28): Enforce valid coordinate range
        validators=[MinValueValidator(-90), MaxValueValidator(90)]
    )
    longitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True,
        validators=[MinValueValidator(-180), MaxValueValidator(180)]
    )
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

    is_active = models.BooleanField(default=True)
    # Audit timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def is_open(self) -> bool:
        """Compute open/closed from the StoreTheme opening/closing time fields."""
        try:
            theme = self.theme_config
            if not theme.opening_time or not theme.closing_time or not theme.working_days:
                return False
            from django.utils import timezone
            now = timezone.localtime(timezone.now())
            day_abbr = now.strftime('%a')  # 'Mon', 'Tue', ...
            if day_abbr not in theme.working_days:
                return False
            t = now.time()
            if theme.closing_time < theme.opening_time:  # overnight
                return t >= theme.opening_time or t <= theme.closing_time
            return theme.opening_time <= t <= theme.closing_time
        except Exception:
            return False



    def save(self, *args, **kwargs):
        if not self.slug:
            # ✅ FIX (Issue #11): Replaced the race-condition while-loop with a
            # transaction.atomic() + IntegrityError retry pattern.
            # The old loop could allow two concurrent processes to both read
            # slug='my-store' as available before either writes it.
            base_slug = slugify(self.name)
            for counter in range(1, 100):
                slug = base_slug if counter == 1 else f"{base_slug}-{counter}"
                try:
                    with transaction.atomic():
                        self.slug = slug
                        super().save(*args, **kwargs)
                    return
                except IntegrityError:
                    # Another process took this slug — try the next counter
                    continue
            raise ValueError(f"Could not generate a unique slug for store name '{self.name}' after 100 attempts.")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.slug})"


class StoreTheme(models.Model):
    """
    Extracted UI and customization fields to keep the core Store table lean
    and avoid massive payloads on map discovery endpoints.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    store = models.OneToOneField(Store, on_delete=models.CASCADE, related_name='theme_config')

    theme = models.CharField(max_length=50, default='modern') # modern, minimal, bold
    
    # Colors
    primary_color = models.CharField(max_length=7, default='#4F46E5') # Indigo
    secondary_color = models.CharField(max_length=7, default='#111827') # Dark Gray
    background_color = models.CharField(max_length=7, default='#F9FAFB') # Light Gray
    
    # Typography
    heading_font = models.CharField(max_length=50, default='Inter') 
    body_font = models.CharField(max_length=50, default='Inter')
    
    # Layout Preferences
    header_layout = models.CharField(max_length=50, default='logo-left') # logo-left, logo-center
    card_style = models.CharField(max_length=50, default='rounded-shadow') # sharp, rounded, rounded-shadow
    
    # Business Hours
    # working_days: JSON list of 3-letter day abbreviations e.g. ["Mon","Tue","Fri"]
    working_days = models.JSONField(default=list, blank=True)
    opening_time = models.TimeField(null=True, blank=True)
    closing_time = models.TimeField(null=True, blank=True)
    # Human-readable summary for display in the storefront hero
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

    def __str__(self):
        return f"{self.store.name} Theme"

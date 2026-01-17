from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify

class Store(models.Model):
    CATEGORY_CHOICES = (
        ('electronics', 'Electronics'),
        ('fashion', 'Fashion'),
        ('food', 'Groceries'),
        ('home', 'Home & Garden'),
        ('art', 'Art & Crafts'),
    )

    # Link store to a generic User (Seller)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='stores')
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    
    # 📍 LOCATION FIELDS (New)
    address = models.CharField(max_length=255, blank=True, help_text="e.g. Bole, near Friendship Mall")
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    
    # Branding
    primary_color = models.CharField(max_length=7, default="#000000")
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Product(models.Model):
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(default=0)
    image = models.ImageField(upload_to='product_images/', null=True, blank=True)

    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.store.name})"
from django.db import models
from apps.stores.models import Store
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

class RetailCategory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='retail_categories')
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100)

    class Meta:
        verbose_name_plural = 'Retail Categories'
        # ✅ FIX (Issue #27): Prevent duplicate slugs within the same store.
        # Two categories in different stores can share a slug, but not within one store.
        unique_together = ('store', 'slug')

    def __str__(self):
        return f"{self.store.name} - {self.name}"

class RetailProduct(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='retail_products')
    category = models.ForeignKey(RetailCategory, on_delete=models.SET_NULL, null=True, related_name='products')
    
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='retail_catalog/images/', null=True, blank=True)
    
    # Retail-Specific Fields
    sku = models.CharField(max_length=100, blank=True, null=True, unique=True)
    stock_quantity = models.PositiveIntegerField(default=0)
    weight_kg = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # ✅ FIX (Issue #26): Composite index for the most common query pattern:
        # "get all active products for store X" (used in storefront & seller dashboard).
        indexes = [
            models.Index(fields=['store', 'is_active'], name='retail_prod_store_active_idx'),
        ]

    def __str__(self):
        return self.name

class RetailFavorite(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='retail_favorites')
    product = models.ForeignKey(RetailProduct, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product')

    def __str__(self):
        return f"{self.user.email} -> {self.product.name}"
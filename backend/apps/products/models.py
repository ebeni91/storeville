import uuid
from django.db import models
from apps.stores.models import Store

class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100)

    class Meta:
        unique_together = ('store', 'slug') # A store can only have one 'shoes' category

    def __str__(self):
        return f"{self.name} - {self.store.name}"

class Product(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # SECURITY: Products must be intrinsically tied to a store
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='products')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    # DecimalField is mandatory for financial precision. Max 999,999,999.99 ETB.
    price = models.DecimalField(max_digits=11, decimal_places=2) 
    
    image = models.ImageField(upload_to='products/images/', null=True, blank=True)
    stock = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
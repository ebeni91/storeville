import uuid
from django.db import models

class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # Safely link to the Store model in the 'stores' app
    store = models.ForeignKey('stores.Store', on_delete=models.CASCADE, related_name='categories')
    
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100)

    class Meta:
        unique_together = ('store', 'slug') # A store can only have one 'shoes' category
        verbose_name_plural = 'Categories' # Fixes spelling in Django Admin

    def __str__(self):
        return f"{self.name} - {self.store.name}"


class Product(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    store = models.ForeignKey('stores.Store', on_delete=models.CASCADE, related_name='products')
    
    # Link to the Category. SET_NULL means if a category is deleted, the product stays but category becomes null
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    
    image = models.ImageField(upload_to='products/images/', null=True, blank=True) 
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.store.name}"
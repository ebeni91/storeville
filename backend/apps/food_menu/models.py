
from django.db import models
from apps.stores.models import Store
import uuid

class MenuCategory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='menu_categories')
    name = models.CharField(max_length=100)
    order = models.PositiveIntegerField(default=0, help_text="Order in which category appears on the menu")

    class Meta:
        verbose_name_plural = 'Menu Categories'
        ordering = ['order']

    def __str__(self):
        return f"{self.store.name} - {self.name}"

class MenuItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='menu_items')
    category = models.ForeignKey(MenuCategory, on_delete=models.SET_NULL, null=True, related_name='items')
    
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='food_menu/images/', null=True, blank=True)
    
    # Food-Specific Fields
    preparation_time_minutes = models.PositiveIntegerField(default=15, help_text="Estimated prep time")
    is_vegetarian = models.BooleanField(default=False)
    is_vegan = models.BooleanField(default=False)
    is_spicy = models.BooleanField(default=False)
    
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
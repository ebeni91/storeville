from django.db import models
from apps.stores.models import Store
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

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
    
    preparation_time_minutes = models.PositiveIntegerField(default=15, help_text="Estimated prep time")
    is_vegetarian = models.BooleanField(default=False)
    is_vegan = models.BooleanField(default=False)
    is_spicy = models.BooleanField(default=False)
    
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
      
        indexes = [
            models.Index(fields=['store', 'is_available'], name='menu_item_store_available_idx'),
        ]

    def __str__(self):
        return self.name


class MenuItemOption(models.Model):
    """Represents a variant group for a menu item, e.g. 'Size' with choices ['Small', 'Medium', 'Large']."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE, related_name='options')
    name = models.CharField(max_length=100, help_text="e.g. Size, Crust Type")
    choices = models.JSONField(default=list, help_text="List of choice strings, e.g. ['Small', 'Medium', 'Large']")
    is_required = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.menu_item.name} — {self.name}"


class MenuItemExtra(models.Model):
    """Represents an optional add-on for a menu item, e.g. 'Extra Cheese' at +Br 15."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE, related_name='extras')
    name = models.CharField(max_length=100, help_text="e.g. Extra Cheese, Avocado")
    price = models.DecimalField(max_digits=8, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.menu_item.name} — {self.name} (+Br {self.price})"



class FoodFavorite(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='food_favorites')
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'menu_item')

    def __str__(self):
        return f"{self.user.email} -> {self.menu_item.name}"
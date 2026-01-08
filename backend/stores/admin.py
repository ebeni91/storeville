from django.contrib import admin
from .models import Store, Product

@admin.register(Store)
class StoreAdmin(admin.site.ModelAdmin):
    list_display = ('name', 'slug', 'owner', 'category', 'is_active')
    prepopulated_fields = {'slug': ('name',)} # Auto-fills slug as you type name

@admin.register(Product)
class ProductAdmin(admin.site.ModelAdmin):
    list_display = ('name', 'store', 'price', 'stock', 'is_available')
    list_filter = ('store', 'is_available')
from django.contrib import admin
from .models import RetailCategory, RetailProduct

@admin.register(RetailCategory)
class RetailCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'store', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name', 'store__name')
    list_filter = ('store',)

@admin.register(RetailProduct)
class RetailProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'store', 'category', 'price', 'stock_quantity', 'is_active')
    list_filter = ('is_active', 'store', 'category')
    search_fields = ('name', 'sku', 'store__name')
    list_editable = ('price', 'stock_quantity', 'is_active')
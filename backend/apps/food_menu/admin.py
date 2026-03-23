from django.contrib import admin
from .models import MenuCategory, MenuItem

@admin.register(MenuCategory)
class MenuCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'store', 'order')
    list_editable = ('order',)
    search_fields = ('name', 'store__name')
    list_filter = ('store',)

@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'store', 'category', 'price', 'preparation_time_minutes', 'is_available')
    list_filter = ('is_available', 'is_vegetarian', 'is_vegan', 'store')
    search_fields = ('name', 'store__name', 'description')
    list_editable = ('price', 'is_available', 'preparation_time_minutes')
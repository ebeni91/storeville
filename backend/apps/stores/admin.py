from django.contrib import admin
from .models import Store

@admin.register(Store)
class StoreAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'store_type', 'category', 'city', 'is_active', 'created_at')
    list_filter = ('store_type', 'is_active', 'category', 'city')
    search_fields = ('name', 'description', 'owner__username', 'owner__email')
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ('created_at', 'updated_at')
    list_editable = ('is_active',)
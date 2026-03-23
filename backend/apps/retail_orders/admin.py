from django.contrib import admin
from .models import RetailOrder, RetailOrderItem

class RetailOrderItemInline(admin.TabularInline):
    model = RetailOrderItem
    extra = 0
    readonly_fields = ('price_at_time',)

@admin.register(RetailOrder)
class RetailOrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'store', 'status', 'total_amount', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('id', 'customer__username', 'store__name', 'tracking_number')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [RetailOrderItemInline]
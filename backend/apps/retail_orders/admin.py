from django.contrib import admin
from unfold.admin import ModelAdmin, TabularInline
from unfold.decorators import display
from .models import RetailOrder, RetailOrderItem

class RetailOrderItemInline(TabularInline):
    model = RetailOrderItem
    extra = 0
    readonly_fields = ('price_at_time',)

@admin.register(RetailOrder)
class RetailOrderAdmin(ModelAdmin):
    list_display = ('id', 'customer', 'store', 'show_status', 'total_amount', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('id', 'customer__username', 'store__name', 'tracking_number')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [RetailOrderItemInline]

    @display(description="Status", label={
        "PENDING": "warning",
        "CONFIRMED": "info",
        "PREPARING": "info",
        "READY_FOR_PICKUP": "success",
        "OUT_FOR_DELIVERY": "info",
        "DELIVERED": "success",
        "CANCELLED": "danger"
    })
    def show_status(self, obj):
        return obj.status
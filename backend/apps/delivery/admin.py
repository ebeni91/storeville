from django.contrib import admin
from unfold.admin import ModelAdmin
from unfold.decorators import display
from .models import Delivery

@admin.register(Delivery)
class DeliveryAdmin(ModelAdmin):
    # Changed 'tracking_number' to 'id' and removed 'estimated_delivery_time'
    list_display = ('id', 'order', 'driver', 'show_status', 'created_at')
    list_filter = ('status', 'created_at')
    # Removed 'tracking_number' from search
    search_fields = ('id', 'order__id', 'driver__username')
    # Removed 'updated_at' since it threw an error (E035)
    readonly_fields = ('created_at',)

    @display(description="Status", label={
        "PENDING": "warning",
        "PICKED_UP": "info",
        "IN_TRANSIT": "info",
        "DELIVERED": "success",
        "FAILED": "danger"
    })
    def show_status(self, obj):
        return obj.status
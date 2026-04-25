from django.contrib import admin
from unfold.admin import ModelAdmin
from unfold.decorators import display
from .models import Delivery

@admin.register(Delivery)
class DeliveryAdmin(ModelAdmin):
   
    list_display = ('id', 'order', 'driver', 'show_status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('id', 'order__id', 'driver__username')
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
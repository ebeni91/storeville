from django.contrib import admin
from unfold.admin import ModelAdmin
from unfold.decorators import display
from .models import PaymentTransaction

@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(ModelAdmin):
    list_display = ('id', 'order', 'amount', 'provider', 'show_status', 'created_at')
    list_filter = ('status', 'provider', 'created_at')
    search_fields = ('id', 'provider_reference', 'order__id')
    readonly_fields = ('created_at', 'updated_at')

    @display(description="Status", label={
        "PENDING": "warning",
        "SUCCESS": "success",
        "FAILED": "danger"
    })
    def show_status(self, obj):
        return obj.status
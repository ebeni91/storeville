from django.contrib import admin
from .models import PaymentTransaction

@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'amount', 'provider', 'status', 'created_at')
    list_filter = ('status', 'provider', 'created_at')
    search_fields = ('id', 'provider_reference', 'order__id')
    readonly_fields = ('created_at', 'updated_at')
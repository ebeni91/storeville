from django.contrib import admin
from .models import Order, OrderItem

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
	list_display = ('order_reference', 'store', 'buyer_name', 'total_amount', 'payment_method', 'status', 'created_at')
	list_filter = ('status', 'payment_method')
	search_fields = ('order_reference', 'buyer_name', 'store__name')

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
	list_display = ('order', 'product', 'quantity', 'price')

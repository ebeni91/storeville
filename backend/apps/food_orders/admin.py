from django.contrib import admin
from unfold.admin import ModelAdmin, TabularInline
from unfold.decorators import display
from .models import FoodOrder, FoodOrderItem

class FoodOrderItemInline(TabularInline):
    model = FoodOrderItem
    extra = 0
    readonly_fields = ('price_at_time',)

@admin.register(FoodOrder)
class FoodOrderAdmin(ModelAdmin):
    list_display = ('id', 'customer', 'store', 'show_status', 'show_asap', 'total_amount', 'created_at')
    list_filter = ('status', 'is_asap', 'created_at')
    search_fields = ('id', 'customer__username', 'store__name')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [FoodOrderItemInline]

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

    @display(description="ASAP", boolean=True)
    def show_asap(self, obj):
        return obj.is_asap

from .models import Cart, CartItem

class FoodCartItemInline(TabularInline):
    model = CartItem
    extra = 0

@admin.register(Cart)
class FoodCartAdmin(ModelAdmin):
    list_display = ('id', 'user', 'store', 'updated_at')
    list_filter = ('store',)
    search_fields = ('user__username', 'store__name')
    inlines = [FoodCartItemInline]
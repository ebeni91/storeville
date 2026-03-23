from django.contrib import admin
from .models import FoodOrder, FoodOrderItem

class FoodOrderItemInline(admin.TabularInline):
    model = FoodOrderItem
    extra = 0
    readonly_fields = ('price_at_time',)

@admin.register(FoodOrder)
class FoodOrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'store', 'status', 'is_asap', 'total_amount', 'created_at')
    list_filter = ('status', 'is_asap', 'created_at')
    search_fields = ('id', 'customer__username', 'store__name')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [FoodOrderItemInline]
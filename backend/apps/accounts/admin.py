from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from unfold.admin import ModelAdmin
from unfold.decorators import display
from .models import User

@admin.register(User)
class CustomUserAdmin(ModelAdmin):
    list_display = ('username', 'email', 'show_role', 'phone_number', 'show_active', 'date_joined')
    list_filter = ('role', 'is_active', 'is_staff')
    search_fields = ('username', 'email', 'phone_number')
    ordering = ('-date_joined',)
    
    fieldsets = UserAdmin.fieldsets + (
        ('StoreVille Details', {'fields': ('role', 'phone_number')}),
    )

    @display(description="Role", label={
        "CUSTOMER": "info",
        "SELLER": "warning",
        "DRIVER": "success",
        "ADMIN": "danger"
    })
    def show_role(self, obj):
        return obj.role

    @display(description="Active", boolean=True)
    def show_active(self, obj):
        return obj.is_active

from .models import CustomerAddress, SavedPaymentMethod

@admin.register(CustomerAddress)
class CustomerAddressAdmin(ModelAdmin):
    list_display = ('user', 'title', 'contact_name', 'phone_number', 'city', 'is_primary')
    list_filter = ('is_primary', 'city')
    search_fields = ('user__username', 'contact_name', 'phone_number', 'address_line1', 'city')
    
@admin.register(SavedPaymentMethod)
class SavedPaymentMethodAdmin(ModelAdmin):
    list_display = ('user', 'provider', 'account_identifier', 'is_default')
    list_filter = ('provider', 'is_default')
    search_fields = ('user__username', 'provider', 'account_identifier')
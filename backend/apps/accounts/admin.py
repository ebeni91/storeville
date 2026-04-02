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
        "BUYER": "info",
        "SELLER": "warning",
        "DRIVER": "success",
        "ADMIN": "danger"
    })
    def show_role(self, obj):
        return obj.role

    @display(description="Active", boolean=True)
    def show_active(self, obj):
        return obj.is_active
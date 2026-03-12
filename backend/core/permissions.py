from rest_framework import permissions

class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'SUPER_ADMIN')

class IsSeller(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'SELLER')

class IsDriver(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'DRIVER')

class IsCustomer(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'CUSTOMER')

class IsStoreOwner(permissions.BasePermission):
    """
    Object-level permission to ensure a seller can only edit THEIR store,
    not another seller's store.
    """
    def has_object_permission(self, request, view, obj):
        # Assumes the object being accessed is a Store or has a .store.owner attribute
        if hasattr(obj, 'owner'):
            return obj.owner == request.user
        elif hasattr(obj, 'store'):
            return obj.store.owner == request.user
        return False
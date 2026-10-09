from rest_framework.permissions import BasePermission, SAFE_METHODS

class CardRolePermission(BasePermission):
    """Customer can manage own cards; support/read-only can only inspect their own data."""
    def has_permission(self, request, view):
        role = getattr(request.user, "role", "CUSTOMER")
        if request.method in SAFE_METHODS: return True
        return role not in ("SUPPORT", "READ_ONLY")

class TransactionRolePermission(BasePermission):
    def has_permission(self, request, view):
        return request.method in SAFE_METHODS or getattr(request.user, "role", "CUSTOMER") not in ("SUPPORT", "READ_ONLY")

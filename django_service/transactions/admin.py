from django.contrib import admin

from .models import Transaction


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ("reference", "user", "amount", "currency", "status", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("reference", "user__username")
    readonly_fields = [f.name for f in Transaction._meta.fields]

    def has_add_permission(self, request):
        return False

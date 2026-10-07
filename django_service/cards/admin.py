from django.contrib import admin

from .models import Card


@admin.register(Card)
class CardAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "brand", "masked_number", "expiry_month", "expiry_year", "credit_limit", "created_at")
    search_fields = ("user__username", "last4")
    readonly_fields = [f.name for f in Card._meta.fields if f.name != "credit_limit"]

    def has_add_permission(self, request):
        return False

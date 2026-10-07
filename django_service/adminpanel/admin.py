from django.contrib import admin

from .models import AdminLog


@admin.register(AdminLog)
class AdminLogAdmin(admin.ModelAdmin):
    list_display = ("admin", "action", "details", "created_at")
    list_filter = ("action",)

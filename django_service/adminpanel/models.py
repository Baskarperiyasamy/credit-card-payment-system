from django.conf import settings
from django.db import models


class AdminLog(models.Model):
    admin = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="admin_logs")
    action = models.CharField(max_length=50)
    details = models.CharField(max_length=255, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "admin_logs"
        ordering = ["-created_at", "-id"]

    def __str__(self):
        return f"{self.admin_id} {self.action}"

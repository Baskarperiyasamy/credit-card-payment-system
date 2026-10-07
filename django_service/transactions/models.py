import uuid

from django.conf import settings
from django.db import models


class Transaction(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        SUCCESS = "SUCCESS", "Success"
        FAILED = "FAILED", "Failed"

    reference = models.CharField(max_length=36, unique=True, default=uuid.uuid4)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="transactions")
    card = models.ForeignKey("cards.Card", on_delete=models.SET_NULL, null=True, blank=True, related_name="transactions")
    card_last4 = models.CharField(max_length=4, blank=True, default="")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default="USD")
    description = models.CharField(max_length=255, blank=True, default="")
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    failure_reason = models.CharField(max_length=255, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "transactions"
        ordering = ["-created_at", "-id"]
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["created_at"]),
            models.Index(fields=["user", "-created_at"], name="tx_user_created_idx"),
        ]

    def __str__(self):
        return f"{self.reference} {self.status}"

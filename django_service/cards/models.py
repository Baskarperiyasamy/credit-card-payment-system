from django.conf import settings
from django.db import models


class Card(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="cards")
    cardholder_name = models.CharField(max_length=100)
    brand = models.CharField(max_length=20)
    masked_number = models.CharField(max_length=25)
    last4 = models.CharField(max_length=4)
    expiry_month = models.PositiveSmallIntegerField()
    expiry_year = models.PositiveSmallIntegerField()
    credit_limit = models.DecimalField(max_digits=12, decimal_places=2, default=10000)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "cards"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.brand} {self.masked_number}"

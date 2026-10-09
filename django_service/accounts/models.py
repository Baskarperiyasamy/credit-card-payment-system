from django.contrib.auth.models import AbstractUser
from django.db import models


class Role(models.Model):
    """Named application roles; permissions are enforced by DRF permission classes."""
    name = models.CharField(max_length=24, unique=True)
    description = models.CharField(max_length=160, blank=True, default="")
    class Meta:
        db_table = "roles"
    def __str__(self): return self.name


class User(AbstractUser):
    class RoleChoices(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        SUPPORT = "SUPPORT", "Support"
        READ_ONLY = "READ_ONLY", "Read-only"
        CUSTOMER = "CUSTOMER", "Customer"
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=24, choices=RoleChoices.choices, default=RoleChoices.CUSTOMER, db_index=True)

    class Meta:
        db_table = "users"

    def __str__(self):
        return self.username

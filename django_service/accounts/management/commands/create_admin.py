import os

from django.core.management.base import BaseCommand

from accounts.models import User


class Command(BaseCommand):
    help = "Create the default admin user from environment variables (idempotent)."

    def handle(self, *args, **options):
        username = os.getenv("ADMIN_USERNAME", "admin")
        email = os.getenv("ADMIN_EMAIL", "admin@example.com")
        password = os.getenv("ADMIN_PASSWORD", "Admin@12345")
        user, created = User.objects.get_or_create(
            username=username,
            defaults={"email": email, "is_staff": True, "is_superuser": True, "role": "ADMIN"},
        )
        if created:
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f"Admin '{username}' created."))
        else:
            if user.role != "ADMIN":
                user.role = "ADMIN"; user.is_staff = True; user.save(update_fields=["role", "is_staff"])
            self.stdout.write(f"Admin '{username}' already exists.")

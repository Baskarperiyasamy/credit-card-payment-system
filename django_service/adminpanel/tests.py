import csv
import io
from datetime import date
from decimal import Decimal

from django.urls import reverse
from rest_framework.test import APITestCase

from accounts.models import User
from cards.models import Card
from transactions.models import Transaction

from .models import AdminLog


class AdminPanelTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser("root", "root@example.com", "Str0ng!Pass#42")
        self.user = User.objects.create_user("alice", "alice@example.com", "Str0ng!Pass#42")
        Card.objects.create(user=self.user, cardholder_name="Alice", brand="Visa", masked_number="**** **** **** 1111",
                            last4="1111", expiry_month=1, expiry_year=2035)
        Transaction.objects.create(user=self.user, amount="10.00", status="SUCCESS", card_last4="1111")
        Transaction.objects.create(user=self.user, amount="20.00", status="FAILED", card_last4="1111",
                                   description="=HYPERLINK(\"http://evil\")")

    def test_regular_user_is_forbidden(self):
        self.client.force_authenticate(self.user)
        for name in ("admin-users", "admin-cards", "admin-transactions", "admin-summary", "admin-logs", "admin-transactions-export"):
            self.assertEqual(self.client.get(reverse(name)).status_code, 403, name)

    def test_anonymous_is_unauthorized(self):
        self.assertEqual(self.client.get(reverse("admin-users")).status_code, 401)

    def test_admin_lists_users_cards_transactions(self):
        self.client.force_authenticate(self.admin)
        users = self.client.get(reverse("admin-users"), {"search": "alice"})
        self.assertEqual(users.data["count"], 1)
        self.assertEqual(users.data["results"][0]["card_count"], 1)
        self.assertEqual(self.client.get(reverse("admin-cards")).data["count"], 1)
        txs = self.client.get(reverse("admin-transactions"), {"status": "FAILED"})
        self.assertEqual(txs.data["count"], 1)

    def test_admin_can_deactivate_user_and_is_logged(self):
        self.client.force_authenticate(self.admin)
        res = self.client.patch(reverse("admin-user-detail", args=[self.user.id]), {"is_active": False}, format="json")
        self.assertEqual(res.status_code, 200)
        self.user.refresh_from_db()
        self.assertFalse(self.user.is_active)
        self.assertTrue(AdminLog.objects.filter(action="USER_DEACTIVATED").exists())

    def test_admin_cannot_deactivate_self(self):
        self.client.force_authenticate(self.admin)
        res = self.client.patch(reverse("admin-user-detail", args=[self.admin.id]), {"is_active": False}, format="json")
        self.assertEqual(res.status_code, 400)

    def test_daily_summary(self):
        self.client.force_authenticate(self.admin)
        res = self.client.get(reverse("admin-summary"))
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["totals"], {"users": 2, "cards": 1, "transactions": 2})
        today = res.data["daily"][0]
        self.assertEqual(today["day"], date.today())
        self.assertEqual((today["total"], today["success"], today["failed"]), (2, 1, 1))
        self.assertEqual(Decimal(str(today["success_amount"])), Decimal("10.00"))

    def test_csv_export_and_formula_neutralised(self):
        self.client.force_authenticate(self.admin)
        res = self.client.get(reverse("admin-transactions-export"))
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res["Content-Type"], "text/csv")
        rows = list(csv.reader(io.StringIO(res.content.decode())))
        self.assertEqual(rows[0][0], "id")
        self.assertEqual(len(rows), 3)
        self.assertTrue(any(r[8].startswith("'=") for r in rows[1:]))
        self.assertTrue(AdminLog.objects.filter(action="EXPORT_CSV").exists())

    def test_admin_logs_endpoint(self):
        AdminLog.objects.create(admin=self.admin, action="TEST", details="x")
        self.client.force_authenticate(self.admin)
        res = self.client.get(reverse("admin-logs"))
        self.assertEqual(res.data["results"][0]["action"], "TEST")

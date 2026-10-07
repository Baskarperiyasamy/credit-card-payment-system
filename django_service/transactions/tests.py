from datetime import datetime, timezone
from decimal import Decimal

from django.urls import reverse
from rest_framework.test import APITestCase

from accounts.models import User

from .models import Transaction


def make_tx(user, amount, status, day, **kw):
    tx = Transaction.objects.create(user=user, amount=Decimal(amount), status=status, card_last4="1111", **kw)
    Transaction.objects.filter(pk=tx.pk).update(created_at=datetime(2026, 1, day, 12, 0, tzinfo=timezone.utc))
    return tx


class TransactionHistoryTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user("alice", "alice@example.com", "Str0ng!Pass#42")
        self.other = User.objects.create_user("bob", "bob@example.com", "Str0ng!Pass#42")
        make_tx(self.user, "10.00", "SUCCESS", 1)
        make_tx(self.user, "250.50", "FAILED", 5)
        make_tx(self.user, "99.99", "SUCCESS", 10)
        make_tx(self.other, "5.00", "SUCCESS", 2)
        self.client.force_authenticate(self.user)
        self.url = reverse("transaction-list")

    def ids(self, **params):
        res = self.client.get(self.url, params)
        self.assertEqual(res.status_code, 200)
        return [Decimal(r["amount"]) for r in res.data["results"]]

    def test_requires_auth(self):
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get(self.url).status_code, 401)

    def test_lists_only_own_transactions_newest_first(self):
        self.assertEqual(self.ids(), [Decimal("99.99"), Decimal("250.50"), Decimal("10.00")])

    def test_filter_by_status(self):
        self.assertEqual(self.ids(status="failed"), [Decimal("250.50")])

    def test_filter_by_amount_range(self):
        self.assertEqual(self.ids(min_amount="50", max_amount="100"), [Decimal("99.99")])

    def test_filter_by_date_range(self):
        self.assertEqual(self.ids(date_from="2026-01-04", date_to="2026-01-06"), [Decimal("250.50")])

    def test_combined_filters(self):
        self.assertEqual(self.ids(status="SUCCESS", min_amount="20"), [Decimal("99.99")])

    def test_invalid_filters_return_400(self):
        for params in ({"date_from": "yesterday"}, {"min_amount": "abc"}, {"status": "DONE"}):
            self.assertEqual(self.client.get(self.url, params).status_code, 400)

    def test_sql_injection_attempt_is_harmless(self):
        res = self.client.get(self.url, {"status": "SUCCESS' OR '1'='1"})
        self.assertEqual(res.status_code, 400)
        self.assertEqual(Transaction.objects.count(), 4)

    def test_detail_is_scoped_to_owner(self):
        mine = Transaction.objects.filter(user=self.user).first()
        theirs = Transaction.objects.filter(user=self.other).first()
        self.assertEqual(self.client.get(reverse("transaction-detail", args=[mine.id])).status_code, 200)
        self.assertEqual(self.client.get(reverse("transaction-detail", args=[theirs.id])).status_code, 404)

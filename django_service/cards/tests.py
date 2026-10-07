from datetime import date

from django.urls import reverse
from rest_framework.test import APITestCase

from accounts.models import User

from .models import Card
from .serializers import detect_brand, luhn_valid

VISA = "4111 1111 1111 1111"


class CardManagementTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user("alice", "alice@example.com", "Str0ng!Pass#42")
        self.other = User.objects.create_user("bob", "bob@example.com", "Str0ng!Pass#42")
        self.client.force_authenticate(self.user)
        self.url = reverse("card-list")

    def payload(self, **overrides):
        data = {
            "cardholder_name": "Alice Smith",
            "card_number": VISA,
            "expiry_month": 12,
            "expiry_year": date.today().year + 2,
            "cvv": "123",
        }
        data.update(overrides)
        return data

    def test_add_card_stores_only_masked_number_and_last4(self):
        res = self.client.post(self.url, self.payload(), format="json")
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.data["last4"], "1111")
        self.assertEqual(res.data["masked_number"], "**** **** **** 1111")
        self.assertEqual(res.data["brand"], "Visa")
        self.assertNotIn("card_number", res.data)
        self.assertNotIn("cvv", res.data)
        card = Card.objects.get()
        stored = " ".join(str(getattr(card, f.name)) for f in Card._meta.fields)
        self.assertNotIn("4111111111111111", stored)
        self.assertNotIn("123 ", stored + " ")
        self.assertFalse(hasattr(card, "cvv"))
        self.assertFalse(hasattr(card, "card_number"))

    def test_rejects_invalid_luhn(self):
        res = self.client.post(self.url, self.payload(card_number="4111111111111112"), format="json")
        self.assertEqual(res.status_code, 400)
        self.assertIn("card_number", res.data)

    def test_rejects_non_numeric_and_short_numbers(self):
        for number in ("abcd efgh ijkl mnop", "4111"):
            res = self.client.post(self.url, self.payload(card_number=number), format="json")
            self.assertEqual(res.status_code, 400)

    def test_rejects_expired_card(self):
        res = self.client.post(self.url, self.payload(expiry_year=2020), format="json")
        self.assertEqual(res.status_code, 400)

    def test_rejects_bad_cvv(self):
        self.assertEqual(self.client.post(self.url, self.payload(cvv="12"), format="json").status_code, 400)
        self.assertEqual(self.client.post(self.url, self.payload(cvv="abc"), format="json").status_code, 400)
        amex = self.payload(card_number="378282246310005", cvv="123")
        self.assertEqual(self.client.post(self.url, amex, format="json").status_code, 400)

    def test_rejects_bad_cardholder_name(self):
        res = self.client.post(self.url, self.payload(cardholder_name="<script>alert(1)</script>"), format="json")
        self.assertEqual(res.status_code, 400)

    def test_list_returns_only_own_cards(self):
        self.client.post(self.url, self.payload(), format="json")
        Card.objects.create(user=self.other, cardholder_name="Bob", brand="Visa", masked_number="**** **** **** 9999",
                            last4="9999", expiry_month=1, expiry_year=2035)
        res = self.client.get(self.url)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]["last4"], "1111")

    def test_delete_own_card(self):
        card_id = self.client.post(self.url, self.payload(), format="json").data["id"]
        res = self.client.delete(reverse("card-detail", args=[card_id]))
        self.assertEqual(res.status_code, 204)
        self.assertFalse(Card.objects.exists())

    def test_cannot_delete_someone_elses_card(self):
        card = Card.objects.create(user=self.other, cardholder_name="Bob", brand="Visa", masked_number="**** **** **** 9999",
                                   last4="9999", expiry_month=1, expiry_year=2035)
        self.assertEqual(self.client.delete(reverse("card-detail", args=[card.id])).status_code, 404)
        self.assertTrue(Card.objects.filter(pk=card.pk).exists())

    def test_requires_authentication(self):
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get(self.url).status_code, 401)
        self.assertEqual(self.client.post(self.url, self.payload(), format="json").status_code, 401)

    def test_helpers(self):
        self.assertTrue(luhn_valid("4111111111111111"))
        self.assertFalse(luhn_valid("4111111111111112"))
        self.assertEqual(detect_brand("5555555555554444"), "Mastercard")
        self.assertEqual(detect_brand("378282246310005"), "Amex")
        self.assertEqual(detect_brand("6011111111111117"), "Discover")
        self.assertEqual(detect_brand("9999999999999995"), "Card")

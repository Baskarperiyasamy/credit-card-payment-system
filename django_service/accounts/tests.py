from django.core.management import call_command
from django.urls import reverse
from rest_framework.test import APITestCase

from adminpanel.models import AdminLog

from .models import User

STRONG = "Str0ng!Pass#42"


class AuthenticationTests(APITestCase):
    def register(self, **overrides):
        payload = {"username": "alice", "email": "alice@example.com", "password": STRONG}
        payload.update(overrides)
        return self.client.post(reverse("register"), payload, format="json")

    def login(self, username="alice", password=STRONG):
        return self.client.post(reverse("login"), {"username": username, "password": password}, format="json")

    def test_register_creates_user_with_hashed_password(self):
        res = self.register()
        self.assertEqual(res.status_code, 201)
        self.assertNotIn("password", res.data)
        user = User.objects.get(username="alice")
        self.assertNotEqual(user.password, STRONG)
        self.assertTrue(user.password.startswith("pbkdf2_"))
        self.assertTrue(user.check_password(STRONG))

    def test_register_rejects_weak_password(self):
        res = self.register(password="12345678")
        self.assertEqual(res.status_code, 400)
        self.assertIn("non_field_errors", res.data)

    def test_register_rejects_duplicate_email(self):
        self.register()
        res = self.register(username="bob", email="ALICE@example.com")
        self.assertEqual(res.status_code, 400)
        self.assertIn("email", res.data)

    def test_register_rejects_invalid_email(self):
        self.assertEqual(self.register(email="not-an-email").status_code, 400)

    def test_login_returns_jwt_pair(self):
        self.register()
        res = self.login()
        self.assertEqual(res.status_code, 200)
        self.assertIn("access", res.data)
        self.assertIn("refresh", res.data)
        self.assertEqual(res.data["user"]["username"], "alice")

    def test_login_with_wrong_password_fails(self):
        self.register()
        self.assertEqual(self.login(password="wrong-password").status_code, 401)

    def test_protected_route_requires_token(self):
        self.assertEqual(self.client.get(reverse("me")).status_code, 401)

    def test_protected_route_with_token(self):
        self.register()
        token = self.login().data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        res = self.client.get(reverse("me"))
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["email"], "alice@example.com")

    def test_logout_blacklists_refresh_token(self):
        self.register()
        tokens = self.login().data
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
        res = self.client.post(reverse("logout"), {"refresh": tokens["refresh"]}, format="json")
        self.assertEqual(res.status_code, 200)
        res = self.client.post(reverse("token-refresh"), {"refresh": tokens["refresh"]}, format="json")
        self.assertEqual(res.status_code, 401)

    def test_logout_requires_refresh_token(self):
        self.register()
        token = self.login().data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        self.assertEqual(self.client.post(reverse("logout"), {}, format="json").status_code, 400)
        self.assertEqual(self.client.post(reverse("logout"), {"refresh": "junk"}, format="json").status_code, 400)

    def test_logout_rejects_token_of_another_user(self):
        self.register()
        self.register(username="bob", email="bob@example.com")
        other = self.login("bob").data["refresh"]
        token = self.login("alice").data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        res = self.client.post(reverse("logout"), {"refresh": other}, format="json")
        self.assertEqual(res.status_code, 403)

    def test_admin_login_is_logged(self):
        User.objects.create_superuser("root", "root@example.com", STRONG)
        self.assertEqual(self.login("root").status_code, 200)
        self.assertTrue(AdminLog.objects.filter(action="ADMIN_LOGIN").exists())

    def test_create_admin_command_is_idempotent(self):
        call_command("create_admin")
        call_command("create_admin")
        self.assertEqual(User.objects.filter(is_staff=True, username="admin").count(), 1)

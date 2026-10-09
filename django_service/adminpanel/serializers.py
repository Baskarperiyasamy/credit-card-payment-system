from rest_framework import serializers

from accounts.models import User
from cards.models import Card

from .models import AdminLog


class AdminUserSerializer(serializers.ModelSerializer):
    card_count = serializers.IntegerField(read_only=True)
    transaction_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = ("id", "username", "email", "is_staff", "is_active", "role", "date_joined", "card_count", "transaction_count")
        read_only_fields = ("id", "username", "email", "is_staff", "date_joined", "card_count", "transaction_count")


class AdminCardSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    transaction_count = serializers.IntegerField(read_only=True)
    successful_spend = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)
    last_activity = serializers.DateTimeField(read_only=True, allow_null=True)

    class Meta:
        model = Card
        fields = ("id", "username", "cardholder_name", "brand", "masked_number", "expiry_month", "expiry_year", "credit_limit", "is_blocked", "blocked_at", "created_at", "transaction_count", "successful_spend", "last_activity")
        read_only_fields = ("id", "username", "cardholder_name", "brand", "masked_number", "expiry_month", "expiry_year", "blocked_at", "created_at", "transaction_count", "successful_spend", "last_activity")


class AdminLogSerializer(serializers.ModelSerializer):
    admin = serializers.CharField(source="admin.username", read_only=True)

    class Meta:
        model = AdminLog
        fields = ("id", "admin", "action", "details", "created_at")
        read_only_fields = fields


from transactions.models import FraudLog
class FraudLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = FraudLog
        fields = ("id", "transaction_id", "user_id", "reason", "location", "device_id", "created_at")
        read_only_fields = fields

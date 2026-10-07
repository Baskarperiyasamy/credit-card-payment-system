from rest_framework import serializers

from accounts.models import User
from cards.models import Card

from .models import AdminLog


class AdminUserSerializer(serializers.ModelSerializer):
    card_count = serializers.IntegerField(read_only=True)
    transaction_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = ("id", "username", "email", "is_staff", "is_active", "date_joined", "card_count", "transaction_count")
        read_only_fields = ("id", "username", "email", "is_staff", "date_joined", "card_count", "transaction_count")


class AdminCardSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Card
        fields = ("id", "username", "cardholder_name", "brand", "masked_number", "expiry_month", "expiry_year", "created_at")
        read_only_fields = fields


class AdminLogSerializer(serializers.ModelSerializer):
    admin = serializers.CharField(source="admin.username", read_only=True)

    class Meta:
        model = AdminLog
        fields = ("id", "admin", "action", "details", "created_at")
        read_only_fields = fields

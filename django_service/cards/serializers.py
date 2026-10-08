import re
from datetime import date

from rest_framework import serializers

from .models import Card


def luhn_valid(number):
    total = 0
    for i, ch in enumerate(reversed(number)):
        d = int(ch)
        if i % 2 == 1:
            d *= 2
            if d > 9:
                d -= 9
        total += d
    return total % 10 == 0


def detect_brand(number):
    if number.startswith("4"):
        return "Visa"
    if re.match(r"^(5[1-5]|2(2[2-9][1-9]|[3-6]\d\d|7[01]\d|720))", number):
        return "Mastercard"
    if number.startswith(("34", "37")):
        return "Amex"
    if number.startswith(("6011", "65")):
        return "Discover"
    return "Card"


class CardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = ("id", "cardholder_name", "brand", "masked_number", "last4", "expiry_month", "expiry_year", "credit_limit", "is_blocked", "created_at")
        read_only_fields = fields


class CardCreateSerializer(serializers.Serializer):
    cardholder_name = serializers.CharField(max_length=100)
    card_number = serializers.CharField(write_only=True)
    expiry_month = serializers.IntegerField(min_value=1, max_value=12)
    expiry_year = serializers.IntegerField(min_value=2000, max_value=2100)
    cvv = serializers.CharField(write_only=True)

    def validate_cardholder_name(self, value):
        value = value.strip()
        if not re.match(r"^[A-Za-z][A-Za-z .'-]*$", value):
            raise serializers.ValidationError("Enter the name as printed on the card (letters only).")
        return value

    def validate_card_number(self, value):
        digits = re.sub(r"[\s-]", "", value)
        if not digits.isdigit() or not 13 <= len(digits) <= 19:
            raise serializers.ValidationError("Card number must contain 13 to 19 digits.")
        if not luhn_valid(digits):
            raise serializers.ValidationError("Card number is not valid.")
        return digits

    def validate_cvv(self, value):
        if not value.isdigit() or len(value) not in (3, 4):
            raise serializers.ValidationError("CVV must be 3 or 4 digits.")
        return value

    def validate(self, attrs):
        today = date.today()
        if (attrs["expiry_year"], attrs["expiry_month"]) < (today.year, today.month):
            raise serializers.ValidationError({"expiry_year": "This card has expired."})
        brand = detect_brand(attrs["card_number"])
        expected = 4 if brand == "Amex" else 3
        if len(attrs["cvv"]) != expected:
            raise serializers.ValidationError({"cvv": f"{brand} cards use a {expected}-digit CVV."})
        return attrs

    def create(self, validated_data):
        number = validated_data.pop("card_number")
        validated_data.pop("cvv")  # CVV is validated and discarded, never stored
        last4 = number[-4:]
        return Card.objects.create(
            user=self.context["request"].user,
            brand=detect_brand(number),
            last4=last4,
            masked_number=f"**** **** **** {last4}",
            **validated_data,
        )

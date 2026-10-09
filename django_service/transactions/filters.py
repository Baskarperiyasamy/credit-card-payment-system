from decimal import Decimal, InvalidOperation

from django.utils.dateparse import parse_date
from rest_framework.exceptions import ValidationError

from .models import Transaction


def apply_filters(queryset, params):
    errors = {}

    for key, lookup in (("date_from", "created_at__date__gte"), ("date_to", "created_at__date__lte")):
        raw = params.get(key)
        if raw:
            parsed = parse_date(raw)
            if parsed is None:
                errors[key] = "Use the format YYYY-MM-DD."
            else:
                queryset = queryset.filter(**{lookup: parsed})

    for key, lookup in (("min_amount", "amount__gte"), ("max_amount", "amount__lte")):
        raw = params.get(key)
        if raw:
            try:
                queryset = queryset.filter(**{lookup: Decimal(raw)})
            except InvalidOperation:
                errors[key] = "Enter a valid number."

    status = params.get("status")
    if status:
        status = status.upper()
        if status not in Transaction.Status.values:
            errors["status"] = f"Choose one of: {', '.join(Transaction.Status.values)}."
        else:
            queryset = queryset.filter(status=status)

    masked = params.get("masked_card") or params.get("card_last4")
    if masked:
        digits = "".join(ch for ch in masked if ch.isdigit())[-4:]
        if digits: queryset = queryset.filter(card_last4=digits)
    search = params.get("search")
    if search:
        from django.db.models import Q
        queryset = queryset.filter(Q(reference__icontains=search) | Q(description__icontains=search) | Q(card_last4__icontains=search))
    fraud_status = params.get("fraud_status")
    if fraud_status:
        queryset = queryset.filter(fraud_status=fraud_status.upper())
    ordering = params.get("ordering", "-created_at")
    allowed = {"created_at", "-created_at", "amount", "-amount", "status", "-status"}
    if ordering not in allowed: errors["ordering"] = "Choose created_at, -created_at, amount, -amount, status, or -status."
    if errors: raise ValidationError(errors)
    return queryset.order_by(ordering, "-id")

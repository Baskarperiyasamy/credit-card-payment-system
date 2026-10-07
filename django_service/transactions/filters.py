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

    if errors:
        raise ValidationError(errors)
    return queryset

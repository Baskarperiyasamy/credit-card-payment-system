import csv
from decimal import Decimal

from django.db.models import Count, DecimalField, Q, Sum, Value, Max
from django.db.models.functions import Coalesce, TruncDate
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import generics
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from cards.models import Card
from transactions.filters import apply_filters
from transactions.models import Transaction
from transactions.serializers import TransactionSerializer

from .models import AdminLog
from .serializers import AdminCardSerializer, AdminLogSerializer, AdminUserSerializer
from notifications import card_blocked_alert


def log_action(admin, action, details=""):
    AdminLog.objects.create(admin=admin, action=action, details=details[:255])


class AdminUserList(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminUserSerializer

    def get_queryset(self):
        qs = User.objects.annotate(card_count=Count("cards", distinct=True), transaction_count=Count("transactions", distinct=True))
        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(Q(username__icontains=search) | Q(email__icontains=search))
        return qs.order_by("id")


class AdminUserDetail(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminUserSerializer
    queryset = User.objects.annotate(card_count=Count("cards", distinct=True), transaction_count=Count("transactions", distinct=True))
    http_method_names = ["get", "patch", "head", "options"]

    def perform_update(self, serializer):
        if serializer.instance.pk == self.request.user.pk and serializer.validated_data.get("is_active") is False:
            raise ValidationError({"is_active": "You cannot deactivate your own account."})
        user = serializer.save()
        state = "activated" if user.is_active else "deactivated"
        log_action(self.request.user, "USER_" + state.upper(), f"User {user.username} {state}")


class AdminCardList(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminCardSerializer

    def get_queryset(self):
        return (
            Card.objects.select_related("user")
            .annotate(
                transaction_count=Count("transactions", distinct=True),
                successful_spend=Coalesce(
                    Sum("transactions__amount", filter=Q(transactions__status=Transaction.Status.SUCCESS)),
                    Value(0, output_field=DecimalField(max_digits=14, decimal_places=2)),
                ),
                last_activity=Max("transactions__created_at"),
            )
            .order_by("-created_at")
        )



class AdminCardDetail(APIView):
    """Admin-only card controls: block/unblock and credit-limit updates."""
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        try:
            card = Card.objects.select_related("user").get(pk=pk)
        except Card.DoesNotExist:
            return Response({"detail": "Card not found."}, status=404)

        changed = []
        if "credit_limit" in request.data:
            try:
                limit = Decimal(str(request.data["credit_limit"]))
            except Exception:
                raise ValidationError({"credit_limit": "Enter a valid credit limit."})
            if limit < Decimal("100"):
                raise ValidationError({"credit_limit": "Credit limit must be at least 100."})
            if limit > Decimal("10000000"):
                raise ValidationError({"credit_limit": "Credit limit is too high."})
            card.credit_limit = limit
            changed.append(f"credit limit set to {limit}")

        if "is_blocked" in request.data:
            blocked = request.data["is_blocked"]
            if not isinstance(blocked, bool):
                raise ValidationError({"is_blocked": "is_blocked must be true or false."})
            was_blocked = card.is_blocked
            card.is_blocked = blocked
            card.blocked_at = timezone.now() if blocked else None
            changed.append("blocked" if blocked else "unblocked")
            if blocked and not was_blocked:
                card_blocked_alert(card.user, card)

        if not changed:
            raise ValidationError({"detail": "Provide is_blocked and/or credit_limit."})

        card.save(update_fields=["credit_limit", "is_blocked", "blocked_at"])
        log_action(request.user, "CARD_UPDATED", f"Card {card.id}: {', '.join(changed)}")
        return Response(AdminCardSerializer(card).data)


class AdminTransactionList(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = TransactionSerializer

    def get_queryset(self):
        return apply_filters(Transaction.objects.select_related("user"), self.request.query_params)


def _safe_cell(value):
    text = str(value)
    return "'" + text if text[:1] in ("=", "+", "-", "@") else text


class TransactionExportView(APIView):
    """Admin-only CSV export. Accepts the same filters as the transaction list."""

    permission_classes = [IsAdminUser]

    def get(self, request):
        queryset = apply_filters(Transaction.objects.select_related("user"), request.query_params)
        response = HttpResponse(content_type="text/csv")
        stamp = timezone.now().strftime("%Y%m%d_%H%M%S")
        response["Content-Disposition"] = f'attachment; filename="transactions_{stamp}.csv"'
        writer = csv.writer(response)
        writer.writerow(["id", "reference", "username", "card_last4", "amount", "currency", "status", "failure_reason", "description", "created_at"])
        for t in queryset.iterator():
            writer.writerow([
                t.id, t.reference, _safe_cell(t.user.username), t.card_last4, t.amount, t.currency,
                t.status, _safe_cell(t.failure_reason), _safe_cell(t.description), t.created_at.isoformat(),
            ])
        log_action(request.user, "EXPORT_CSV", f"Exported {queryset.count()} transactions")
        return response


class DailySummaryView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        zero = Value(0, output_field=DecimalField(max_digits=14, decimal_places=2))
        daily = (
            Transaction.objects.annotate(day=TruncDate("created_at"))
            .values("day")
            .annotate(
                total=Count("id"),
                success=Count("id", filter=Q(status=Transaction.Status.SUCCESS)),
                failed=Count("id", filter=Q(status=Transaction.Status.FAILED)),
                pending=Count("id", filter=Q(status=Transaction.Status.PENDING)),
                success_amount=Coalesce(Sum("amount", filter=Q(status=Transaction.Status.SUCCESS)), zero),
            )
            .order_by("-day")[:30]
        )
        return Response({
            "totals": {
                "users": User.objects.count(),
                "cards": Card.objects.count(),
                "transactions": Transaction.objects.count(),
            },
            "daily": list(daily),
        })


class AdminLogList(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminLogSerializer
    queryset = AdminLog.objects.select_related("admin")

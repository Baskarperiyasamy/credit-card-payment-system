import csv
from decimal import Decimal

from django.db.models import Count, DecimalField, Q, Sum, Value, Max
from django.db.models.functions import Coalesce, TruncDate, TruncMonth
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
from transactions.models import Transaction, FraudLog
from transactions.serializers import TransactionSerializer

from .models import AdminLog
from .serializers import AdminCardSerializer, AdminLogSerializer, AdminUserSerializer, FraudLogSerializer
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
        if serializer.instance.pk == self.request.user.pk and serializer.validated_data.get("role") not in (None, "ADMIN"):
            raise ValidationError({"role": "You cannot remove your own admin role."})
        previous_role = serializer.instance.role
        user = serializer.save()
        # Keep Django's staff gate aligned with the application RBAC role.
        desired_staff = user.role == "ADMIN"
        if user.is_staff != desired_staff:
            user.is_staff = desired_staff
            user.save(update_fields=["is_staff"])
        if previous_role != user.role:
            log_action(self.request.user, "USER_ROLE_CHANGED", f"User {user.username}: {previous_role} -> {user.role}")
        if "is_active" in serializer.validated_data:
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


class AnalyticsView(APIView):
    """Spending analytics for current user, or system-wide for staff."""
    def get(self, request):
        qs = Transaction.objects.filter(status=Transaction.Status.SUCCESS, user=request.user)
        monthly = list(qs.annotate(month=TruncMonth("created_at")).values("month").annotate(total=Sum("amount")).order_by("month"))
        categories = list(qs.values("category").annotate(total=Sum("amount")).order_by("-total"))
        spent_by_card = Card.objects.filter(user=request.user).annotate(spent=Coalesce(Sum("transactions__amount", filter=Q(transactions__status="SUCCESS")), Value(0, output_field=DecimalField(max_digits=14, decimal_places=2))))
        utilization = [{"card": c.masked_number, "limit": float(c.credit_limit), "spent": float(c.spent), "utilization_percent": round(float(c.spent) / float(c.credit_limit) * 100, 2) if c.credit_limit else 0} for c in spent_by_card]
        return Response({"monthly_spending": [{"month": str(x["month"]), "total": float(x["total"] or 0)} for x in monthly], "category_spending": [{"category": x["category"], "total": float(x["total"] or 0)} for x in categories], "credit_utilization": utilization})


class SystemHealthView(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request):
        from django.db import connection
        from django.db.models import Avg
        from datetime import timedelta
        start = timezone.now() - timedelta(hours=24)
        try:
            with connection.cursor() as cursor: cursor.execute("SELECT 1")
            db_status = "ok"
        except Exception: db_status = "error"
        recent = Transaction.objects.filter(created_at__gte=start)
        return Response({"status": "ok" if db_status == "ok" else "degraded", "database": db_status, "transactions_24h": recent.count(), "failed_transactions_24h": recent.filter(status="FAILED").count(), "fraud_flagged_24h": recent.exclude(fraud_status="CLEAR").count(), "generated_at": timezone.now().isoformat()})


class AnalyticsExportView(APIView):
    """CSV analytics export; use format=pdf for a printable PDF summary."""
    def get(self, request):
        qs = Transaction.objects.filter(user=request.user, status="SUCCESS")
        totals = qs.aggregate(total=Sum("amount"))["total"] or Decimal("0")
        by_category = list(qs.values("category").annotate(total=Sum("amount")).order_by("-total"))
        fmt = request.query_params.get("format", "csv").lower()
        if fmt == "pdf":
            from django.http import HttpResponse
            from reportlab.pdfgen import canvas
            from reportlab.lib.pagesizes import letter
            response = HttpResponse(content_type="application/pdf")
            response["Content-Disposition"] = 'attachment; filename="analytics-summary.pdf"'
            pdf = canvas.Canvas(response, pagesize=letter)
            pdf.setTitle("Ledgerly Analytics Summary")
            pdf.drawString(50, 750, "Ledgerly - Analytics Summary")
            pdf.drawString(50, 728, f"Account: {request.user.username}")
            pdf.drawString(50, 706, f"Successful spending: INR {totals}")
            y = 674; pdf.drawString(50, y, "Spending by category")
            for item in by_category:
                y -= 20
                if y < 60: pdf.showPage(); y = 750
                pdf.drawString(60, y, f"{str(item['category'])[:45]}: INR {item['total']}")
            pdf.save(); return response
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="analytics-summary.csv"'
        writer = csv.writer(response); writer.writerow(["summary", "value"]); writer.writerow(["successful_spend", totals]); writer.writerow([]); writer.writerow(["category", "amount"])
        for item in by_category: writer.writerow([_safe_cell(item["category"]), item["total"]])
        return response


class FraudLogList(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = FraudLogSerializer
    queryset = FraudLog.objects.all()

    def get_queryset(self):
        qs = super().get_queryset()
        user_id = self.request.query_params.get("user_id")
        return qs.filter(user_id=user_id) if user_id else qs

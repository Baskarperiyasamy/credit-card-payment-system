from decimal import Decimal
from datetime import datetime
from io import BytesIO

from django.http import FileResponse
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer

from transactions.models import Transaction


class MonthlyStatementView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        now = timezone.localtime()
        try:
            year = int(request.query_params.get("year", now.year))
            month = int(request.query_params.get("month", now.month))
        except ValueError:
            raise ValidationError({"detail": "year and month must be numbers."})
        if not 1 <= month <= 12 or not 2000 <= year <= 2100:
            raise ValidationError({"detail": "Invalid statement month."})

        tz = timezone.get_current_timezone()
        start = timezone.make_aware(datetime(year, month, 1), timezone=tz)
        end_year = year + 1 if month == 12 else year
        end_month = 1 if month == 12 else month + 1
        end = timezone.make_aware(datetime(end_year, end_month, 1), timezone=tz)
        qs = Transaction.objects.filter(user=request.user, created_at__gte=start, created_at__lt=end).select_related("card")

        success = qs.filter(status=Transaction.Status.SUCCESS)
        total = success.aggregate(total=__import__("django.db.models", fromlist=["Sum"]).Sum("amount"))["total"] or Decimal("0")
        count = qs.count()
        buf = BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=A4, rightMargin=16*mm, leftMargin=16*mm, topMargin=15*mm, bottomMargin=15*mm)
        styles = getSampleStyleSheet()
        title = ParagraphStyle("Title2", parent=styles["Title"], alignment=TA_LEFT, fontSize=20, leading=24, spaceAfter=6)
        small = ParagraphStyle("Small", parent=styles["BodyText"], fontSize=8, textColor=colors.HexColor("#64748b"))
        story = [
            Paragraph("LEDGERLY", title),
            Paragraph("Monthly Credit Card Statement", styles["Heading2"]),
            Paragraph(f"Statement period: {start.strftime('%B %Y')} &nbsp;&nbsp;|&nbsp;&nbsp; Account holder: {request.user.get_full_name() or request.user.username}", small),
            Spacer(1, 8*mm),
        ]

        summary = [
            ["SUMMARY", "VALUE"],
            ["Total successful spending", f"INR {total:,.2f}"],
            ["Transactions", str(count)],
            ["Account email", request.user.email],
        ]
        t = Table(summary, colWidths=[90*mm, 80*mm])
        t.setStyle(TableStyle([
            ("BACKGROUND",(0,0),(-1,0),colors.HexColor("#0f172a")),("TEXTCOLOR",(0,0),(-1,0),colors.white),
            ("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),("ALIGN",(1,1),(-1,-1),"RIGHT"),
            ("GRID",(0,0),(-1,-1),0.5,colors.HexColor("#e2e8f0")),("BACKGROUND",(0,1),(-1,-1),colors.HexColor("#f8fafc")),
            ("PADDING",(0,0),(-1,-1),7),
        ]))
        story += [t, Spacer(1, 8*mm), Paragraph("TRANSACTION ACTIVITY", styles["Heading3"])]

        data = [["Date", "Description", "Card", "Status", "Amount"]]
        for tx in qs.order_by("-created_at"):
            masked = tx.card.masked_number if tx.card else (f"**** **** **** {tx.card_last4}" if tx.card_last4 else "-")
            data.append([
                timezone.localtime(tx.created_at).strftime("%d %b %Y %H:%M"),
                (tx.description or "Card payment")[:32],
                masked,
                tx.get_status_display(),
                f"INR {Decimal(tx.amount):,.2f}",
            ])
        if len(data) == 1:
            data.append(["-", "No transactions for this month", "-", "-", "INR 0.00"])
        tx_table = Table(data, colWidths=[29*mm, 48*mm, 39*mm, 23*mm, 30*mm], repeatRows=1)
        tx_table.setStyle(TableStyle([
            ("BACKGROUND",(0,0),(-1,0),colors.HexColor("#0b7a75")),("TEXTCOLOR",(0,0),(-1,0),colors.white),
            ("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),("FONTSIZE",(0,0),(-1,-1),7.5),
            ("GRID",(0,0),(-1,-1),0.35,colors.HexColor("#cbd5e1")),("ROWBACKGROUNDS",(0,1),(-1,-1),[colors.white, colors.HexColor("#f8fafc")]),
            ("ALIGN",(-1,1),(-1,-1),"RIGHT"),("VALIGN",(0,0),(-1,-1),"MIDDLE"),("PADDING",(0,0),(-1,-1),5),
        ]))
        story += [tx_table, Spacer(1, 8*mm), Paragraph(
            "Security: full card numbers and CVVs are never included in statements. This document contains masked card details only.",
            small
        )]
        doc.build(story)
        buf.seek(0)
        return FileResponse(buf, as_attachment=True, filename=f"ledgerly_statement_{year}_{month:02d}.pdf", content_type="application/pdf")

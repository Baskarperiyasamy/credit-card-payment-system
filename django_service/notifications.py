import logging
import os
from decimal import Decimal

from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


def send_event_email(subject: str, message: str, recipient: str | None):
    """Send an event email. Missing recipient/SMTP configuration never breaks a payment flow."""
    if not recipient:
        logger.warning("Notification skipped: no recipient for %s", subject)
        return False
    try:
        sent = send_mail(
            subject=subject,
            message=message,
            from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@ledgerly.local"),
            recipient_list=[recipient],
            fail_silently=False,
        )
        return bool(sent)
    except Exception:
        logger.exception("Notification delivery failed for %s", subject)
        return False


def transaction_alert(user, amount, reference, card_last4, status):
    amount = Decimal(str(amount))
    if amount <= Decimal("5000"):
        return
    return send_event_email(
        "Ledgerly security alert: high-value transaction",
        f"Hello {user.get_full_name() or user.username},\n\n"
        f"A transaction of INR {amount:,.2f} was recorded on your card ending {card_last4}.\n"
        f"Status: {status}\nReference: {reference}\n\n"
        "If you do not recognize this activity, contact your card issuer immediately.",
        user.email,
    )


def credit_limit_alert(user, card, available, percentage):
    return send_event_email(
        "Ledgerly alert: available credit below 10%",
        f"Hello {user.get_full_name() or user.username},\n\n"
        f"Your card ending {card.last4} has only {percentage:.1f}% of its credit limit available "
        f"(INR {available:,.2f} remaining out of INR {card.credit_limit:,.2f}).\n\n"
        "Please review your recent transactions or contact your card issuer if this is unexpected.",
        user.email,
    )


def card_blocked_alert(user, card):
    return send_event_email(
        "Ledgerly security alert: card blocked",
        f"Hello {user.get_full_name() or user.username},\n\n"
        f"Your {card.brand} card ending {card.last4} has been blocked by an administrator.\n"
        f"Card status: BLOCKED\n\n"
        "If this action was not expected, please contact support.",
        user.email,
    )

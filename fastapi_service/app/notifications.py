import logging
import os
import smtplib
from email.message import EmailMessage
from decimal import Decimal

logger = logging.getLogger(__name__)


def send_email(to: str, subject: str, body: str) -> bool:
    host = os.getenv("SMTP_HOST", "")
    if not host or not to:
        logger.info("Notification email skipped (SMTP_HOST or recipient missing): %s", subject)
        return False
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = os.getenv("SMTP_FROM", "Ledgerly Security <no-reply@ledgerly.local>")
    msg["To"] = to
    msg.set_content(body)
    try:
        port = int(os.getenv("SMTP_PORT", "1025"))
        smtp_cls = smtplib.SMTP_SSL if os.getenv("SMTP_SSL", "0") == "1" else smtplib.SMTP
        with smtp_cls(host, port, timeout=8) as smtp:
            if os.getenv("SMTP_TLS", "0") == "1" and os.getenv("SMTP_SSL", "0") != "1":
                smtp.starttls()
            user, password = os.getenv("SMTP_USER", ""), os.getenv("SMTP_PASSWORD", "")
            if user:
                smtp.login(user, password)
            smtp.send_message(msg)
        return True
    except Exception:
        logger.exception("Notification email failed: %s", subject)
        return False


def high_value_email(email, username, amount, reference, last4, status):
    amount = Decimal(str(amount))
    if amount <= Decimal("5000"):
        return
    return send_email(
        email,
        "Ledgerly security alert: transaction above INR 5,000",
        f"Hello {username},\n\nA transaction of INR {amount:,.2f} was recorded on card ending {last4}.\n"
        f"Status: {status}\nReference: {reference}\n\nIf you do not recognize this activity, contact your card issuer.",
    )


def low_credit_email(email, username, last4, available, limit, percentage):
    return send_email(
        email,
        "Ledgerly alert: available credit below 10%",
        f"Hello {username},\n\nYour card ending {last4} has {percentage:.1f}% of its credit limit available.\n"
        f"Remaining: INR {available:,.2f} of INR {limit:,.2f}.\n\nPlease review your recent activity.",
    )

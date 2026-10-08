import random
import uuid
from decimal import Decimal
from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .database import get_db
from .models import Card, Transaction, UserEmail
from .schemas import PaymentRequest, PaymentResponse
from .security import current_user_id
from .notifications import high_value_email, low_credit_email

router = APIRouter(prefix="/api/payments", tags=["payments"])

FAILURE_REASONS = [
    "Insufficient funds",
    "Card declined by issuer",
    "Suspected fraud - transaction blocked",
    "Bank did not respond in time",
]
SUCCESS_RATE = 0.8


def utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def simulate_gateway(forced: str | None) -> tuple[str, str]:
    """Fake payment gateway. Returns (status, failure_reason). No real money moves."""
    if forced == "success":
        return "SUCCESS", ""
    if forced == "failure":
        return "FAILED", random.choice(FAILURE_REASONS)
    if random.random() < SUCCESS_RATE:
        return "SUCCESS", ""
    return "FAILED", random.choice(FAILURE_REASONS)


@router.post("/", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
def make_payment(body: PaymentRequest, user_id: int = Depends(current_user_id), db: Session = Depends(get_db)):
    card = db.scalar(select(Card).where(Card.id == body.card_id, Card.user_id == user_id))
    if card is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Card not found.")
    today = date.today()
    if (card.expiry_year, card.expiry_month) < (today.year, today.month):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "This card has expired.")
    if card.is_blocked:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "This card is blocked. Contact an administrator.")

    successful_spend = db.scalar(
        select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            Transaction.card_id == card.id,
            Transaction.status == "SUCCESS",
        )
    ) or 0
    available_credit = max(Decimal(str(card.credit_limit)) - Decimal(str(successful_spend)), Decimal("0"))
    if body.amount > available_credit:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Insufficient available credit. Remaining credit: {available_credit:.2f}.",
        )

    now = utcnow()
    tx = Transaction(
        reference=str(uuid.uuid4()),
        user_id=user_id,
        card_id=card.id,
        card_last4=card.last4,
        amount=body.amount,
        currency="INR",
        description=body.description,
        status="PENDING",
        failure_reason="",
        created_at=now,
        updated_at=now,
    )
    db.add(tx)
    db.commit()

    final_status, reason = simulate_gateway(body.simulate)
    tx.status = final_status
    tx.failure_reason = reason
    tx.updated_at = utcnow()
    db.commit()

    # Automated security notifications.
    user_row = db.execute(select(UserEmail.username, UserEmail.email).where(UserEmail.id == user_id)).first()
    if user_row:
        high_value_email(user_row.email, user_row.username, tx.amount, tx.reference, card.last4, tx.status)

    if tx.status == "SUCCESS":
        successful_spend = db.scalar(
            select(func.coalesce(func.sum(Transaction.amount), 0)).where(
                Transaction.card_id == card.id, Transaction.status == "SUCCESS"
            )
        ) or 0
        available_credit = max(Decimal(str(card.credit_limit)) - Decimal(str(successful_spend)), Decimal("0"))
        limit = Decimal(str(card.credit_limit))
        percentage = (available_credit / limit * 100) if limit else Decimal("0")
        if percentage < 10 and user_row:
            low_credit_email(user_row.email, user_row.username, card.last4, available_credit, limit, percentage)

    return tx


@router.get("/{reference}", response_model=PaymentResponse)
def get_payment(reference: str, user_id: int = Depends(current_user_id), db: Session = Depends(get_db)):
    tx = db.scalar(select(Transaction).where(Transaction.reference == reference, Transaction.user_id == user_id))
    if tx is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Payment not found.")
    return tx

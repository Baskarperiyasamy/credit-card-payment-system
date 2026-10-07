from datetime import datetime, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy import and_, case, func, select
from sqlalchemy.orm import Session

from .database import get_db
from .models import Card, Transaction
from .schemas import DashboardSummary, DashboardTransaction
from .security import current_user_id

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

CENT = Decimal("0.01")


def money(value) -> Decimal:
    return Decimal(str(value or 0)).quantize(CENT)


def month_start_utc() -> datetime:
    """First instant of the current month (UTC, naive - the same convention the payment service stores)."""
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    return now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)


@router.get(
    "/summary",
    response_model=DashboardSummary,
    summary="Quick credit card usage stats for the logged-in user",
)
def dashboard_summary(user_id: int = Depends(current_user_id), db: Session = Depends(get_db)):
    """Only SUCCESS payments count as money spent. Failed and pending payments are counted as transactions only."""
    spent = case((Transaction.status == "SUCCESS", Transaction.amount), else_=0)
    spent_this_month = case(
        (and_(Transaction.status == "SUCCESS", Transaction.created_at >= month_start_utc()), Transaction.amount),
        else_=0,
    )

    # Query 1: one pass over the user's transactions -> COUNT(*) and SUM(amount) (all time and this month).
    total_count, total_spent, month_spent = db.execute(
        select(func.count(Transaction.id), func.sum(spent), func.sum(spent_this_month)).where(
            Transaction.user_id == user_id
        )
    ).one()

    # Query 2: credit limit lives on the cards table.
    total_limit = db.scalar(select(func.sum(Card.credit_limit)).where(Card.user_id == user_id))

    # Query 3: last 5 transactions with the masked number from cards (LEFT JOIN keeps rows whose card was deleted).
    rows = db.execute(
        select(
            Transaction.amount,
            Transaction.status,
            Transaction.created_at,
            Transaction.card_last4,
            Card.masked_number,
        )
        .outerjoin(Card, Card.id == Transaction.card_id)
        .where(Transaction.user_id == user_id)
        .order_by(Transaction.created_at.desc(), Transaction.id.desc())
        .limit(5)
    ).all()

    total_spent = money(total_spent)
    available = max(money(total_limit) - total_spent, Decimal("0.00"))

    return DashboardSummary(
        total_transactions=total_count or 0,
        total_amount_spent=total_spent,
        current_month_spending=money(month_spent),
        available_credit_limit=available,
        last_5_transactions=[
            DashboardTransaction(
                amount=r.amount,
                masked_card_number=r.masked_number or (f"**** **** **** {r.card_last4}" if r.card_last4 else None),
                date=r.created_at,
                status=r.status,
            )
            for r in rows
        ],
    )

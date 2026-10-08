from datetime import datetime
from decimal import Decimal

from sqlalchemy import BigInteger, DateTime, Integer, Numeric, SmallInteger, String
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base

BigInt = BigInteger().with_variant(Integer, "sqlite")


class Card(Base):
    """Read-only mirror of the table owned by the Django service."""

    __tablename__ = "cards"

    id: Mapped[int] = mapped_column(BigInt, primary_key=True)
    user_id: Mapped[int] = mapped_column(BigInt, index=True)
    cardholder_name: Mapped[str] = mapped_column(String(100))
    brand: Mapped[str] = mapped_column(String(20))
    masked_number: Mapped[str] = mapped_column(String(25))
    last4: Mapped[str] = mapped_column(String(4))
    expiry_month: Mapped[int] = mapped_column(SmallInteger)
    expiry_year: Mapped[int] = mapped_column(SmallInteger)
    credit_limit: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("10000.00"))
    is_blocked: Mapped[bool] = mapped_column(default=False)
    blocked_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime)


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(BigInt, primary_key=True, autoincrement=True)
    reference: Mapped[str] = mapped_column(String(36), unique=True)
    user_id: Mapped[int] = mapped_column(BigInt, index=True)
    card_id: Mapped[int | None] = mapped_column(BigInt, nullable=True)
    card_last4: Mapped[str] = mapped_column(String(4), default="")
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    currency: Mapped[str] = mapped_column(String(3), default="INR")
    description: Mapped[str] = mapped_column(String(255), default="")
    status: Mapped[str] = mapped_column(String(10), default="PENDING")
    failure_reason: Mapped[str] = mapped_column(String(255), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime)
    updated_at: Mapped[datetime] = mapped_column(DateTime)


class UserEmail(Base):
    """Minimal read-only mirror of Django's users table for notification delivery."""
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(BigInt, primary_key=True)
    username: Mapped[str] = mapped_column(String(150))
    email: Mapped[str] = mapped_column(String(254))

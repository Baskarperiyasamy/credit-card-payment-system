from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from .config import MAX_PAYMENT_AMOUNT


class PaymentRequest(BaseModel):
    card_id: int = Field(gt=0, description="ID of a saved card owned by the caller")
    amount: Decimal = Field(gt=0, le=MAX_PAYMENT_AMOUNT, decimal_places=2, max_digits=12)
    description: str = Field(default="", max_length=255)
    simulate: Literal["success", "failure"] | None = Field(default=None, description="Force the simulated outcome. Random when omitted.")
    category: str = Field(default="Other", max_length=80)
    location: str = Field(default="", max_length=120)
    device_id: str = Field(default="", max_length=120)

    @field_validator("description")
    @classmethod
    def strip_description(cls, value: str) -> str:
        return value.strip()


class PaymentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    reference: str
    card_id: int | None
    card_last4: str
    amount: Decimal
    currency: str
    description: str
    status: Literal["PENDING", "SUCCESS", "FAILED"]
    failure_reason: str
    fraud_status: str = "CLEAR"
    fraud_reason: str = ""
    category: str = "Other"
    created_at: datetime
    updated_at: datetime


class DashboardTransaction(BaseModel):
    amount: Decimal
    masked_card_number: str | None
    date: datetime
    status: Literal["PENDING", "SUCCESS", "FAILED"]


class DashboardSummary(BaseModel):
    total_transactions: int
    total_amount_spent: Decimal
    current_month_spending: Decimal
    available_credit_limit: Decimal
    last_5_transactions: list[DashboardTransaction]

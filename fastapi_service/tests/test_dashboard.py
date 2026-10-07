from datetime import datetime, timedelta, timezone
from decimal import Decimal

from app.models import Card, Transaction
from tests.conftest import make_token

URL = "/dashboard/summary"


def utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)


def add_tx(db, n, amount, status="SUCCESS", user_id=1, card_id=1, last4="1111", created=None):
    created = created or utcnow()
    db.add(Transaction(reference=f"ref-{user_id}-{n}", user_id=user_id, card_id=card_id, card_last4=last4,
                       amount=Decimal(str(amount)), status=status, created_at=created, updated_at=created))
    db.commit()


def test_requires_token(client):
    res = client.get(URL)
    assert res.status_code == 401
    assert res.json()["detail"] == "Invalid or missing token."


def test_rejects_bad_tokens(client):
    for token in [make_token(secret="x" * 40), make_token(token_type="refresh"),
                  make_token(expires=timedelta(minutes=-5)), "not-a-jwt"]:
        assert client.get(URL, headers={"Authorization": f"Bearer {token}"}).status_code == 401


def test_empty_account(client, auth):
    data = client.get(URL, headers=auth).json()
    assert data == {"total_transactions": 0, "total_amount_spent": "0.00", "current_month_spending": "0.00",
                    "available_credit_limit": "0.00", "last_5_transactions": []}


def test_summary_values(client, db, card, auth):
    card.credit_limit = Decimal("1000.00")
    db.commit()
    now = utcnow()
    first_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    last_month = first_of_month - timedelta(days=3)
    add_tx(db, 1, "100.00", created=last_month)                     # success, previous month
    add_tx(db, 2, "50.25")                                          # success, this month
    add_tx(db, 3, "20.00")                                          # success, this month
    add_tx(db, 4, "999.00", status="FAILED")                        # failed: counted, not spent
    add_tx(db, 5, "5.00", status="PENDING")                         # pending: counted, not spent
    add_tx(db, 6, "777.00", user_id=2, card_id=None, last4="9999")  # another user: ignored

    data = client.get(URL, headers=auth).json()
    assert data["total_transactions"] == 5
    assert data["total_amount_spent"] == "170.25"
    assert data["current_month_spending"] == "70.25"
    assert data["available_credit_limit"] == "829.75"


def test_credit_limit_sums_cards_and_never_negative(client, db, card, auth):
    db.add(Card(id=2, user_id=1, cardholder_name="Alice", brand="Mastercard", masked_number="**** **** **** 4444",
                last4="4444", expiry_month=12, expiry_year=2099, credit_limit=Decimal("200.00"),
                created_at=datetime(2026, 1, 1)))
    db.add(Card(id=3, user_id=2, cardholder_name="Bob", brand="Visa", masked_number="**** **** **** 0000",
                last4="0000", expiry_month=12, expiry_year=2099, created_at=datetime(2026, 1, 1)))
    db.commit()
    assert client.get(URL, headers=auth).json()["available_credit_limit"] == "10200.00"  # 10000 default + 200
    add_tx(db, 1, "20000.00")
    assert client.get(URL, headers=auth).json()["available_credit_limit"] == "0.00"


def test_last_5_newest_first_with_masked_card(client, db, card, auth):
    base = utcnow() - timedelta(hours=1)
    for i in range(7):
        add_tx(db, i, i + 1, created=base + timedelta(minutes=i))
    last = client.get(URL, headers=auth).json()["last_5_transactions"]
    assert [t["amount"] for t in last] == ["7.00", "6.00", "5.00", "4.00", "3.00"]
    assert set(last[0]) == {"amount", "masked_card_number", "date", "status"}
    assert last[0]["masked_card_number"] == "**** **** **** 1111"
    assert last[0]["status"] == "SUCCESS"


def test_deleted_card_falls_back_to_last4(client, db, auth):
    add_tx(db, 1, "9.99", card_id=None, last4="4444")
    assert client.get(URL, headers=auth).json()["last_5_transactions"][0]["masked_card_number"] == "**** **** **** 4444"

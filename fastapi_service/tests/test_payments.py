from datetime import datetime, timedelta

from app.models import Card, Transaction
from app.payments import simulate_gateway
from tests.conftest import make_token

URL = "/api/payments/"


def pay(client, headers, **overrides):
    body = {"card_id": 1, "amount": "25.50", "description": "Coffee", "simulate": "success"}
    body.update(overrides)
    return client.post(URL, json=body, headers=headers)


def test_health(client):
    assert client.get("/health").json()["service"] == "fastapi"


def test_swagger_is_enabled(client):
    assert client.get("/docs").status_code == 200
    assert "/api/payments/" in client.get("/openapi.json").json()["paths"]


def test_payment_requires_token(client, card):
    assert client.post(URL, json={"card_id": 1, "amount": "5"}).status_code == 401


def test_rejects_bad_tokens(client, card):
    bad = [
        make_token(secret="x" * 40),
        make_token(token_type="refresh"),
        make_token(expires=timedelta(minutes=-5)),
        "not-a-jwt",
    ]
    for token in bad:
        res = client.post(URL, json={"card_id": 1, "amount": "5"}, headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 401


def test_successful_payment_is_persisted(client, db, card, auth):
    res = pay(client, auth)
    assert res.status_code == 201
    data = res.json()
    assert data["status"] == "SUCCESS"
    assert data["failure_reason"] == ""
    assert data["card_last4"] == "1111"
    assert data["amount"] == "25.50"
    tx = db.query(Transaction).one()
    assert tx.user_id == 1 and tx.status == "SUCCESS"


def test_failed_payment_has_reason(client, card, auth):
    data = pay(client, auth, simulate="failure").json()
    assert data["status"] == "FAILED"
    assert data["failure_reason"]


def test_transaction_starts_pending_then_finalises(client, db, card, auth, monkeypatch):
    seen = {}

    def spy(forced):
        seen["status_at_gateway"] = db.query(Transaction).one().status
        return "SUCCESS", ""

    monkeypatch.setattr("app.payments.simulate_gateway", spy)
    assert pay(client, auth, simulate=None).json()["status"] == "SUCCESS"
    assert seen["status_at_gateway"] == "PENDING"


def test_random_outcome_is_success_or_failed(client, card, auth):
    for _ in range(10):
        assert pay(client, auth, simulate=None).json()["status"] in ("SUCCESS", "FAILED")


def test_cannot_use_another_users_card(client, db, auth):
    db.add(Card(id=2, user_id=99, cardholder_name="Bob", brand="Visa", masked_number="**** **** **** 2222",
                last4="2222", expiry_month=12, expiry_year=2099, created_at=datetime(2026, 1, 1)))
    db.commit()
    assert pay(client, auth, card_id=2).status_code == 404
    assert db.query(Transaction).count() == 0


def test_unknown_card(client, auth):
    assert pay(client, auth, card_id=404).status_code == 404


def test_expired_card_rejected(client, db, card, auth):
    card.expiry_year = 2020
    db.commit()
    assert pay(client, auth).status_code == 400


def test_amount_validation(client, card, auth):
    for amount in ("0", "-5", "abc", "100000.01", "1.999"):
        assert pay(client, auth, amount=amount).status_code == 422, amount


def test_input_validation(client, card, auth):
    assert pay(client, auth, description="x" * 300).status_code == 422
    assert pay(client, auth, simulate="maybe").status_code == 422
    assert pay(client, auth, card_id=0).status_code == 422


def test_sql_injection_in_description_is_stored_as_text(client, db, card, auth):
    payload = "'; DROP TABLE transactions; --"
    assert pay(client, auth, description=payload).status_code == 201
    assert db.query(Transaction).one().description == payload


def test_get_payment_by_reference(client, card, auth):
    ref = pay(client, auth).json()["reference"]
    assert client.get(f"{URL}{ref}", headers=auth).json()["reference"] == ref
    other = {"Authorization": f"Bearer {make_token(user_id=2)}"}
    assert client.get(f"{URL}{ref}", headers=other).status_code == 404


def test_simulate_gateway_forced():
    assert simulate_gateway("success") == ("SUCCESS", "")
    status, reason = simulate_gateway("failure")
    assert status == "FAILED" and reason

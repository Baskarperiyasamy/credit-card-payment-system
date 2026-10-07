import os
from datetime import datetime, timedelta, timezone

import jwt
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

os.environ.setdefault("DATABASE_URL", "sqlite://")

from app.config import JWT_ALGORITHM, JWT_SECRET  # noqa: E402
from app.database import Base, get_db  # noqa: E402
from app.main import app  # noqa: E402
from app.models import Card  # noqa: E402


@pytest.fixture()
def db():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)()
    yield session
    session.close()


@pytest.fixture()
def client(db):
    app.dependency_overrides[get_db] = lambda: db
    yield TestClient(app)
    app.dependency_overrides.clear()


def make_token(user_id=1, token_type="access", secret=JWT_SECRET, expires=timedelta(minutes=5)):
    payload = {"user_id": user_id, "token_type": token_type, "exp": datetime.now(timezone.utc) + expires}
    return jwt.encode(payload, secret, algorithm=JWT_ALGORITHM)


@pytest.fixture()
def auth():
    return {"Authorization": f"Bearer {make_token(1)}"}


@pytest.fixture()
def card(db):
    c = Card(id=1, user_id=1, cardholder_name="Alice", brand="Visa", masked_number="**** **** **** 1111",
             last4="1111", expiry_month=12, expiry_year=2099, created_at=datetime(2026, 1, 1))
    db.add(c)
    db.commit()
    return c

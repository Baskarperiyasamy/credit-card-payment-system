import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./payments_dev.db")
JWT_SECRET = os.getenv("JWT_SECRET", "dev-shared-jwt-secret-change-me-0123456789abcdef")
JWT_ALGORITHM = "HS256"
CORS_ORIGINS = [
    o.strip()
    for o in os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")
    if o.strip()
]
MAX_PAYMENT_AMOUNT = 100000

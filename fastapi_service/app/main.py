from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import CORS_ORIGINS
from .dashboard import router as dashboard_router
from .payments import router as payments_router

app = FastAPI(
    title="Credit Card Payment System - Payment Service",
    description="Simulated payment processing. Payments start as PENDING and finish as SUCCESS or FAILED. "
    "Authenticate with the JWT access token issued by the Django login endpoint.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(payments_router)
app.include_router(dashboard_router)


@app.get("/", tags=["health"])
def home():
    return {"service": "fastapi", "status": "ok", "docs": "/docs", "health": "/health"}


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok", "service": "fastapi"}

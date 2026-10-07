import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .config import JWT_ALGORITHM, JWT_SECRET

bearer = HTTPBearer(auto_error=False)


def current_user_id(credentials: HTTPAuthorizationCredentials | None = Depends(bearer)) -> int:
    """Validate the JWT issued by the Django service and return the user id."""
    unauthorized = HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or missing token.", {"WWW-Authenticate": "Bearer"})
    if credentials is None:
        raise unauthorized
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError:
        raise unauthorized
    if payload.get("token_type") != "access" or "user_id" not in payload:
        raise unauthorized
    try:
        return int(payload["user_id"])
    except (TypeError, ValueError):
        raise unauthorized

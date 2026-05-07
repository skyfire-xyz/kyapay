import requests
import uuid
from decimal import Decimal, InvalidOperation


def get_jwks(jwks_url):
    response = requests.get(jwks_url)
    response.raise_for_status()
    return response.json()


def to_int(v):
    try:
        return int(v)
    except (TypeError, ValueError):
        return None


def to_decimal(v):
    try:
        return Decimal(str(v))
    except (InvalidOperation, TypeError, ValueError):
        return None


def is_valid_uuid(val):
    try:
        uuid.UUID(str(val))
        return True
    except Exception:
        return False

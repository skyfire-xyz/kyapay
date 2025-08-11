import requests
import validators
from jose import jwt
from jose.exceptions import JWTError
from decimal import Decimal, InvalidOperation
import uuid
import time

JWKS_URL = "https://app.skyfire.xyz/.well-known/jwks.json"
JWT_ISSUER = "https://app.skyfire.xyz"
ALGORITHMS = ["ES256"]
JWT_AUDIENCE = "<SELLER_ID>"
JWT_SPS = "<PRICE_MODEL_FOR_SELLER_SERVICE>"
JWT_SPR = "<PRICE_FOR_SELLER_SERVICE>"

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

def verifyKyaPayToken(token):
    # Fetch JWKS
    jwks = get_jwks(JWKS_URL)

    decoded_payload = None
    try:
        # Decode and verify JWT
        payload = jwt.decode(
            token,
            jwks,
            algorithms=ALGORITHMS,
            issuer=JWT_ISSUER,
            audience=JWT_AUDIENCE
        )
        protected_header = jwt.get_unverified_header(token)
        typ = protected_header.get("typ")
        if typ not in ["kya+pay+JWT"]:
            print("Invalid typ:", typ)
            return {"error": "invalid_typ", "message": "typ should be kya+pay+JWT"}
        decoded_payload = payload
    except JWTError as err:
        print("JWT verification failed:", err)
        return {"error": "invalid_token", "message": "JWT verification failed: invalid token."}

    # Validate skyfireEmail
    skyfire_email = decoded_payload.get("bid", {}).get("skyfireEmail")
    if not validators.email(skyfire_email):
        print("Invalid email format")
        return {"error": "invalid_email", "message": "Invalid email format."}

    # Validate env
    if decoded_payload.get("env") != "production":
        print("Invalid environment:", decoded_payload.get("env"))
        return {"error": "invalid_env", "message": "Token is not from production environment."}

    now = int(time.time())

    # Validate iat
    iat = decoded_payload.get("iat")
    if not isinstance(iat, int) or iat > now:
        print("Invalid iat:", iat)
        return {"error": "invalid_iat", "message": "Issued-at time is in the future or missing."}

    # Validate exp
    exp = decoded_payload.get("exp")
    if not isinstance(exp, int) or exp <= now:
        print("Token has expired:", exp)
        return {"error": "token_expired", "message": "Token has expired."}

    # Validate jti, sub
    for field in ["jti", "sub"]:
        val = decoded_payload.get(field)
        if not is_valid_uuid(val):
            print(f"Invalid {field}:", val)
            return {"error": f"invalid_{field}", "message": f"Invalid {field}: not a valid UUID."}
        
    # Validate pay related fields
    value = to_int(decoded_payload.get("value"))
    if value is None or value <= 0:
        return {"error": "invalid_value", "message": "Token value must be a positive integer."}

    amount = to_decimal(decoded_payload.get("amount"))
    if amount is None or amount <= 0:
        return {"error": "invalid_amount", "message": "Token amount must be a positive number."}

    cur = decoded_payload.get("cur")
    if cur != "USD":
        print("Invalid cur:", cur)
        return {"error": "invalid_cur", "message": "Currency should be USD."}

    if decoded_payload.get("sps") != JWT_SPS:
        print("Invalid Price Model:", decoded_payload.get("sps"))
        return {"error": "invalid_sps", "message": "Price Model does not match seller service."}

    if decoded_payload.get("spr") != JWT_SPR:
        print("Invalid Price:", decoded_payload.get("spr"))
        return {"error": "invalid_spr", "message": "Price does not match seller service."}

    # Token validation successful
    return {"success": True, "payload": decoded_payload}
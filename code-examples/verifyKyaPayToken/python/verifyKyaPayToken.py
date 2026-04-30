import requests
import validators
from jose import jwt
from jose.exceptions import JWTError
from decimal import Decimal, InvalidOperation
import uuid
import time
import json
import sys

"""
Supports production and sandbox.
Pick the JWKS URL from the expected issuer/environment.
"""
SKYFIRE_ENV = "production"
SKYFIRE_ISSUER_BY_ENV = {
    "production": "https://app.skyfire.xyz",
    "sandbox": "https://app-sandbox.skyfire.xyz",
}
JWKS_URL = f"{SKYFIRE_ISSUER_BY_ENV[SKYFIRE_ENV]}/.well-known/jwks.json"

ALGORITHM = "ES256"
EXPECTED_AUDIENCE = "<SELLER_AGENT_ID>"
EXPECTED_TOKEN_TYP = "kya-pay+jwt"

"""
Validate either service ID targeting or domain targeting.
This example uses EXPECTED_SSI, assuming this service is onboarded to Skyfire for Payments Processing.
Use EXPECTED_SDM and replace the ssi validation logic if tokens are targeted to your website/service domain instead.
"""
EXPECTED_SSI = "<SELLER_SERVICE_ID>"

"""
Payment expectations should match your seller service configuration.
"""
EXPECTED_STP = "<SETTLEMENT_TYPE>"  # e.g. "coin", "card", "bank"
EXPECTED_SPS = "<PRICE_MODEL_FOR_SELLER_SERVICE>"  # e.g. pay_per_use, subscription, pay_per_mb, custom
EXPECTED_SPR = "<PRICE_FOR_SELLER_SERVICE>"  # e.g. "0.01"

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
    # Verify the token signature.
    jwks = get_jwks(JWKS_URL)

    try:
        # Decode and verify JWT
        payload = jwt.decode(
            token,
            jwks,
            algorithms=[ALGORITHM],
            issuer=SKYFIRE_ISSUER_BY_ENV[SKYFIRE_ENV],
            audience=EXPECTED_AUDIENCE
        )
        header = jwt.get_unverified_header(token)
    except JWTError as err:
        print("JWT verification failed:", err)
        return {"success": False, "error": "invalid_token", "message": "JWT verification failed: invalid token."}

    # Validate header claims.
    # typ matches expected token type
    if header.get("typ") != EXPECTED_TOKEN_TYP:
        print("Invalid typ:", header.get("typ"))
        return {"success": False, "error": "invalid_typ", "message": f"typ should be {EXPECTED_TOKEN_TYP}"}

    # Validate payload - common claims.
    # env matches expected environment
    if payload.get("env") != SKYFIRE_ENV:
        print("Invalid environment:", payload.get("env"))
        return {"success": False, "error": "invalid_env", "message": f"env must match expected environment ({SKYFIRE_ENV})."}

    # ssi matches expected seller service ID
    if payload.get("ssi") != EXPECTED_SSI:
        print("Invalid ssi:", payload.get("ssi"))
        return {"success": False, "error": "invalid_ssi", "message": f"ssi must match expected seller service ID ({EXPECTED_SSI})."}

    now = int(time.time())

    # iat a 10-digit epoch seconds value in the past
    iat = payload.get("iat")
    if not isinstance(iat, int) or iat > now:
        print("Invalid iat:", iat)
        return {"success": False, "error": "invalid_iat", "message": "iat must be a 10-digit epoch seconds value in the past."}

    # jti is a UUID
    jti = payload.get("jti")
    if not is_valid_uuid(jti):
        print("Invalid jti:", jti)
        return {"success": False, "error": "invalid_jti", "message": "jti must be a valid UUID."}

    # aud matches expected audience
    if payload.get("aud") != EXPECTED_AUDIENCE:
        print("Invalid aud:", payload.get("aud"))
        return {"success": False, "error": "invalid_aud", "message": f"aud must match expected audience ({EXPECTED_AUDIENCE})."}

    # sub is a UUID
    sub = payload.get("sub")
    if not is_valid_uuid(sub):
        print("Invalid sub:", sub)
        return {"success": False, "error": "invalid_sub", "message": "sub must be a valid UUID."}

    # exp is a 10-digit epoch seconds value in the future
    exp = payload.get("exp")
    if not isinstance(exp, int) or exp < now:
        print("Invalid exp:", exp)
        return {"success": False, "error": "invalid_exp", "message": "exp must be a 10-digit epoch seconds value in the future."}

    # Validate the payload - kya claims.
    # This example shows basic validation (email), but you may enforce additional checks.
    # hid.email is a valid email address
    email = payload.get("hid", {}).get("email")
    if not validators.email(email):
        print("Invalid email format")
        return {"success": False, "error": "invalid_email", "message": "Invalid email format."}

    # Validate the payload - pay claims.
    # val is a positive integer
    value = to_int(payload.get("val"))
    if value is None or value <= 0:
        return {"success": False, "error": "invalid_value", "message": "val must be a positive integer."}

    # amt is a positive number
    amount = to_decimal(payload.get("amt"))
    if amount is None or amount <= 0:
        return {"success": False, "error": "invalid_amount", "message": "amt must be a positive number."}

    # cur is USD
    cur = payload.get("cur")
    if cur != "USD":
        print("Invalid cur:", cur)
        return {"success": False, "error": "invalid_cur", "message": "cur must be USD."}

    # stp matches expected settlement type
    stp = payload.get("stp")
    if stp != EXPECTED_STP:
        print("Invalid stp:", stp)
        return {"success": False, "error": "invalid_stp", "message": "stp must match expected settlement type."}

    # sti includes verified: true
    sti_verified = payload.get("sti", {}).get("verified")
    if sti_verified is not True:
        print("Invalid sti.verified:", sti_verified)
        return {"success": False, "error": "invalid_sti_verified", "message": "sti must include verified: true."}

    # spr matches expected price
    if payload.get("spr") != EXPECTED_SPR:
        print("Invalid Price:", payload.get("spr"))
        return {"success": False, "error": "invalid_spr", "message": "spr must match expected price."}

    # sps matches expected price model
    if payload.get("sps") != EXPECTED_SPS:
        print("Invalid Price Model:", payload.get("sps"))
        return {"success": False, "error": "invalid_sps", "message": "sps must match expected price model."}

    # Token validation successful
    return {"success": True, "header": header, "payload": payload}


if __name__ == "__main__":
    token = sys.argv[1] if len(sys.argv) > 1 else None
    if not token:
        print("Usage: python3 verifyKyaPayToken.py <JWT>", file=sys.stderr)
        sys.exit(1)

    result = verifyKyaPayToken(token)
    print(json.dumps(result, indent=2))
    sys.exit(0 if result.get("success") else 1)

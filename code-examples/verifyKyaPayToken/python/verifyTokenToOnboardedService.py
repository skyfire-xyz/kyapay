"""
Verify a kya-pay+jwt token targeted to a Skyfire-onboarded seller service.

Use this when your service is onboarded with Skyfire for Payments Processing.
Tokens carry ssi (seller service ID).
"""
from jose import jwt
from jose.exceptions import JWTError

from config import (
    EXPECTED_ENV,
    SKYFIRE_ISSUER_BY_ENV,
    JWKS_URL,
    ALGORITHM,
    EXPECTED_TOKEN_TYP,
    EXPECTED_AUDIENCE,
    EXPECTED_SSI,
    EXPECTED_STP,
    EXPECTED_SPS,
    EXPECTED_SPR,
)
from utils import get_jwks
from validators.common import validate_header_claims, validate_common_payload_claims
from validators.kya import validate_kya_claims
from validators.pay import validate_pay_claims


def verifyTokenToOnboardedService(token):
    jwks = get_jwks(JWKS_URL)

    try:
        payload = jwt.decode(
            token,
            jwks,
            algorithms=[ALGORITHM],
            issuer=SKYFIRE_ISSUER_BY_ENV[EXPECTED_ENV],
            audience=EXPECTED_AUDIENCE,
        )
        header = jwt.get_unverified_header(token)
    except JWTError as err:
        print("JWT verification failed:", err)
        return {"success": False, "error": "invalid_token", "message": "JWT verification failed: invalid token."}

    if error := validate_header_claims(header, EXPECTED_TOKEN_TYP):
        return error

    if error := validate_common_payload_claims(payload, EXPECTED_ENV, EXPECTED_AUDIENCE):
        return error

    # ssi matches expected seller service ID
    if payload.get("ssi") != EXPECTED_SSI:
        print("Invalid ssi:", payload.get("ssi"))
        return {"success": False, "error": "invalid_ssi", "message": f"ssi must match expected seller service ID ({EXPECTED_SSI})."}

    if error := validate_kya_claims(payload):
        return error

    if error := validate_pay_claims(payload, expected_stp=EXPECTED_STP, expected_spr=EXPECTED_SPR, expected_sps=EXPECTED_SPS):
        return error

    return {"success": True, "header": header, "payload": payload}

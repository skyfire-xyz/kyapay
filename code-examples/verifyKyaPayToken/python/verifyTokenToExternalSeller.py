"""
Verify a kya token targeted to an external seller domain.
Tokens carry sdm (seller domain).
"""
from jose import jwt
from jose.exceptions import JWTError

from config import (
    EXPECTED_ENV,
    SKYFIRE_ISSUER_BY_ENV,
    JWKS_URL,
    ALGORITHM,
    EXPECTED_AUDIENCE,
    EXPECTED_TOKEN_TYP,
    EXPECTED_SDM,
)
from utils import get_jwks
from validators.common import validate_header_claims, validate_common_payload_claims
from validators.kya import validate_kya_claims
from validators.pay import validate_pay_claims


def verifyTokenToExternalSeller(token):
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

    # sdm matches expected seller domain
    if payload.get("sdm") != EXPECTED_SDM:
        print("Invalid sdm:", payload.get("sdm"))
        return {"success": False, "error": "invalid_sdm", "message": f"sdm must match expected seller domain ({EXPECTED_SDM})."}

    if error := validate_kya_claims(payload):
        return error

    return {"success": True, "header": header, "payload": payload}

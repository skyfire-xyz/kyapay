import time
from utils import is_valid_uuid


def validate_header_claims(header, expected_typ):
    """
    Validate JWT header claims shared across all token types.
    Returns an error dict on failure, or None on success.
    """
    if header.get("typ") != expected_typ:
        print("Got typ:", header.get("typ"))
        return {"success": False, "error": "invalid_typ", "message": f"typ should be {expected_typ}"}
    return None


def validate_common_payload_claims(payload, expected_env):
    """
    Validate standard JWT payload claims present in all token types:
    env, iat, jti, exp.
    Returns an error dict on failure, or None on success.
    """
    # env matches expected environment
    if payload.get("env") != expected_env:
        print("Got env:", payload.get("env"))
        return {"success": False, "error": "invalid_env", "message": f"env must match expected environment ({expected_env})."}

    now = int(time.time())

    # iat is a 10-digit epoch seconds value in the past
    iat = payload.get("iat")
    if not isinstance(iat, int) or iat > now:
        print("Got iat:", iat)
        return {"success": False, "error": "invalid_iat", "message": "iat must be a 10-digit epoch seconds value in the past."}

    # jti is a valid UUID
    jti = payload.get("jti")
    if not is_valid_uuid(jti):
        print("Got jti:", jti)
        return {"success": False, "error": "invalid_jti", "message": "jti must be a valid UUID."}

    # exp is a 10-digit epoch seconds value in the future
    exp = payload.get("exp")
    if not isinstance(exp, int) or exp < now:
        print("Got exp:", exp)
        return {"success": False, "error": "invalid_exp", "message": "exp must be a 10-digit epoch seconds value in the future."}

    return None

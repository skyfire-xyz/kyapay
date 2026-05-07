from utils import to_int, to_decimal


def validate_pay_claims(payload, expected_stp=None, expected_spr=None, expected_sps=None):
    """
    Validate PAY payment claims.
    """
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
    if expected_stp is not None:
        stp = payload.get("stp")
        if stp != expected_stp:
            print("Invalid stp:", stp)
            return {"success": False, "error": "invalid_stp", "message": "stp must match expected settlement type."}

    # sti.verified is true
    sti_verified = payload.get("sti", {}).get("verified")
    if sti_verified is not True:
        print("Invalid sti.verified:", sti_verified)
        return {"success": False, "error": "invalid_sti_verified", "message": "sti must include verified: true."}

    # spr matches expected price
    if expected_spr is not None:
        if payload.get("spr") != expected_spr:
            print("Invalid Price:", payload.get("spr"))
            return {"success": False, "error": "invalid_spr", "message": "spr must match expected price."}

    # sps matches expected price model
    if expected_sps is not None:
        if payload.get("sps") != expected_sps:
            print("Invalid Price Model:", payload.get("sps"))
            return {"success": False, "error": "invalid_sps", "message": "sps must match expected price model."}

    return None

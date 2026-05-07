import validators


def validate_kya_claims(payload):
    """
    Validate KYA identity claims.
    This example shows basic validation (email); enforce additional checks as needed.
    """
    # hid.email is a valid email address
    email = payload.get("hid", {}).get("email")
    if not validators.email(email):
        print("Got email:", email)
        return {"success": False, "error": "invalid_email", "message": "email must be a valid email address."}
    return None

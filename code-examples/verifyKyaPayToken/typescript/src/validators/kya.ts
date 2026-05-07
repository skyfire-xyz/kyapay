import type { JWTPayload } from "jose";
import validator from "validator";
import type { VerifyError } from "../utils.js";

/**
 * Validate KYA identity claims.
 * This example shows basic validation (email); enforce additional checks as needed.
 */
export function validateKyaClaims(payload: JWTPayload): VerifyError | null {
  const email = (payload as any)?.hid?.email;
  // email is a valid email address
  if (!validator.isEmail(String(email))) {
    console.error("Invalid email format");
    return { success: false, error: "invalid_email", message: "Invalid email format." };
  }
  return null;
}

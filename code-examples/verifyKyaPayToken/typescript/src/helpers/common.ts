import type { JWTPayload, JWSHeaderParameters } from "jose";
import validator from "validator";
import { isEpochSeconds } from "../utils.js";
import type { VerifyError } from "../utils.js";

/**
 * Validate JWT header claims shared across all token types.
 * Returns a VerifyError on failure, or null on success.
 */
export function validateHeaderClaims(
  header: JWSHeaderParameters,
  expectedTyp: string
): VerifyError | null {
  if (header.typ !== expectedTyp) {
    console.error("Got typ:", header.typ);
    return { success: false, error: "invalid_typ", message: `typ should be ${expectedTyp}` };
  }
  return null;
}

/**
 * Validate standard JWT payload claims present in all token types:
 * env, iat, jti, exp.
 * Returns a VerifyError on failure, or null on success.
 */
export function validateCommonPayloadClaims(
  payload: JWTPayload,
  expectedEnv: string,
): VerifyError | null {
  if (payload["env"] !== expectedEnv) {
    console.error("Got env:", payload["env"]);
    return { success: false, error: "invalid_env", message: `env must match expected environment (${expectedEnv}).` };
  }

  const now = Math.floor(Date.now() / 1000);

  if (!isEpochSeconds(payload.iat) || payload.iat > now) {
    console.error("Got iat:", payload.iat);
    return { success: false, error: "invalid_iat", message: "iat must be a 10-digit epoch seconds value in the past." };
  }

  if (!validator.isUUID(String(payload.jti))) {
    console.error("Got jti:", payload.jti);
    return { success: false, error: "invalid_jti", message: "jti must be a valid UUID." };
  }

  if (!isEpochSeconds(payload.exp) || payload.exp < now) {
    console.error("Got exp:", payload.exp);
    return { success: false, error: "invalid_exp", message: "exp must be a 10-digit epoch seconds value in the future." };
  }

  return null;
}

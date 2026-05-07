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
    console.error("Invalid typ:", header.typ);
    return { success: false, error: "invalid_typ", message: `typ should be ${expectedTyp}` };
  }
  return null;
}

/**
 * Validate standard JWT payload claims present in all token types:
 * env, iat, jti, aud, sub, exp.
 * Returns a VerifyError on failure, or null on success.
 */
export function validateCommonPayloadClaims(
  payload: JWTPayload,
  expectedEnv: string,
  expectedAudience: string
): VerifyError | null {
  if (payload["env"] !== expectedEnv) {
    console.error("Invalid environment:", payload["env"]);
    return { success: false, error: "invalid_env", message: `env must match expected environment (${expectedEnv}).` };
  }

  const now = Math.floor(Date.now() / 1000);

  if (!isEpochSeconds(payload.iat) || payload.iat > now) {
    console.error("Invalid iat:", payload.iat);
    return { success: false, error: "invalid_iat", message: "iat must be a 10-digit epoch seconds value in the past." };
  }

  if (!validator.isUUID(String(payload.jti))) {
    console.error("Invalid jti:", payload.jti);
    return { success: false, error: "invalid_jti", message: "jti must be a valid UUID." };
  }

  if (payload.aud !== expectedAudience) {
    console.error("Invalid aud:", payload.aud);
    return { success: false, error: "invalid_aud", message: `aud must match expected audience (${expectedAudience}).` };
  }

  if (!validator.isUUID(String(payload.sub))) {
    console.error("Invalid sub:", payload.sub);
    return { success: false, error: "invalid_sub", message: "sub must be a valid UUID." };
  }

  if (!isEpochSeconds(payload.exp) || payload.exp < now) {
    console.error("Invalid exp:", payload.exp);
    return { success: false, error: "invalid_exp", message: "exp must be a 10-digit epoch seconds value in the future." };
  }

  return null;
}

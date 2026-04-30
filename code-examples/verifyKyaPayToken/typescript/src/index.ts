import { createRemoteJWKSet, jwtVerify } from "jose";
import type { JWTPayload, JWSHeaderParameters} from "jose";
import validator from "validator";

/**
 * Supports production and sandbox.
 * Pick the JWKS URL from the expected issuer/environment instead of hardcoding production only.
 */
const SKYFIRE_ENV = "production" as "production" | "sandbox";

const SKYFIRE_ISSUER_BY_ENV = {
  production: "https://app.skyfire.xyz",
  sandbox: "https://app-sandbox.skyfire.xyz",
} as const;

const JWKS_URL = `${SKYFIRE_ISSUER_BY_ENV[SKYFIRE_ENV]}/.well-known/jwks.json`;

const ALGORITHM = "ES256" as const;

const EXPECTED_AUDIENCE = "<SELLER_AGENT_ID>";
const EXPECTED_TOKEN_TYP = "kya-pay+jwt";

/**
 * Validate either service ID targeting or domain targeting.
 * This example uses EXPECTED_SSI, assuming this service is onboarded to Skyfire for Payments Processing.
 * Use EXPECTED_SDM and replace the ssi validation logic if tokens are targeted to your website/service domain instead.
 */
const EXPECTED_SSI = "<SELLER_SERVICE_ID>";

/**
 * Payment expectations should match your seller service configuration.
 */
const EXPECTED_STP = "<SETTLEMENT_TYPE>"; // e.g. "coin", "card", "bank"
const EXPECTED_SPS = "<PRICE_MODEL_FOR_SELLER_SERVICE>"; // e.g. pay_per_use, subscription, pay_per_mb, custom
const EXPECTED_SPR = "<PRICE_FOR_SELLER_SERVICE>"; // e.g. "0.01"

type VerifySuccess = { success: true; header: JWSHeaderParameters; payload: JWTPayload; };
type VerifyError = { success: false; error: string; message: string };
type VerifyResult = VerifySuccess | VerifyError;

/**
 * Create the remote JWKS once so jose can cache/reuse it.
 */
const JWKS = createRemoteJWKSet(new URL(JWKS_URL));

function isEpochSeconds(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1_000_000_000 && value <= 9_999_999_999;
}

export async function verifyKyaPayToken(token: string): Promise<VerifyResult> {
  let payload: JWTPayload;
  let header: JWSHeaderParameters;

  /**
   * Verify the token signature.
   */

  try {
    const verified = await jwtVerify(token, JWKS, {
      algorithms: [ALGORITHM],
      issuer: SKYFIRE_ISSUER_BY_ENV[SKYFIRE_ENV],
      audience: EXPECTED_AUDIENCE,
    });
    payload = verified.payload;
    header = verified.protectedHeader;
  } catch (err: any) {
    console.error("JWT verification failed:", err);
    return { success: false, error: "invalid_token", message: "JWT verification failed: invalid token." };
  }

  /**
   * Validate header claims.
   */
  // typ matches expected token type
  if (header.typ !== EXPECTED_TOKEN_TYP) {
    console.error("Invalid typ:", header.typ);
    return { success: false, error: "invalid_typ", message: `typ should be ${EXPECTED_TOKEN_TYP}` };
  }

  /**
   * Validate payload - common claims.
   */

  // env matches expected environment
  if (payload.env !== SKYFIRE_ENV) {
    console.error("Invalid environment:", payload.env);
    return { success: false, error: "invalid_env", message: `env must match expected environment (${SKYFIRE_ENV}).` };
  }

  // ssi matches expected seller service ID
  if (payload.ssi !== EXPECTED_SSI) {
    console.error("Invalid ssi:", payload.ssi);
    return { success: false, error: "invalid_ssi", message: `ssi must match expected seller service ID (${EXPECTED_SSI}).` };
  }

  // iat a 10-digit epoch seconds value in the past
  const now = Math.floor(Date.now() / 1000);
  if (!isEpochSeconds(payload.iat) || payload.iat > now) {
    console.error("Invalid iat:", payload.iat);
    return { success: false, error: "invalid_iat", message: "iat must be a 10-digit epoch seconds value in the past." };
  }

  // jti is a UUID
  if (!validator.isUUID(payload.jti as string)) {
    console.error("Invalid jti:", payload.jti);
    return { success: false, error: `invalid_jti`, message: `jti must be a valid UUID.` };
  }

  // aud matches expected audience
  if (payload.aud !== EXPECTED_AUDIENCE) {
    console.error("Invalid aud:", payload.aud);
    return { success: false, error: "invalid_aud", message: `aud must match expected audience (${EXPECTED_AUDIENCE}).` };
  }

  // sub is a UUID
  if (!validator.isUUID(payload.sub as string)) {
    console.error("Invalid sub:", payload.sub);
    return { success: false, error: `invalid_sub`, message: `sub must be a valid UUID.` };
  }

  // exp is a 10-digit epoch seconds value in the future
  if (!isEpochSeconds(payload.exp) || payload.exp < now) {
    console.error("Invalid exp:", payload.exp);
    return { success: false, error: "invalid_exp", message: "exp must be a 10-digit epoch seconds value in the future." };
  }


  /**
   * Validate the payload - kya claims.
   * This example shows basic validation (email), but you may enforce additional checks.
   */
  // hid.email is a valid email address
  const email = (payload as any)?.hid?.email;
  if (!validator.isEmail(email)) {
    console.error("Invalid email format");
    return { success: false, error: "invalid_email", message: "Invalid email format." };
  }

  /**
   * Validate the payload - pay claims.
   */
  // val is a positive integer
  const value = (payload.val as string)
  if (!validator.isInt(value, { min: 1 })) {
    return { success: false, error: "invalid_value", message: "val must be a positive integer." };
  }

  // amt is a positive number
  const amount = (payload.amt as string);
  if (!validator.isFloat(amount, { gt: 0 })) {
    return { success: false, error: "invalid_amount", message: "amt must be a positive number." };
  }

  // cur is USD
  const cur = (payload.cur as string);
  if (cur !== "USD") {
    console.error("Invalid cur:", cur);
    return { success: false, error: "invalid_cur", message: "cur must be USD." };
  }

  // stp matches expected settlement type
  const stp = (payload.stp as string);
  if (stp !== EXPECTED_STP) {
    console.error("Invalid stp:", stp);
    return { success: false, error: "invalid_stp", message: "stp must match expected settlement type." };
  }

  // sti includes verified: true
  const stiVerified = (payload as any)?.sti?.verified;
  if (stiVerified !== true) {
    console.error("Invalid sti.verified:", stiVerified);
    return { success: false, error: "invalid_sti_verified", message: "sti must include verified: true." };
  }

  // spr matches expected price
  if (payload.spr !== EXPECTED_SPR) {
    console.error("Invalid Price:", payload.spr);
    return { success: false, error: "invalid_spr", message: "spr must match expected price." };
  }

  // sps matches expected price model
  if (payload.sps !== EXPECTED_SPS) {
    console.error("Invalid Price Model:", payload.sps);
    return { success: false, error: "invalid_sps", message: "sps must match expected price model." };
  }

  return {
    success: true,
    header: header as VerifySuccess["header"],
    payload: payload as VerifySuccess["payload"],
  };
}

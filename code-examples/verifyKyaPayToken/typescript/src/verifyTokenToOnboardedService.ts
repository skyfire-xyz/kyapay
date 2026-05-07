/**
 * Verify a kya-pay+jwt token targeted to a Skyfire-onboarded seller service.
 *
 * Use this when your service is onboarded with Skyfire for Payments Processing.
 * Tokens carry ssi (seller service ID).
 */
import { jwtVerify } from "jose";
import {
  EXPECTED_ENV,
  SKYFIRE_ISSUER_BY_ENV,
  ALGORITHM,
  EXPECTED_TOKEN_TYP,
  EXPECTED_AUDIENCE,
  EXPECTED_SSI,
  EXPECTED_STP,
  EXPECTED_SPS,
  EXPECTED_SPR,
  JWKS,
} from "./config.js";
import type { VerifyResult } from "./utils.js";
import { validateHeaderClaims, validateCommonPayloadClaims } from "./validators/common.js";
import { validateKyaClaims } from "./validators/kya.js";
import { validatePayClaims } from "./validators/pay.js";

export async function verifyTokenToOnboardedService(token: string): Promise<VerifyResult> {
  let payload: Awaited<ReturnType<typeof jwtVerify>>["payload"];
  let header: Awaited<ReturnType<typeof jwtVerify>>["protectedHeader"];

  try {
    const verified = await jwtVerify(token, JWKS, {
      algorithms: [ALGORITHM],
      issuer: SKYFIRE_ISSUER_BY_ENV[EXPECTED_ENV],
      audience: EXPECTED_AUDIENCE,
    });
    payload = verified.payload;
    header = verified.protectedHeader;
  } catch (err) {
    console.error("JWT verification failed:", err);
    return { success: false, error: "invalid_token", message: "JWT verification failed: invalid token." };
  }

  const headerError = validateHeaderClaims(header, EXPECTED_TOKEN_TYP);
  if (headerError) return headerError;

  const commonError = validateCommonPayloadClaims(payload, EXPECTED_ENV, EXPECTED_AUDIENCE);
  if (commonError) return commonError;

  // ssi matches expected seller service ID
  if (payload["ssi"] !== EXPECTED_SSI) {
    console.error("Invalid ssi:", payload["ssi"]);
    return { success: false, error: "invalid_ssi", message: `ssi must match expected seller service ID (${EXPECTED_SSI}).` };
  }

  const kyaError = validateKyaClaims(payload);
  if (kyaError) return kyaError;

  const payError = validatePayClaims(payload, {
    expectedStp: EXPECTED_STP,
    expectedSpr: EXPECTED_SPR,
    expectedSps: EXPECTED_SPS,
  });
  if (payError) return payError;

  return { success: true, header, payload };
}

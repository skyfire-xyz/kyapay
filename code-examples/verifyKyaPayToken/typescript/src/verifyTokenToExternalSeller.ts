/**
 * Verify a kya token targeted to an external seller domain.
 * Tokens carry sdm (seller domain).
 */
import { jwtVerify } from "jose";
import {
  EXPECTED_ENV,
  SKYFIRE_ISSUER_BY_ENV,
  ALGORITHM,
  EXPECTED_TOKEN_TYP,
  EXPECTED_SDM,
  JWKS,
} from "./config.js";
import type { VerifyResult } from "./utils.js";
import { validateHeaderClaims, validateCommonPayloadClaims } from "./helpers/common.js";
import { validateKyaClaims } from "./helpers/kya.js";

export async function verifyTokenToExternalSeller(token: string): Promise<VerifyResult> {
  let payload: Awaited<ReturnType<typeof jwtVerify>>["payload"];
  let header: Awaited<ReturnType<typeof jwtVerify>>["protectedHeader"];

  try {
    const verified = await jwtVerify(token, JWKS, {
      algorithms: [ALGORITHM],
      issuer: SKYFIRE_ISSUER_BY_ENV[EXPECTED_ENV],
    });
    payload = verified.payload;
    header = verified.protectedHeader;
  } catch (err) {
    console.error("JWT verification failed:", err);
    return { success: false, error: "invalid_token", message: "JWT verification failed: invalid token." };
  }

  const headerError = validateHeaderClaims(header, EXPECTED_TOKEN_TYP);
  if (headerError) return headerError;

  const commonError = validateCommonPayloadClaims(payload, EXPECTED_ENV);
  if (commonError) return commonError;

  // sdm matches expected seller domain
  if (payload["sdm"] !== EXPECTED_SDM) {
    console.error("Invalid sdm:", payload["sdm"]);
    return { success: false, error: "invalid_sdm", message: `sdm must match expected seller domain (${EXPECTED_SDM}).` };
  }

  const kyaError = validateKyaClaims(payload);
  if (kyaError) return kyaError;

  return { success: true, header, payload };
}

import type { JWTPayload } from "jose";
import validator from "validator";
import type { VerifyError } from "../utils.js";

interface PayValidationOptions {
  expectedStp?: string;
  expectedSpr?: string;
  expectedSps?: string;
}

/**
 * Validate PAY payment claims.
 */
export function validatePayClaims(
  payload: JWTPayload,
  options: PayValidationOptions = {}
): VerifyError | null {
  const { expectedStp, expectedSpr, expectedSps } = options;

  // val is a positive integer
  const value = payload["val"] as string;
  if (!validator.isInt(value, { min: 1 })) {
    console.error("Got val:", value);
    return { success: false, error: "invalid_value", message: "val must be a positive integer." };
  }

  // amt is a positive number
  const amount = payload["amt"] as string;
  if (!validator.isFloat(amount, { gt: 0 })) {
    console.error("Got amt:", amount);
    return { success: false, error: "invalid_amount", message: "amt must be a positive number." };
  }

  // cur is USD
  const cur = payload["cur"] as string;
  if (cur !== "USD") {
    console.error("Got cur:", cur);
    return { success: false, error: "invalid_cur", message: "cur must be USD." };
  }

  // stp matches expected settlement type
  if (expectedStp !== undefined) {
    const stp = payload["stp"] as string;
    if (stp !== expectedStp) {
      console.error("Got stp:", stp);
      return { success: false, error: "invalid_stp", message: `stp must match expected settlement type (${expectedStp}).` };
    }
  }

  // sti.verified is true
  const sti = payload["sti"] as Record<string, unknown> | undefined;
  if (sti?.["verified"] !== true) {
    console.error("Got sti.verified:", sti?.["verified"]);
    return { success: false, error: "invalid_sti_verified", message: "sti must include verified: true." };
  }

  // spr matches expected price
  if (expectedSpr !== undefined) {
    if (payload["spr"] !== expectedSpr) {
      console.error("Got spr:", payload["spr"]);
      return { success: false, error: "invalid_spr", message: `spr must match expected price (${expectedSpr}).` };
    }
  }

  // sps matches expected price model
  if (expectedSps !== undefined) {
    if (payload["sps"] !== expectedSps) {
      console.error("Got sps:", payload["sps"]);
      return { success: false, error: "invalid_sps", message: `sps must match expected price model (${expectedSps}).` };
    }
  }

  return null;
}

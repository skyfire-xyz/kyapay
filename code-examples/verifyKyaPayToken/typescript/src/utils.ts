import type { JWTPayload, JWSHeaderParameters } from "jose";

export type VerifySuccess = { success: true; header: JWSHeaderParameters; payload: JWTPayload };
export type VerifyError = { success: false; error: string; message: string };
export type VerifyResult = VerifySuccess | VerifyError;

export function isEpochSeconds(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1_000_000_000 &&
    value <= 9_999_999_999
  );
}

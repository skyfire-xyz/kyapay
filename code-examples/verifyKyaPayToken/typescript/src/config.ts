import { createRemoteJWKSet } from "jose";

export const EXPECTED_ENV = "<SKYFIRE_ENVIRONMENT>" as "production" | "sandbox";  // e.g. "production", "sandbox"

export const SKYFIRE_ISSUER_BY_ENV = {
  production: "https://app.skyfire.xyz",
  sandbox: "https://app-sandbox.skyfire.xyz",
} as const;

export const JWKS_URL = `${SKYFIRE_ISSUER_BY_ENV[EXPECTED_ENV]}/.well-known/jwks.json`;
export const ALGORITHM = "ES256" as const;
export const EXPECTED_TOKEN_TYP = "<TOKEN_TYPE>";  // e.g. "kya-pay+jwt", "kya+jwt", "pay+jwt"
export const EXPECTED_AUDIENCE = "<SELLER_AGENT_ID>";

/**
 * External seller targeting: tokens carry sdm (seller domain).
 */
export const EXPECTED_SDM = "<SELLER_DOMAIN>"; // e.g. "yourdomain.com"

/**
 * Onboarded service targeting: tokens carry ssi (seller service ID).
 * Use this when your service is onboarded with Skyfire for Payments Processing.
 */
export const EXPECTED_SSI = "<SELLER_SERVICE_ID>";

/**
 * Payment expectations should match your seller service configuration.
 * Only applicable for onboarded services with registered service pricing.
 */
export const EXPECTED_STP = "<SETTLEMENT_TYPE>";                 // e.g. "coin", "card", "bank"
export const EXPECTED_SPS = "<PRICE_MODEL_FOR_SELLER_SERVICE>";  // e.g. pay_per_use, subscription, pay_per_mb, custom
export const EXPECTED_SPR = "<PRICE_FOR_SELLER_SERVICE>";        // e.g. "0.01"

/**
 * Create the remote JWKS once so jose can cache/reuse it across requests.
 */
export const JWKS = createRemoteJWKSet(new URL(JWKS_URL));

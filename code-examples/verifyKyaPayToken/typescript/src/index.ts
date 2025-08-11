import { createRemoteJWKSet, jwtVerify } from "jose";
import type { JWTPayload, JWSHeaderParameters} from "jose";
import validator from "validator";

const JWKS_URL = "https://app.skyfire.xyz/.well-known/jwks.json";
const JWT_ISSUER = "https://app.skyfire.xyz";
const ALGORITHMS = ["ES256"];
const JWT_AUDIENCE = "<SELLER_ID>";
const JWT_SPS = "<PRICE_MODEL_FOR_SELLER_SERVICE>";
const JWT_SPR = "<PRICE_FOR_SELLER_SERVICE>";

type VerifySuccess = { success: true; payload: JWTPayload };
type VerifyError = { success: false; error: string; message: string };
type VerifyResult = VerifySuccess | VerifyError;

async function verifyKyaPayToken(token: string): Promise<VerifyResult> {
  let payload: JWTPayload;
  let protectedHeader: JWSHeaderParameters;

  try {
    const { payload: pl, protectedHeader: hdr } = await jwtVerify(token, createRemoteJWKSet(new URL(JWKS_URL)), {
      algorithms: ALGORITHMS as unknown as string[],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    payload = pl;
    protectedHeader = hdr;
  } catch (err: any) {
    console.error("JWT verification failed:", err);
    return { success: false, error: "invalid_token", message: "JWT verification failed: invalid token." };
  }

  // Check typ header
  const typ = protectedHeader?.typ;
  if (typ !== "kya+pay+JWT") {
    console.error("Invalid typ:", typ);
    return { success: false, error: "invalid_typ", message: "typ should be kya+pay+JWT" };
  }

  // Validate skyfireEmail
  const skyfireEmail = (payload as any)?.bid?.skyfireEmail;
  if (!validator.isEmail(skyfireEmail)) {
    console.error("Invalid email format");
    return { success: false, error: "invalid_email", message: "Invalid email format." };
  }

  // Validate env
  if (payload.env !== "production") {
    console.error("Invalid environment:", payload.env);
    return { success: false, error: "invalid_env", message: "Token is not from production environment." };
  }

  const now = Math.floor(Date.now() / 1000);

  // Validate iat
  const iat = payload.iat;
  if (typeof iat !== "number" || iat > now) {
    console.error("Invalid iat:", iat);
    return { success: false, error: "invalid_iat", message: "Issued-at time is in the future or missing." };
  }

  // Validate exp
  const exp = payload.exp;
  if (typeof exp !== "number" || exp <= now) {
    console.error("Token has expired:", exp);
    return { success: false, error: "token_expired", message: "Token has expired." };
  }

   // Validate jti is a UUID
   if (!validator.isUUID(payload.jti as string)) {
    console.log("Invalid jti:", payload.jti);
    return { success: false, error: `invalid_jti`, message: `Invalid jti: not a valid UUID.` };
  }

  // Validate sub is a UUID
  if (!validator.isUUID(payload.sub as string)) {
    console.log("Invalid sub:", payload.sub);
    return { success: false, error: `invalid_sub`, message: `Invalid sub: not a valid UUID.` };
  }

  // Pay-related fields
  const value = (payload.value as string)
  if (isNaN(validator.toInt(value)) || parseInt(value)<=0) {
    return { success: false, error: "invalid_value", message: "Token value must be a positive integer." };
  }

  const amount = (payload.amount as string);
  if (isNaN(validator.toFloat(amount)) || parseFloat(amount)<=0) {
    return { success: false, error: "invalid_amount", message: "Token amount must be a positive number." };
  }

  const cur = (payload.cur as string);
  if (cur !== "USD") {
    console.error("Invalid cur:", cur);
    return { success: false, error: "invalid_cur", message: "Currency should be USD." };
  }

  if (payload.sps !== JWT_SPS) {
    console.error("Invalid Price Model:", payload.sps);
    return { success: false, error: "invalid_sps", message: "Price Model does not match seller service." };
  }

  if (payload.spr !== JWT_SPR) {
    console.error("Invalid Price:", payload.spr);
    return { success: false, error: "invalid_spr", message: "Price does not match seller service." };
  }

  return { success: true, payload: payload as VerifySuccess["payload"] };
}
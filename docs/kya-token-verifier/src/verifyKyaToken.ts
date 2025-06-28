import { jwtVerify, createRemoteJWKSet, errors } from 'jose';
import { v4 as uuidv4, validate as isUUID } from 'uuid';

const EXPECTED_ISSUER = 'https://app.skyfire.xyz/';
const JWKS_URL = `${EXPECTED_ISSUER}.well-known/jwks.json`;
const EXPECTED_ALG = 'ES256';

// Simple email regex (RFC 5322-like)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export async function verifyKyaToken(
  token: string,
  expectedSsi: string,
  expectedAud: string
): Promise<{ payload?: any; error?: string }> {
  const JWKS = createRemoteJWKSet(new URL(JWKS_URL));

  let payload: any;
  try {
    // Verify the JWT token and get payload
    const { payload: verifiedPayload } = await jwtVerify(token, JWKS, {
      issuer: EXPECTED_ISSUER,
      audience: expectedAud,
      algorithms: [EXPECTED_ALG]
    });
    payload = verifiedPayload;
    console.log('payload', payload);
  } catch (err) {
    console.error('Error while verifying token: ', err);

    const code = err instanceof errors.JOSEError ? err.code : undefined;
    const message = err instanceof errors.JOSEError ? err.message : 'Unknown JOSE error';

    return { error: `JWT verification failed: ${message} (${code ?? 'no-code'})` };
  }

  const errorsList: string[] = [];

  //ssi claim check
  if (payload.ssi !== expectedSsi) {
    errorsList.push(`Invalid 'ssi'. Expected '${expectedSsi}', got '${payload.ssi}'`);
  }
   // bid
   if (typeof payload.bid !== 'object' || payload.bid === null) {
    errorsList.push(`Missing or invalid 'bid'. Must be an object`);
  } else {
    const email = payload.bid.skyfireEmail;
    if (!email) {
      errorsList.push(`Missing 'skyfireEmail' in 'bid'`);
    } else if (!isValidEmail(email)) {
      errorsList.push(`Invalid email syntax in 'bid.skyfireEmail': '${email}'`);
    }
  }

  if (errorsList.length > 0) {
    return { error: errorsList.join('; ') };
  }

  return { payload };
}
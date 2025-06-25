# KYAPay Example API

#### API Keys

* You can see the API keys that you have created for your seller agents / seller services.
* You can deactivate a key and / or create new ones.
* Your seller agents / seller services will use an API key to charge pay and kya+pay tokens.

#### Charges

* You can see all the charges that have been made by your seller services, on the respective pay and kya+pay tokens that buyer agents have sent to them.

### Verify Token

```ts
// Get the key set from .../.well-known/jwks.json
const jwks = await getJWKS()

// Verify the signature and extract the token header and payload 
const verifier = jose.createLocalJWKSet(jwks)
const { payload, protectedHeader } = await jose.jwtVerify(
  token.token,
  verifier,
  {
    issuer: 'https://skyfire.xyz/',
    ...
  }
```

You can verify one or more of the following

* In ‘kya’ tokens (‘typ’ is ‘kya+JWT’)
  * Signature
  * ‘alg’ claim is ‘ES256’
  * ‘ssi’ claim is set to your Skyfire seller service ID
  * ‘iat’ claim is in the past
  * ‘exp’ claim is now or in the future
  * ‘iss’ claim is set to ‘[https://api.skyfire.xyz/](https://skyfire.xyz/)’
  * ‘jti’ claim is set to a UUID
  * ‘aud’ claim is set to your Skyfire agent account ID
  * ‘sub’ claim is set to a UUID
    * This is the buyer agent account ID
  * The ‘bid’ claim contains the buyer identity fields in a key-value map (JSON object)
* In ‘pay’ tokens (‘typ’ is ‘pay+JWT’)
  * Signature
  * ‘alg’ claim is ‘ES256’
  * ‘ssi’ claim is set to your Skyfire seller service ID
  * ‘iat’ claim is in the past
  * ‘exp’ claim is now or in the future
  * ‘iss’ claim is set to ‘[https://api.skyfire.xyz/](https://skyfire.xyz/)’
  * ‘jti’ claim is set to a UUID
  * ‘aud’ claim is set to your Skyfire agent account ID
  * ‘sub’ claim is set to a UUID
    * This is the buyer agent account ID
  * ‘value’ claim is \> 0
  * ‘amount’ claim is \> 0
  * ‘cur’ claim is set to ‘USD’
  * ‘sps’ claim matches the pricing scheme that you configured in your seller service
  * ‘spr’ claim matches the price that you configured in your seller service
* In ‘kya+pay’ tokens (‘typ’ is ‘kya+pay+JWT’)

Both ‘kya’ and ‘pay’ token validations as above

### Charge Token

#### API Endpoints

* Method
  * POST
* Path
  * {API endpoint}/api/v1/tokens/charge
* Request Body
  * {
    * token: \<string\>
      * The signed JWT received from the buyer agent in your API call
    * chargeAmount
      * The amount to charge from the token.
      * Must be
        * Greater than 0
        * Less than or equal to the tokenAmount.
        * Less than or equal to the balance on the token if you have charged a partial amount to this token already.
          * The balance will be less than or equal to the tokenAmount.
          * We will be adding a token introspection API that you can use to determine the balance on a token if you are unable to keep track of your partial amount charges.
      * We have selected string representation as a way to preserve precision in numbers.
* Processing
  * The token ‘typ’ must be ‘pay’ or ‘kya+pay’.
  * The seller is expected to enforce the ‘exp’ claim of a token i.e. reject tokens that have expired.
  * However, a seller is allowed to charge a token for up to 24 hours after it has expired.
    * In this case, Skyfire assumes that the seller did not accept an already expired token from the buyer.
* Response
  * Success code
    * 200
  * Body
    * {
      * amountCharged: \<string\>
        * The amount that Skyfire charged and moved from the buyer’s wallet to the seller’s wallet.
      * remainingBalance: \<string\>
        * The remaining balance on the token.
        * This is typically \> 0 and \< tokenAmount.
    * }

#### Charge token sample code

Node / TypeScript Example

```ts
  // JWT verification
  const JWKS = createRemoteJWKSet(new URL(JWKS_URL));
  try {
    const { protectedHeader } = await jwtVerify(skyfireToken, JWKS, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      algorithms: [JWT_ALGORITHM]
    });
    decodedHeader = protectedHeader;
  } catch (err) {
    console.error('Error while verifying token: ' + err);

    if (err instanceof errors.JOSEError) {
      return Response.json(
        {
          error: `Your JWT token is invalid`,
          errorCode: err.code,
          message: err.message
        },
        { status: 401 }
      );
    }

    return Response.json(
      { error: `Something went wrong while verifying your JWT token` },
      { status: 401 }
    );
  }

  let decodedToken;
  try {
    decodedToken = jwtDecode(skyfireToken);
  } catch (err) {
    console.error('Error while decoding token: ' + err);

    return Response.json({ error: 'Invalid JWT token' }, { status: 401 });
  }

  /**
   * Charge Token
   */
  if (decodedHeader.typ === 'kya+pay+JWT' || decodedHeader.typ === 'pay+JWT') {
    try {
      const response = await chargeToken(skyfireToken);
      responseMessage.push(response);
    } catch (err) {
      console.error('Error while charging token: ' + err);

      return Response.json(
        {
          error: `Couldn't charge your ${getTokenInfo(skyfireToken)} token`,
          message: err instanceof Error ? err.message : 'Unknown error'
        },
        { status: 400 }
      );
    }
  }

  const chargeToken = async (skyfireToken: string) => {
  let response;

  try {
    response = await fetch(`${SKYFIRE_API_URL}/api/v1/tokens/charge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'skyfire-api-key': <Skyfire Seller Agent API Key>,
      },
      body: JSON.stringify({
        token: skyfireToken,
        chargeAmount: AMOUNT_TO_CHARGE
      })
    });
  } catch (err) {
    console.error('Error while charging token: ' + err);
    throw new Error(
      err instanceof Error ? err.message : 'Unknown error while charging token'
    );
  }

  const res: {
    amountCharged: string;
    remainingBalance: string;
  } = await response.json();

};
```

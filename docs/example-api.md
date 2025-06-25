# Skyfire KYAPay Example API

All API interactions in the example require authenticated access via API keys, which are created per agent (buyer or seller) in the Skyfire dashboard. For setup details, go to https://docs.skyfire.xyz/docs/introduction.

### Onboard Buyers
Buyer agents interact with seller services by creating and sending tokens. These tokens convey identity (KYA), payment, or both. The token format and transmission method are determined by the seller's API specification. See [how to set up a buyer account](https://docs.skyfire.xyz/docs/getting-started-2) in Skyfire. 

### Create Token

#### API Endpoints

* Method  
  * POST  
* Path  
  * {API endpoint}/api/v1/tokens  
* Request Body  
  * {  
    * type: \<string\>,  
      * One of ‘kya’ | ‘pay’ | ‘kya+pay’  
    * buyerTag: \<string\>,  
      * Buyer’s internal identifier for the transaction / token  
    * tokenAmount: \<string\>,  
      * Optional  
      * Must include an amount if this is a ‘pay’ or ‘kya+pay’ token  
      * Must be  
        * Greater than 0  
        * Greater than the minimum token amount specified in the seller service (if any)  
        * Less than or equal to the balance in your agent’s wallet  
      * We have selected string representation as a way to preserve precision in numbers.  
    * sellerServiceId: \<UUID\>,  
      * You can get the seller service ID from the Skyfire marketplace  
    * expiresAt: \<number\>,  
      * Optional  
      * Default: 24 hours in the future  
      * Seconds since the Unix epoch  
      * Must be between 10 seconds and 24 hours (86,400 seconds) in the future.  
    * identityPermissions: \<string\[\]\>  
      * Optional  
      * Default: empty array  
      * Can be specified if this is a ‘kya’ or ‘kya+pay’ token.  
      * Additional identity fields to include in the token.  
      * Allowed field names are  
        * If you have completed an Individual verification  
          * 'selectedCountryCode'  
          * 'selectedIdClass'  
          * 'addressStreet1'  
          * 'addressStreet2'  
          * 'addressCity'  
          * 'addressSubdivision'  
          * 'addressPostalCode'  
          * 'addressCountryCode'  
          * 'birthdate'  
          * 'expirationDate'  
          * 'nameFirst'  
          * 'nameMiddle'  
          * 'nameLast'  
          * 'phoneNumber'  
          * 'issueDate'  
          * 'issuingAuthority’  
        * If you have completed a Business verification  
          * 'businessName'  
          * 'businessPhysicalAddressFull'  
          * 'businessPhysicalAddressCity'  
          * 'businessPhysicalAddressCountryCode'  
          * 'businessPhysicalAddressPostalCode'  
          * 'businessPhysicalAddressStreet1'  
          * 'businessPhysicalAddressStreet2'  
          * 'businessPhysicalAddressSubdivision'  
          * 'businessRegisteredAddressCity'  
          * 'businessRegisteredAddressCountryCode'  
          * 'businessRegisteredAddressPostalCode'  
          * 'businessRegisteredAddressStreet1'  
          * 'businessRegisteredAddressStreet2'  
          * 'businessRegisteredAddressSubdivision'  
          * 'businessTaxIdentificationNumber'  
          * 'birthdate'  
          * 'nameFirst'  
          * 'nameMiddle'  
          * 'nameLast'  
          * 'phoneNumber'  
          * 'selectedCountryCode'  
  * }  
* Response  
  * Success code  
    * 200  
  * Body  
    * {  
      * token: \<string\>  
        * The signed JWT  
    * }  
      

#### Create token sample code

Curl

```shell
curl --request POST \
     --url https://api-qa.skyfire.xyz/api/v1/tokens \
     --header 'skyfire-api-key: <Skyfire Buyer Agent API Key>' \
     --header 'content-type: application/json' \
     --data '
{
  "type": "pay",
  "buyerTag": "Playground-ah9nbdnc6y9",
  "tokenAmount": "0.005",
  "sellerServiceId": "<Skyfire Seller Service ID>",
  "expiresAt": 1750201115
}
'
```

Node / TypeScript

```ts
(async () => {
  const response = await fetch('https://api-qa.skyfire.xyz/api/v1/tokens', {
    method: 'POST',
    headers: {
      'skyfire-api-key': '<Skyfire Buyer Agent API Key>',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      type: 'pay',
      buyerTag: 'Playground-ah9nbdnc6y9',
      tokenAmount: '0.005',
      sellerServiceId: '<Skyfire Seller Service ID>',
      expiresAt: 1750201115
    }),
  });

  const data = await response.json();
  console.log(data);
})();
```

Python

```py
import requests
import json

url = 'https://api-qa.skyfire.xyz/api/v1/tokens'
headers = {
    'skyfire-api-key': '<Skyfire Buyer Agent API Key>',
    'content-type': 'application/json',
}
payload = {
    'type': 'pay',
    'buyerTag': 'Playground-ah9nbdnc6y9',
    'tokenAmount': '0.005',
    'sellerServiceId': '<Skyfire Seller Service ID>',
    'expiresAt': 1750201115
}

response = requests.post(url, headers=headers, data=json.dumps(payload))
print(response.json())
```

#### API Keys

* You can see the API keys that you have created for your seller agents / seller services.
* You can deactivate a key and / or create new ones.
* Your seller agents / seller services will use an API key to charge pay and kya+pay tokens.

#### Charges

* You can see all the charges that have been made by your seller services, on the respective pay and kya+pay tokens that buyer agents have sent to them.

### Onboard Sellers 
Sellers and seller agents are responsible for validating incoming tokens, extracting necessary identity or payment data, and charging tokens once goods or services have been delivered. Skyfire example tokens can be verified using standard JWT libraries and JWKS key sets. See how to set up a seller account in Skyfire: https://docs.skyfire.xyz/docs/creating-a-seller-account.

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

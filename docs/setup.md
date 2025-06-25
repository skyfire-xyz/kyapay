# How to set up the KYAPay Protocol repo and apply the CSL 


## Skyfire Platform Setup and Example APIs:

### Onboard Buyers

* Create your account and/or login at [https://app.skyfire.xyz/](https://app.skyfire.xyz/)  
* Login is via magic links. Skyfire does not use passwords.  
* Your buyer agent account is created by default.  
* Your buyer agent’s wallet is pre-funded with a half dollar.

![](./img/image001.png)

![](./img/image002.png)

* Click “Go to Playground” in the modal or if you skip that then, click “Learn how to use tokens” or “Playground” (in the left menu) to start buyer onboarding

![](./img/image003.png)

* Create your buyer agent’s first Skyfire API key  
  * Copy and save this API key in a safe place. It will not be displayed in its entirety again.

![](./img/image004.png)

* Create a test pay token  
  * To make it easy, Skyfire’s demonstration service is pre-selected as the seller service.  
  * If you were the buyer, then your buyer agent would make this API call to Skyfire using its API key.

![](./img/image005.png)

![](./img/image006.png)

* This creates a **“pay”** token, which is akin to a prepaid debit card that can only be used with this specific seller’s service. You have specified:  
  * tokenAmount: the maximum amount that the seller can charge you  
  * sellerServiceId: the seller service’s ID. This is typically available in the Skyfire marketplace.  
  * buyerTag: your internal ID for the token / transaction, if you have one  
  * expiresAt: when the token expires. This is between 10 seconds and 24 hours in the future.

![](./img/image007.png)

* Pass the pay token to the seller service.  
  * The seller service specifies how the token should be passed e.g. the seller service could include a custom HTTP header or include it in the API request body.

![](./img/image008.png)

* If you were the seller, then your seller agent / service would  
  * Inspect and verify the token using standard JWKS functionality.  
  * Charge the token to Skyfire using its Skyfire API key.  
    * Tokens can be charged for partial amounts.

#### API Keys

![](./img/image009.png)

* You can see the API keys that you have created for this agent account.  
* You can deactivate a key and / or create new ones.  
* Your buyer agents will use an API key to create tokens.

#### Tokens

![](./img/image010.png)

* You can see all the tokens that have been created by your buyer agent along with the seller service that they were created for.

#### Charges

![](./img/image011.png)

* You can see all the charges that have been made by seller services, on the respective pay and kya+pay tokens that your buyer agent has created.

#### Verification (KYA)

* Verification / KYA applies to both buyers and sellers.  
* Users should get verified so that they can transact with the widest number of buyers and sellers.  
* A Users verification applies to all their agents, both buyers and sellers.  
* Buyers can see whether a seller service is verified or not in the Skyfire marketplace.  
  * Buyers may choose to transact with verified seller services only.  
* Sellers can require that buyers be verified and seller services may require that buyers disclose their verified information via kya and / or kya+pay tokens.  
  * If a buyer is not verified to the required level, then the token creation will fail and the buyer will not be able to transact with the particular seller service.

#### Get Verified

![](./img/image012.png)

* Click “Get Verified” on the Home screen.

![](./img/image013.png)

* In order to be verified, you must subscribe to Skyfire.  
* If you want to conduct commerce as an Individual, then select the Individual plan.  
  * Users who choose this typically use their personal email address to create their Skyfire account.  
* If you want to conduct commerce as a Business / Corporation, then select the Business plan.  
  * Users who choose this typically use their employee email address to create their Skyfire account.

![](./img/image014.png)

* You will be redirected to the payment screen to complete your subscription.

![](./img/image015.png)

* Once subscribed, you can verify your identity.

![](./img/image016.png)

* Your verification is governed by your subscription.  
  * If you subscribe as an Individual, then you can only do Individual verification and your agents will be identified as representing an individual.  
  * If you subscribe as a Business, then you can only do Business verification and your agents will be identified as representing a business.  
* Select which level you want to verify yourself (conduct KYA) for.  
  * Level 2 is a more thorough verification and will give you the widest number of sellers to transact with.  
* Click the respective button to begin your KYA.

![](./img/image017.png)

![](./img/image018.png)

![](./img/image019.png)

* Grant consent and complete your verification.  
  * You can verify and re-verify any number of times.  
  * Only your last successful verification is considered and that's the identity that your agents acquire from you.  
* As a buyer, you should fund your agent’s wallet so that your agent can purchase goods, services, and / or tools from seller services.  
* As a seller, you should create your seller agent account and a seller service.

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

### Onboard Seller

![](./img/image020.png)

* Click “Create a Seller Account” on the Home screen.

![](./img/image021.png)

* Set a “Display Name”


![](./img/image022.png)

* Click “Create Service”

![](./img/image023.png)

* Provide the Name, Description, and select the Type of Service.

![](./img/image024.png)

* Depending on the Type of Service, you will be asked to provide the URL of the OpenAPI spec or the website or the MCP server.  
* Provide the URL, pricing, and Terms of Service information for your seller service.

![](./img/image025.png)

* Finally specify the identity requirements for your seller service.  
  * Your seller service can require buyer agents representing individuals, businesses, or both, to perform KYA and include identity information in the kya and kya+pay tokens that they send to your service.  
  * A buyer agent can perform only one of an individual KYA or a business KYA so your seller service should consider only the information applicable to the particular buyer agent.  
  * This step is optional. Your seller service does not have to require KYA from buyer agents unless you have a particular business need.

![](./img/image026.png)

* Your seller service will become available on the Skyfire platform after it is approved by Skyfire.  
  * The approval process typically takes less than a day.

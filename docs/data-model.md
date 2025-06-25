# KYAPay Token Data Model

* **KYA Token**: (`"typ": "kya+JWT")` Contains identity information only, used for account creation, login, or verifying the agent or its owner.  
    
* **Pay Token**: (`"typ": "pay+JWT")` Contains payment authorization only, used when the agent is already authenticated and needs to complete a transaction.

* **KYA \+ Pay Token**: (`"typ": "kya+pay+JWT")` Combines identity and payment data, enabling seamless guest checkout, where an agent can both identify itself and pay in a single interaction.

Header

```javascript
{
  "kid": "<JWK Key ID>",
  "alg": "ES256",
  "typ": "kya+pay+JWT" // or "kya+JWT" or "pay+JWT"
}
```

Payload
```js
{  
  // Standard claims (from the JWT spec)  
  "iss": "<issuer URL>",  
  "iat": 1742245254,  // 'issued at' timestamp  
  "exp": 1773867654,  // expiration timestamp  
  "jti": "b9821893-7699-4d24-af06-803a6a16476b", // unique token id  
  "sub": "<Buyer Agent Account ID>",  
  "aud": "<Seller Agent Account ID>", // audience binding, prevents replay

  // Skyfire-defined claims common to both 'pay' and 'kya' types  
  "env": "<Issuer environment (sandbox, production, etc)>",    
  "ssi": "<Seller Service ID>",  
  "btg": "<Buyer Tag (Buyer's internal reference ID)>",

  // Skyfire-defined claims for 'kya' (Know Your Agent) type tokens  
  "bid": {  // Buyer Identity claims  
    "email": "buyer@buyer.com”,   
    “businessName": "Buyer Inc."  
  },  
  "aid": {  // Agent Identity claims  
  },  
  // Skyfire-defined claims for 'pay' (Agent Payment) type tokens  
  "spr": "0.010000", // Seller Service Price  
  "sps": "PAY_PER_MB", // Seller Service Pricing Scheme  
  "amount": "15.000000", // Token Amount in Currency units  
  "cur": "USD", // Currency units  
  "value": "15.000000", // Token Amount in Settlement Network  
}
```

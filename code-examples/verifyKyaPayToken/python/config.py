EXPECTED_ENV = "<SKYFIRE_ENVIRONMENT>"  # e.g. "production", "sandbox"
SKYFIRE_ISSUER_BY_ENV = {
    "production": "https://app.skyfire.xyz",
    "sandbox": "https://app-sandbox.skyfire.xyz",
}
JWKS_URL = f"{SKYFIRE_ISSUER_BY_ENV[EXPECTED_ENV]}/.well-known/jwks.json"

ALGORITHM = "ES256"
EXPECTED_TOKEN_TYP = "<TOKEN_TYPE>"  # e.g. "kya-pay+jwt", "kya+jwt", "pay+jwt"
EXPECTED_AUDIENCE = "<SELLER_AGENT_ID>"  # optional

"""
External seller targeting: tokens carry sdm (seller domain).
"""
EXPECTED_SDM = "<SELLER_DOMAIN>"  # e.g. "yourdomain.com"

"""
Onboarded service targeting: tokens carry ssi (seller service ID).
Use this when your service is onboarded with Skyfire for Payments Processing.
"""
EXPECTED_SSI = "<SELLER_SERVICE_ID>"

"""
Payment expectations should match your seller service configuration.
Only applicable for onboarded services with registered service pricing.
"""
EXPECTED_STP = "<SETTLEMENT_TYPE>"                  # e.g. "coin", "card", "bank"
EXPECTED_SPS = "<PRICE_MODEL_FOR_SELLER_SERVICE>"   # e.g. pay_per_use, subscription, pay_per_mb, custom
EXPECTED_SPR = "<PRICE_FOR_SELLER_SERVICE>"         # e.g. "0.01"

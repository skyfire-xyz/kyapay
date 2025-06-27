import 'dotenv/config';
import { verifyKyaToken } from './verifyKyaToken';

// Define the API response type
interface TokenResponse {
  token: string;
}

const api_key = process.env.SKYFIRE_API_KEY!;
const ssi = process.env.EXPECTED_SSI!;
const aud = process.env.EXPECTED_AUD!;

(async () => {

  if (!ssi) {
    console.error('❌ Error: EXPECTED_SSI environment variable is required');
    process.exit(1);
  }

  if (!aud) {
    console.error('❌ Error: EXPECTED_AUD environment variable is required');
    process.exit(1);
  }

  console.log('📋 Verification Parameters:');
  console.log(`   Expected SSI: ${ssi}`);
  console.log(`   Expected Audience: ${aud}`);
  console.log('');

  try {
    console.log('🔍 Verifying token...\n');
    // const result = await verifyKyaToken(token, ssi, aud);

    const response = await fetch("https://api.skyfire.xyz/api/v1/tokens", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "skyfire-api-key": api_key
      },
      body: JSON.stringify({
        type: "kya",
        buyerTag: "Pay-1234",
        sellerServiceId: ssi,
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch token: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json() as TokenResponse;
    const fetchedToken = responseData.token;

    console.log("Token fetched successfully:", fetchedToken.substring(0, 50) + "...");

    const result = await verifyKyaToken(fetchedToken, ssi, aud);

    if (result.error) {
      console.log('❌ Token verification failed!');
      console.log(`   Error: ${result.error}`);
    } else {
      console.log('✅ Token verification successful!');
      console.log('\n📄 Token Payload:');
      console.log(JSON.stringify(result.payload, null, 2));
    }
  } catch (error) {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  }
})();
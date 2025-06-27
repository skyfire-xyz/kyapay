# KYA Token Verifier

A TypeScript project for testing and verifying KYA (Know Your Agent) tokens from Skyfire services.

## Features

- 🔐 JWT token verification using Skyfire's JWKS endpoint
- ✅ Comprehensive validation of token payload fields
- 🛡️ Input parameter validation and error handling
- 🧪 Automated testing with Vitest
- 📝 TypeScript support with full type safety
- 🔧 Environment-based configuration

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. Run the verifier:
   ```bash
    npx tsx src/index.ts
   ```

## Configuration

Create a `.env` file in the project root with the following variables:

```env
SKYFIRE_API_KEY=your-skyfire-api-key
EXPECTED_SSI=your-seller-service-id
EXPECTED_AUD=your-agent-account-id
```

### Environment Variables

- `SKYFIRE_API_KEY`: The buyer api key from skyfire
- `EXPECTED_SSI`: The expected Seller Service ID
- `EXPECTED_AUD`: The expected audience (Agent Account ID)

## Usage

### Command Line

```bash
 npx tsx src/index.ts
```

### Programmatic Usage

```typescript
import { verifyKyaToken } from './src/verifyKyaToken';

const result = await verifyKyaToken(token, expectedSsi, expectedAud);

if (result.success) {
  console.log('Token verified successfully:', result.payload);
} else {
  console.error('Verification failed:', result.error);
}
```


## Token Validation

The verifier performs the following validations:

1. **JWT Structure**: Validates the token is a properly formatted JWT
2. **Signature**: Verifies the token signature using Skyfire's JWKS
3. **Issuer**: Ensures the issuer is `https://api.skyfire.com`
4. **Audience**: Validates the audience matches the expected value
5. **SSI**: Verifies the Seller Service ID matches the expected value
6. **Timestamps**: Checks that the token is not expired and was issued in the past
7. **UUID Fields**: Validates that JTI and nonce fields are proper UUIDs
8. **Required Fields**: Ensures all required payload fields are present

## Project Structure

```
kya-token-verifier/
├── .env                    # Environment variables
├── .gitignore             # Git ignore file
├── package.json           # Project configuration
├── tsconfig.json          # TypeScript configuration
├── README.md              # This file
└── src/
    ├── index.ts           # Main entry point
    ├── verifyKyaToken.ts  # Core verification
```

## API Reference

### `verifyKyaToken(token, expectedSsi, expectedAud)`

Verifies a KYA token against the provided parameters.

**Parameters:**
- `token` (string): The JWT token to verify
- `expectedSsi` (string): The expected Seller Service ID
- `expectedAud` (string): The expected audience

**Returns:**
```typescript
{
  success: boolean;
  payload?: KyaTokenPayload;
  error?: string;
}
```

**KyaTokenPayload Interface:**
```typescript
{
  iss: string;    // Issuer
  sub: string;    // Subject
  aud: string;    // Audience
  exp: number;    // Expiration time
  iat: number;    // Issued at time
  jti: string;    // JWT ID (UUID)
  ssi: string;    // Seller Service ID
  nonce: string;  // Nonce (UUID)
}
```

## Error Handling

The verifier returns detailed error messages for various failure scenarios:

- Invalid token format
- Signature verification failures
- Missing or invalid payload fields
- SSI or audience mismatches
- Expired tokens
- Invalid UUID formats
- Network errors

### Adding Tests

Add new test cases to `src/verifyKyaToken.test.ts`:

```typescript
test('should handle specific scenario', async () => {
  const result = await verifyKyaToken(token, ssi, aud);
  expect(result.success).toBe(true);
});
```

## Troubleshooting

### Common Issues

1. **Network Errors**: Ensure you have internet access to reach `https://api.skyfire.com`
2. **Invalid Token**: Verify the token is a valid JWT from Skyfire
3. **Environment Variables**: Check that all required env vars are set
4. **TypeScript Errors**: Run `npm install` to ensure all dependencies are installed

## License

ISC

## Support

For issues related to Skyfire services or KYA tokens, please contact your Skyfire support team.
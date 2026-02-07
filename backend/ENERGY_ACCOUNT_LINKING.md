# Energy Account Linking Implementation

## Overview

This document describes the implementation of Task 2.3: Energy Account Linking for the Energy Usage Assistant.

## Implementation Details

### 1. Encryption Utilities (`src/lib/encryption.ts`)

Provides secure encryption and decryption of energy account credentials using AES-256-CBC:

- **Algorithm**: AES-256-CBC with random initialization vectors (IV)
- **Key Derivation**: SHA-256 hash of the encryption key
- **Format**: Encrypted data is stored as `iv:encryptedData` (hex-encoded)
- **Security**: Each encryption uses a unique random IV, ensuring different ciphertext for the same plaintext

**Functions:**
- `encrypt(text: string): string` - Encrypts a string
- `decrypt(encryptedText: string): string` - Decrypts an encrypted string

**Environment Variable:**
- `ENCRYPTION_KEY` - Should be set to a secure 32-character key in production

### 2. Mock External Energy Provider API (`src/lib/mockEnergyProviderApi.ts`)

Simulates an external energy provider's API for development and testing:

**Mock Accounts:**
- `ACC001` / `password123`
- `ACC002` / `securepass456`
- `ACC003` / `energyuser789`
- `TEST123` / `testpass`

**Functions:**
- `validateEnergyAccountCredentials(accountId, password)` - Validates credentials
- `addMockAccount(accountId, password)` - Adds a mock account for testing
- `removeMockAccount(accountId)` - Removes a mock account
- `resetMockAccounts()` - Resets to default accounts

**Features:**
- Simulates network delay (100ms)
- Returns appropriate error messages for invalid credentials
- Distinguishes between "account not found" and "invalid credentials"

### 3. Energy Account Linking Endpoint

**Endpoint:** `POST /api/auth/link-energy-account`

**Authentication:** Requires valid JWT token (Bearer token in Authorization header)

**Request Body:**
```json
{
  "energyAccountId": "string",
  "energyAccountPassword": "string"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "accountLinked": true
}
```

**Error Responses:**

- **400 Bad Request** - Validation failed (missing or invalid fields)
  ```json
  {
    "error": "Validation failed",
    "details": [...]
  }
  ```

- **401 Unauthorized** - Missing or invalid authentication token
  ```json
  {
    "error": "Authentication token required"
  }
  ```
  OR
  ```json
  {
    "error": "Energy account validation failed",
    "message": "Invalid credentials"
  }
  ```

- **403 Forbidden** - Invalid JWT token
  ```json
  {
    "error": "Invalid token"
  }
  ```

- **500 Internal Server Error** - Server error
  ```json
  {
    "error": "Internal server error"
  }
  ```

### 4. Implementation Flow

1. **Authentication Check**: Middleware validates JWT token and extracts userId
2. **Input Validation**: Zod schema validates request body
3. **External API Validation**: Credentials are validated against mock external API
4. **Encryption**: Password is encrypted using AES-256-CBC
5. **Database Update**: User profile is updated with energyAccountId and encrypted credentials
6. **Response**: Success response is returned

### 5. Database Schema

The `UserProfile` model includes:
```prisma
model UserProfile {
  id                        String    @id @default(uuid())
  email                     String    @unique
  passwordHash              String
  energyAccountId           String?   // Energy provider account ID
  energyAccountCredentials  String?   // Encrypted password
  // ... other fields
}
```

## Security Considerations

1. **Encryption at Rest**: Energy account credentials are encrypted before storage
2. **Authentication Required**: Endpoint requires valid JWT token
3. **Input Validation**: All inputs are validated using Zod schemas
4. **Password Hashing**: User passwords use bcrypt with salt rounds
5. **No Credential Exposure**: Encrypted credentials are never returned in API responses

## Testing

### Unit Tests

The implementation includes comprehensive unit tests in `src/routes/__tests__/auth.test.ts`:

1. ✅ Link energy account with valid credentials
2. ✅ Encrypt credentials before storing
3. ✅ Reject linking without authentication token
4. ✅ Reject linking with invalid authentication token
5. ✅ Reject linking with invalid energy account credentials
6. ✅ Reject linking with non-existent energy account
7. ✅ Reject linking with missing energyAccountId
8. ✅ Reject linking with missing energyAccountPassword
9. ✅ Allow updating energy account credentials

### Manual Testing

Run the manual test script to verify components:
```bash
npx tsx src/__tests__/energy-account-linking.manual-test.ts
```

### Integration Testing

Example using curl:

1. **Register a user:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

2. **Link energy account:**
```bash
curl -X POST http://localhost:3001/api/auth/link-energy-account \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"energyAccountId":"ACC001","energyAccountPassword":"password123"}'
```

## Requirements Validation

This implementation validates **Requirement 1.2**:

> WHEN a user provides valid Energy_Account credentials, THE System SHALL authenticate and link the account to the user profile

✅ **Implemented:**
- Validates credentials against external API (mocked)
- Encrypts and stores credentials securely
- Links account to user profile
- Returns appropriate success/error responses
- Handles authentication failures gracefully

## Future Enhancements

For production deployment:

1. **Replace Mock API**: Integrate with actual energy provider APIs
2. **Secure Key Management**: Use AWS KMS, Azure Key Vault, or similar for encryption keys
3. **Rate Limiting**: Add rate limiting to prevent brute force attacks
4. **Audit Logging**: Log all account linking attempts for security monitoring
5. **Credential Rotation**: Implement mechanism to update stored credentials
6. **Multi-Provider Support**: Support multiple energy providers with different APIs
7. **OAuth Integration**: Consider OAuth 2.0 for energy provider authentication if available

## Dependencies

- `crypto` (Node.js built-in) - For encryption
- `zod` - For input validation
- `jsonwebtoken` - For JWT authentication
- `@prisma/client` - For database operations
- `express` - For HTTP routing

## Related Files

- `backend/src/routes/auth.ts` - Main implementation
- `backend/src/lib/encryption.ts` - Encryption utilities
- `backend/src/lib/mockEnergyProviderApi.ts` - Mock external API
- `backend/src/lib/auth.ts` - Authentication middleware
- `backend/src/routes/__tests__/auth.test.ts` - Unit tests
- `backend/prisma/schema.prisma` - Database schema

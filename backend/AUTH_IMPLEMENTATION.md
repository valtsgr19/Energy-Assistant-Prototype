# Authentication Implementation - Task 2.1

## Overview

This document describes the implementation of user registration and login endpoints for the Energy Usage Assistant application.

## Implementation Details

### Endpoints Implemented

#### 1. POST /api/auth/register

**Purpose:** Register a new user account

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (201 Created):**
```json
{
  "userId": "uuid-string",
  "token": "jwt-token-string"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid email format or password too short (< 6 characters)
- `409 Conflict` - Email already registered
- `500 Internal Server Error` - Server error

**Features:**
- Email validation using Zod schema
- Password minimum length validation (6 characters)
- Password hashing using bcrypt with 10 salt rounds
- Automatic JWT token generation with 7-day expiration
- User profile creation in database using Prisma
- Sets `lastLoginAt` timestamp on registration

#### 2. POST /api/auth/login

**Purpose:** Authenticate existing user and generate session token

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200 OK):**
```json
{
  "userId": "uuid-string",
  "token": "jwt-token-string"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid email format or missing password
- `401 Unauthorized` - Invalid credentials (email or password incorrect)
- `500 Internal Server Error` - Server error

**Features:**
- Email and password validation
- Secure password comparison using bcrypt
- Updates `lastLoginAt` timestamp on successful login
- JWT token generation with 7-day expiration
- Generic error message for invalid credentials (doesn't reveal if email or password was wrong)

### Security Features

1. **Password Hashing:**
   - Uses bcrypt with 10 salt rounds
   - Passwords are never stored in plain text
   - One-way hashing prevents password recovery

2. **JWT Token Authentication:**
   - Tokens expire after 7 days
   - Tokens include userId and email in payload
   - Secret key should be set via JWT_SECRET environment variable

3. **Input Validation:**
   - Email format validation
   - Password length requirements
   - Request body validation using Zod schemas

4. **Error Handling:**
   - Generic error messages for authentication failures
   - Doesn't reveal whether email exists or password is wrong
   - Proper HTTP status codes for different error types

### Database Schema

The implementation uses the `UserProfile` model from Prisma:

```prisma
model UserProfile {
  id                        String    @id @default(uuid())
  email                     String    @unique
  passwordHash              String
  energyAccountId           String?
  energyAccountCredentials  String?
  createdAt                 DateTime  @default(now())
  lastLoginAt               DateTime?
  // ... other relations
}
```

### Supporting Files

#### backend/src/lib/auth.ts

Provides authentication utilities:

- `generateToken(userId, email)` - Creates JWT tokens
- `authenticateToken` - Express middleware for protecting routes
- `AuthRequest` interface - Extended Request type with userId and userEmail

**Usage Example:**
```typescript
import { authenticateToken, AuthRequest } from '../lib/auth.js';

router.get('/protected', authenticateToken, (req: AuthRequest, res) => {
  const userId = req.userId; // Available after authentication
  // ... handle request
});
```

## Testing

### Unit Tests

Location: `backend/src/routes/__tests__/auth.test.ts`

**Test Coverage:**
- ✅ Register new user with valid credentials
- ✅ Password hashing with bcrypt
- ✅ JWT token generation and validation
- ✅ Duplicate email rejection
- ✅ Invalid email format rejection
- ✅ Short password rejection
- ✅ Missing fields rejection
- ✅ Login with valid credentials
- ✅ JWT token validation on login
- ✅ lastLoginAt timestamp update
- ✅ Invalid email rejection on login
- ✅ Invalid password rejection on login
- ✅ Missing fields rejection on login
- ✅ Generic error message for invalid credentials

**Running Tests:**
```bash
cd backend
npm test -- auth.test.ts
```

### Integration Tests

Location: `backend/src/routes/__tests__/auth.integration.test.ts`

**Test Coverage:**
- ✅ Complete registration and login flow
- ✅ Duplicate registration prevention
- ✅ Database persistence verification

### Manual Testing

A shell script is provided for manual API testing:

```bash
cd backend
# Start the server first
npm run dev

# In another terminal
./test-auth-manual.sh
```

## Requirements Validation

This implementation validates the following requirements:

### Requirement 1.2: Authentication Success Links Account
✅ When a user provides valid credentials during registration, the system creates a user profile and returns a token for session management.

### Requirement 1.3: Authentication Failure Handling
✅ When authentication fails (invalid credentials), the system displays an error message ("Invalid credentials") and allows retry without crashing.

## API Design Compliance

The implementation follows the API interface specified in the design document:

**POST /api/auth/register**
- ✅ Request: `{ email, password }`
- ✅ Response: `{ userId, token }`

**POST /api/auth/login**
- ✅ Request: `{ email, password }`
- ✅ Response: `{ userId, token }`

## Dependencies

- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT token generation and verification
- `zod` - Request validation
- `@prisma/client` - Database operations
- `express` - Web framework

## Environment Variables

- `JWT_SECRET` - Secret key for JWT signing (defaults to development key if not set)
- `DATABASE_URL` - Database connection string (set in .env file)

## Next Steps

The following items are ready for implementation:

1. **Task 2.2** - Write property-based tests for authentication
2. **Task 2.3** - Implement energy account linking endpoint
3. Use the `authenticateToken` middleware in protected routes

## Notes

- The JWT secret should be changed in production and stored securely
- Consider implementing rate limiting for login attempts in production
- Consider adding refresh token functionality for better security
- The current implementation uses a 7-day token expiration, which can be adjusted based on security requirements

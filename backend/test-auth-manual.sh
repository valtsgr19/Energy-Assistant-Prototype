#!/bin/bash

# Manual test script for authentication endpoints
# Run this after starting the backend server with: npm run dev

BASE_URL="http://localhost:3001"
EMAIL="test-$(date +%s)@example.com"
PASSWORD="testPassword123"

echo "Testing Authentication Endpoints"
echo "================================="
echo ""

# Test 1: Register a new user
echo "Test 1: Register new user"
echo "Email: $EMAIL"
echo "Password: $PASSWORD"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

echo "Response: $REGISTER_RESPONSE"
USER_ID=$(echo $REGISTER_RESPONSE | grep -o '"userId":"[^"]*"' | cut -d'"' -f4)
TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$USER_ID" ]; then
  echo "❌ Registration failed"
  exit 1
else
  echo "✅ Registration successful"
  echo "User ID: $USER_ID"
  echo "Token: ${TOKEN:0:20}..."
fi

echo ""
echo "---"
echo ""

# Test 2: Login with the same credentials
echo "Test 2: Login with registered credentials"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

echo "Response: $LOGIN_RESPONSE"
LOGIN_USER_ID=$(echo $LOGIN_RESPONSE | grep -o '"userId":"[^"]*"' | cut -d'"' -f4)
LOGIN_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ "$LOGIN_USER_ID" = "$USER_ID" ]; then
  echo "✅ Login successful with matching user ID"
  echo "Token: ${LOGIN_TOKEN:0:20}..."
else
  echo "❌ Login failed or user ID mismatch"
  exit 1
fi

echo ""
echo "---"
echo ""

# Test 3: Try to register with duplicate email
echo "Test 3: Try to register with duplicate email"
DUPLICATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"differentPassword\"}")

echo "Response: $DUPLICATE_RESPONSE"
if echo "$DUPLICATE_RESPONSE" | grep -q "already registered"; then
  echo "✅ Duplicate registration correctly rejected"
else
  echo "❌ Duplicate registration should have been rejected"
  exit 1
fi

echo ""
echo "---"
echo ""

# Test 4: Try to login with wrong password
echo "Test 4: Try to login with wrong password"
WRONG_PASSWORD_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"wrongPassword\"}")

echo "Response: $WRONG_PASSWORD_RESPONSE"
if echo "$WRONG_PASSWORD_RESPONSE" | grep -q "Invalid credentials"; then
  echo "✅ Invalid password correctly rejected"
else
  echo "❌ Invalid password should have been rejected"
  exit 1
fi

echo ""
echo "================================="
echo "All tests passed! ✅"

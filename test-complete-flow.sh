#!/bin/bash

# Test script for complete onboarding → Daily Assistant flow
# This script tests the backend API endpoints in sequence

BASE_URL="http://localhost:3001"
echo "Testing Energy Usage Assistant - Complete Flow"
echo "=============================================="
echo ""

# Step 1: Register a new user (or login if exists)
echo "1. Testing user registration..."
TIMESTAMP=$(date +%s)
EMAIL="test${TIMESTAMP}@example.com"

REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"password123\"
  }")

echo "Response: $REGISTER_RESPONSE"
TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Registration failed"
  exit 1
fi
echo "✅ Registration successful with email: $EMAIL"
echo ""

# Step 2: Link energy account
echo "2. Testing energy account linking..."
LINK_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/link-energy-account" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "energyAccountId": "ACC001",
    "energyAccountPassword": "password123"
  }')

echo "Response: $LINK_RESPONSE"
if echo "$LINK_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Energy account linked"
else
  echo "❌ Energy account linking failed"
  exit 1
fi
echo ""

# Step 3: Configure solar system
echo "3. Testing solar system configuration..."
SOLAR_RESPONSE=$(curl -s -X POST "$BASE_URL/api/onboarding/solar-system" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "hasSolar": true,
    "systemSizeKw": 5.0,
    "tiltDegrees": 30,
    "orientation": "S"
  }')

echo "Response: $SOLAR_RESPONSE"
if echo "$SOLAR_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Solar system configured"
else
  echo "❌ Solar system configuration failed"
  exit 1
fi
echo ""

# Step 4: Set up tariff
echo "4. Testing tariff setup..."
TODAY=$(date +%Y-%m-%d)
TARIFF_RESPONSE=$(curl -s -X POST "$BASE_URL/api/tariff" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"effectiveDate\": \"$TODAY\",
    \"periods\": [
      {
        \"name\": \"off-peak\",
        \"startTime\": \"00:00\",
        \"endTime\": \"07:00\",
        \"pricePerKwh\": 0.08,
        \"daysOfWeek\": [\"MON\", \"TUE\", \"WED\", \"THU\", \"FRI\", \"SAT\", \"SUN\"]
      },
      {
        \"name\": \"shoulder\",
        \"startTime\": \"07:00\",
        \"endTime\": \"17:00\",
        \"pricePerKwh\": 0.15,
        \"daysOfWeek\": [\"MON\", \"TUE\", \"WED\", \"THU\", \"FRI\", \"SAT\", \"SUN\"]
      },
      {
        \"name\": \"peak\",
        \"startTime\": \"17:00\",
        \"endTime\": \"21:00\",
        \"pricePerKwh\": 0.35,
        \"daysOfWeek\": [\"MON\", \"TUE\", \"WED\", \"THU\", \"FRI\"]
      },
      {
        \"name\": \"off-peak\",
        \"startTime\": \"21:00\",
        \"endTime\": \"00:00\",
        \"pricePerKwh\": 0.08,
        \"daysOfWeek\": [\"MON\", \"TUE\", \"WED\", \"THU\", \"FRI\", \"SAT\", \"SUN\"]
      }
    ]
  }")

echo "Response: $TARIFF_RESPONSE"
if echo "$TARIFF_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Tariff configured"
else
  echo "❌ Tariff configuration failed"
  exit 1
fi
echo ""

# Step 5: Sync consumption data
echo "5. Testing consumption data sync..."
CONSUMPTION_RESPONSE=$(curl -s -X POST "$BASE_URL/api/consumption/sync" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $CONSUMPTION_RESPONSE"
if echo "$CONSUMPTION_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Consumption data synced"
else
  echo "❌ Consumption data sync failed"
  exit 1
fi
echo ""

# Step 6: Get chart data for today
echo "6. Testing Daily Assistant chart data (today)..."
echo "Using token: ${TOKEN:0:50}..."
CHART_RESPONSE=$(curl -s -X GET "$BASE_URL/api/daily-assistant/chart-data?date=today" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Response (first 500 chars): ${CHART_RESPONSE:0:500}..."
if echo "$CHART_RESPONSE" | grep -q '"intervals"'; then
  INTERVAL_COUNT=$(echo "$CHART_RESPONSE" | grep -o '"startTime"' | wc -l)
  echo "✅ Chart data retrieved with $INTERVAL_COUNT intervals"
  
  # Check for current status
  if echo "$CHART_RESPONSE" | grep -q '"currentStatus"'; then
    echo "✅ Current status included"
  else
    echo "⚠️  Current status not included"
  fi
else
  echo "❌ Chart data retrieval failed"
  exit 1
fi
echo ""

# Step 7: Get advice for today
echo "7. Testing energy advice generation..."
ADVICE_RESPONSE=$(curl -s -X GET "$BASE_URL/api/daily-assistant/advice?date=today" \
  -H "Authorization: Bearer $TOKEN")

echo "Response (first 500 chars): ${ADVICE_RESPONSE:0:500}..."
if echo "$ADVICE_RESPONSE" | grep -q '"generalAdvice"'; then
  ADVICE_COUNT=$(echo "$ADVICE_RESPONSE" | grep -o '"title"' | wc -l)
  echo "✅ Advice retrieved with $ADVICE_COUNT recommendations"
else
  echo "❌ Advice retrieval failed"
  exit 1
fi
echo ""

# Step 8: Get chart data for tomorrow
echo "8. Testing Daily Assistant chart data (tomorrow)..."
TOMORROW_RESPONSE=$(curl -s -X GET "$BASE_URL/api/daily-assistant/chart-data?date=tomorrow" \
  -H "Authorization: Bearer $TOKEN")

if echo "$TOMORROW_RESPONSE" | grep -q '"intervals"'; then
  echo "✅ Tomorrow's chart data retrieved"
  
  # Check that current status is NOT included for tomorrow
  if echo "$TOMORROW_RESPONSE" | grep -q '"currentStatus"'; then
    echo "⚠️  Current status should not be included for tomorrow"
  else
    echo "✅ Current status correctly excluded for tomorrow"
  fi
else
  echo "❌ Tomorrow's chart data retrieval failed"
  exit 1
fi
echo ""

echo "=============================================="
echo "✅ All tests passed! Complete flow working."
echo ""
echo "You can now test the UI at: http://localhost:3000"
echo "Backend API running at: http://localhost:3001"

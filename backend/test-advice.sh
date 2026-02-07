#!/bin/bash

# Test script for Energy Advice API endpoint
# This script tests the advice generation endpoint

BASE_URL="http://localhost:3001/api"

echo "=== Energy Advice API Test ==="
echo ""

# Step 1: Register a user
echo "1. Registering user..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "advice-test@example.com",
    "password": "password123"
  }')

TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
USER_ID=$(echo $REGISTER_RESPONSE | grep -o '"userId":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to register user"
  echo "Response: $REGISTER_RESPONSE"
  exit 1
fi

echo "✅ User registered successfully"
echo ""

# Step 2: Link energy account
echo "2. Linking energy account..."
curl -s -X POST "$BASE_URL/auth/link-energy-account" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "energyAccountId": "ACC123456",
    "energyAccountPassword": "password"
  }' > /dev/null

echo "✅ Energy account linked"
echo ""

# Step 3: Configure solar system
echo "3. Configuring solar system..."
curl -s -X POST "$BASE_URL/onboarding/solar-system" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "hasSolar": true,
    "systemSizeKw": 5.0,
    "tiltDegrees": 30.0,
    "orientation": "S"
  }' > /dev/null

echo "✅ Solar system configured"
echo ""

# Step 4: Set up tariff
echo "4. Setting up tariff..."
curl -s -X POST "$BASE_URL/tariff" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "effectiveDate": "2024-01-01",
    "periods": [
      {
        "name": "off-peak",
        "startTime": "00:00",
        "endTime": "07:00",
        "pricePerKwh": 0.07,
        "daysOfWeek": ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
      },
      {
        "name": "shoulder",
        "startTime": "07:00",
        "endTime": "17:00",
        "pricePerKwh": 0.15,
        "daysOfWeek": ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
      },
      {
        "name": "peak",
        "startTime": "17:00",
        "endTime": "22:00",
        "pricePerKwh": 0.30,
        "daysOfWeek": ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
      },
      {
        "name": "off-peak",
        "startTime": "22:00",
        "endTime": "00:00",
        "pricePerKwh": 0.07,
        "daysOfWeek": ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
      }
    ]
  }' > /dev/null

echo "✅ Tariff configured"
echo ""

# Step 5: Sync consumption data
echo "5. Syncing consumption data..."
curl -s -X POST "$BASE_URL/consumption/sync" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "daysToSync": 7
  }' > /dev/null

echo "✅ Consumption data synced"
echo ""

# Step 6: Get advice for today
echo "6. Getting energy advice for today..."
ADVICE_TODAY=$(curl -s -X GET "$BASE_URL/daily-assistant/advice?date=today" \
  -H "Authorization: Bearer $TOKEN")

ADVICE_COUNT=$(echo $ADVICE_TODAY | grep -o '"title"' | wc -l)

echo "✅ Energy advice retrieved for today"
echo "Number of advice items: $ADVICE_COUNT"
echo ""

# Step 7: Get advice for tomorrow
echo "7. Getting energy advice for tomorrow..."
ADVICE_TOMORROW=$(curl -s -X GET "$BASE_URL/daily-assistant/advice?date=tomorrow" \
  -H "Authorization: Bearer $TOKEN")

echo "✅ Energy advice retrieved for tomorrow"
echo ""

# Display sample advice
echo "=== Sample Energy Advice ==="
echo $ADVICE_TODAY | python3 -m json.tool

echo ""
echo "=== Test Complete ==="

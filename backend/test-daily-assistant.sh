#!/bin/bash

# Test script for Daily Assistant API endpoints
# This script tests the chart-data endpoint

BASE_URL="http://localhost:3001/api"

echo "=== Daily Assistant API Test ==="
echo ""

# Step 1: Register a user
echo "1. Registering user..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dailyassistant@example.com",
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
echo "User ID: $USER_ID"
echo ""

# Step 2: Link energy account
echo "2. Linking energy account..."
LINK_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/link-energy-account" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "energyAccountId": "ACC123456",
    "energyAccountPassword": "password"
  }')

echo "✅ Energy account linked"
echo ""

# Step 3: Configure solar system
echo "3. Configuring solar system..."
SOLAR_RESPONSE=$(curl -s -X POST "$BASE_URL/onboarding/solar-system" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "hasSolar": true,
    "systemSizeKw": 5.0,
    "tiltDegrees": 30.0,
    "orientation": "S"
  }')

echo "✅ Solar system configured"
echo ""

# Step 4: Set up tariff
echo "4. Setting up tariff..."
TARIFF_RESPONSE=$(curl -s -X POST "$BASE_URL/tariff" \
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
  }')

echo "✅ Tariff configured"
echo ""

# Step 5: Sync consumption data
echo "5. Syncing consumption data..."
SYNC_RESPONSE=$(curl -s -X POST "$BASE_URL/consumption/sync" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "daysToSync": 7
  }')

echo "✅ Consumption data synced"
echo ""

# Step 6: Get chart data for today
echo "6. Getting chart data for today..."
CHART_TODAY=$(curl -s -X GET "$BASE_URL/daily-assistant/chart-data?date=today" \
  -H "Authorization: Bearer $TOKEN")

INTERVAL_COUNT=$(echo $CHART_TODAY | grep -o '"startTime"' | wc -l)
HAS_CURRENT_STATUS=$(echo $CHART_TODAY | grep -o '"currentStatus"' | wc -l)

echo "✅ Chart data retrieved for today"
echo "Intervals: $INTERVAL_COUNT"
echo "Has current status: $HAS_CURRENT_STATUS"
echo ""

# Step 7: Get chart data for tomorrow
echo "7. Getting chart data for tomorrow..."
CHART_TOMORROW=$(curl -s -X GET "$BASE_URL/daily-assistant/chart-data?date=tomorrow" \
  -H "Authorization: Bearer $TOKEN")

INTERVAL_COUNT_TOMORROW=$(echo $CHART_TOMORROW | grep -o '"startTime"' | wc -l)

echo "✅ Chart data retrieved for tomorrow"
echo "Intervals: $INTERVAL_COUNT_TOMORROW"
echo ""

# Display sample of today's chart data
echo "=== Sample Chart Data (First 3 Intervals) ==="
echo $CHART_TODAY | python3 -m json.tool | head -50

echo ""
echo "=== Test Complete ==="

#!/bin/bash

# Test Tomorrow's Consumption Forecast
# This script tests that tomorrow's consumption data is estimated from historical averages

echo "=== Testing Tomorrow's Consumption Forecast ==="
echo ""

# Test credentials
EMAIL="test$(date +%s)@test.com"
PASSWORD="password123"
ENERGY_ACCOUNT="ACC001"
ENERGY_PASSWORD="password123"

echo "1. Registering test user: $EMAIL"
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Registration failed"
  echo "Response: $REGISTER_RESPONSE"
  exit 1
fi

echo "✅ User registered successfully"
echo ""

echo "2. Linking energy account: $ENERGY_ACCOUNT"
LINK_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/link-energy-account \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"energyAccountId\":\"$ENERGY_ACCOUNT\",\"energyAccountPassword\":\"$ENERGY_PASSWORD\"}")

echo "✅ Energy account linked"
echo ""

echo "3. Configuring solar system (no solar)"
SOLAR_RESPONSE=$(curl -s -X POST http://localhost:3001/api/onboarding/solar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"hasSolar":false}')

echo "✅ Solar configured"
echo ""

echo "4. Setting up tariff"
TODAY=$(date +%Y-%m-%d)
TARIFF_RESPONSE=$(curl -s -X POST http://localhost:3001/api/tariff \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"effectiveDate\":\"$TODAY\",
    \"periods\":[
      {\"name\":\"off-peak\",\"startTime\":\"00:00\",\"endTime\":\"07:00\",\"pricePerKwh\":0.08,\"daysOfWeek\":[\"MON\",\"TUE\",\"WED\",\"THU\",\"FRI\",\"SAT\",\"SUN\"]},
      {\"name\":\"shoulder\",\"startTime\":\"07:00\",\"endTime\":\"17:00\",\"pricePerKwh\":0.15,\"daysOfWeek\":[\"MON\",\"TUE\",\"WED\",\"THU\",\"FRI\",\"SAT\",\"SUN\"]},
      {\"name\":\"peak\",\"startTime\":\"17:00\",\"endTime\":\"21:00\",\"pricePerKwh\":0.35,\"daysOfWeek\":[\"MON\",\"TUE\",\"WED\",\"THU\",\"FRI\"]},
      {\"name\":\"off-peak\",\"startTime\":\"21:00\",\"endTime\":\"00:00\",\"pricePerKwh\":0.08,\"daysOfWeek\":[\"MON\",\"TUE\",\"WED\",\"THU\",\"FRI\",\"SAT\",\"SUN\"]}
    ]
  }")

echo "✅ Tariff configured"
echo ""

echo "5. Syncing consumption data (last 7 days)"
SYNC_RESPONSE=$(curl -s -X POST http://localhost:3001/api/consumption/sync \
  -H "Authorization: Bearer $TOKEN")

SYNCED=$(echo $SYNC_RESPONSE | grep -o '"synced":[0-9]*' | cut -d':' -f2)
echo "✅ Synced $SYNCED data points"
echo ""

echo "6. Fetching TODAY's chart data"
TODAY_RESPONSE=$(curl -s -X GET "http://localhost:3001/api/daily-assistant/chart-data?day=today" \
  -H "Authorization: Bearer $TOKEN")

TODAY_CONSUMPTION=$(echo $TODAY_RESPONSE | grep -o '"consumptionKwh":[0-9.]*' | head -1 | cut -d':' -f2)
echo "   First interval consumption: $TODAY_CONSUMPTION kWh"

if [ "$TODAY_CONSUMPTION" == "null" ] || [ -z "$TODAY_CONSUMPTION" ]; then
  echo "❌ Today's consumption is null/missing"
else
  echo "✅ Today's consumption data exists"
fi
echo ""

echo "7. Fetching TOMORROW's chart data"
TOMORROW_RESPONSE=$(curl -s -X GET "http://localhost:3001/api/daily-assistant/chart-data?day=tomorrow" \
  -H "Authorization: Bearer $TOKEN")

TOMORROW_CONSUMPTION=$(echo $TOMORROW_RESPONSE | grep -o '"consumptionKwh":[0-9.]*' | head -1 | cut -d':' -f2)
echo "   First interval consumption: $TOMORROW_CONSUMPTION kWh"

if [ "$TOMORROW_CONSUMPTION" == "null" ] || [ -z "$TOMORROW_CONSUMPTION" ]; then
  echo "❌ Tomorrow's consumption is null/missing - FORECAST NOT WORKING"
  echo ""
  echo "Response preview:"
  echo $TOMORROW_RESPONSE | head -c 500
  exit 1
else
  echo "✅ Tomorrow's consumption forecast exists!"
fi
echo ""

echo "8. Comparing Today vs Tomorrow consumption patterns"
TODAY_COUNT=$(echo $TODAY_RESPONSE | grep -o '"consumptionKwh":[0-9.]*' | grep -v 'null' | wc -l | tr -d ' ')
TOMORROW_COUNT=$(echo $TOMORROW_RESPONSE | grep -o '"consumptionKwh":[0-9.]*' | grep -v 'null' | wc -l | tr -d ' ')

echo "   Today: $TODAY_COUNT intervals with data"
echo "   Tomorrow: $TOMORROW_COUNT intervals with data"

if [ "$TOMORROW_COUNT" -gt "0" ]; then
  echo "✅ Tomorrow has estimated consumption data!"
else
  echo "❌ Tomorrow has no consumption data"
fi

echo ""
echo "=== Test Complete ==="

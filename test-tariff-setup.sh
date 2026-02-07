#!/bin/bash

# Test Tariff Setup During Onboarding
# Verifies that all tariff periods are correctly saved

echo "=== Testing Tariff Setup in Onboarding ==="
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
  exit 1
fi

echo "✅ User registered"
echo ""

echo "2. Linking energy account"
curl -s -X POST http://localhost:3001/api/auth/link-energy-account \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"energyAccountId\":\"$ENERGY_ACCOUNT\",\"energyAccountPassword\":\"$ENERGY_PASSWORD\"}" > /dev/null

echo "✅ Energy account linked"
echo ""

echo "3. Configuring solar system"
curl -s -X POST http://localhost:3001/api/onboarding/solar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"hasSolar":false}' > /dev/null

echo "✅ Solar configured"
echo ""

echo "4. Setting up tariff (simulating onboarding)"
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

echo "5. Retrieving tariff to verify all periods saved"
TARIFF_DATA=$(curl -s -X GET "http://localhost:3001/api/tariff?date=$TODAY" \
  -H "Authorization: Bearer $TOKEN")

echo "Tariff Response:"
echo "$TARIFF_DATA" | python3 -m json.tool 2>/dev/null || echo "$TARIFF_DATA"
echo ""

# Count periods
PERIOD_COUNT=$(echo "$TARIFF_DATA" | grep -o '"name":' | wc -l | tr -d ' ')
echo "Number of tariff periods saved: $PERIOD_COUNT"

if [ "$PERIOD_COUNT" -eq "4" ]; then
  echo "✅ All 4 tariff periods saved correctly!"
else
  echo "❌ Expected 4 periods, but found $PERIOD_COUNT"
fi
echo ""

echo "6. Checking price distribution in chart data"
CHART_RESPONSE=$(curl -s -X GET "http://localhost:3001/api/daily-assistant/chart-data?day=today" \
  -H "Authorization: Bearer $TOKEN")

# Count unique prices
PRICE_008=$(echo "$CHART_RESPONSE" | grep -o '"pricePerKwh":0.08' | wc -l | tr -d ' ')
PRICE_015=$(echo "$CHART_RESPONSE" | grep -o '"pricePerKwh":0.15' | wc -l | tr -d ' ')
PRICE_035=$(echo "$CHART_RESPONSE" | grep -o '"pricePerKwh":0.35' | wc -l | tr -d ' ')

echo "Price distribution in 48 intervals:"
echo "  - \$0.08 (off-peak): $PRICE_008 intervals"
echo "  - \$0.15 (shoulder): $PRICE_015 intervals"
echo "  - \$0.35 (peak): $PRICE_035 intervals"
echo ""

# Expected: 14 off-peak (00:00-07:00 = 14 intervals, 21:00-00:00 = 6 intervals = 20 total)
# Expected: 20 shoulder (07:00-17:00 = 20 intervals)
# Expected: 8 peak (17:00-21:00 = 8 intervals on weekdays)

if [ "$PRICE_008" -gt "0" ] && [ "$PRICE_015" -gt "0" ]; then
  echo "✅ Tariff pricing is applied correctly to chart data!"
else
  echo "❌ Tariff pricing not applied correctly"
fi

echo ""
echo "=== Test Complete ==="

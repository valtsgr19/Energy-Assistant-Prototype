#!/bin/bash

# Test to verify monthly consumption is around 700 kWh

echo "🧪 Testing Monthly Consumption Total"
echo "====================================="
echo ""

# Backend URL
BACKEND_URL="https://energy-assistant-prototype-production.up.railway.app"

# Test credentials
EMAIL="test-consumption-$(date +%s)@example.com"
PASSWORD="TestPassword123"

echo "📝 Step 1: Register new user"
REGISTER_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get token"
  exit 1
fi

echo "✅ User registered: $EMAIL"
echo ""

echo "⏳ Step 2: Wait 3 seconds for seeding..."
sleep 3
echo ""

echo "📊 Step 3: Fetch energy insights"
INSIGHTS=$(curl -s -X GET "$BACKEND_URL/api/energy-insights" \
  -H "Authorization: Bearer $TOKEN")

echo "Response (first 500 chars):"
echo "$INSIGHTS" | head -c 500
echo ""
echo ""

echo "🔍 Step 4: Extract monthly consumption"
MONTHLY_TOTAL=$(echo "$INSIGHTS" | grep -o '"totalKwh":[0-9.]*' | head -1 | cut -d':' -f2)

if [ -z "$MONTHLY_TOTAL" ]; then
  echo "❌ Could not extract monthly consumption"
  exit 1
fi

echo "Monthly Consumption: $MONTHLY_TOTAL kWh"
echo ""

# Check if it's around 700 kWh (allow 650-750 range)
if (( $(echo "$MONTHLY_TOTAL >= 650" | bc -l) )) && (( $(echo "$MONTHLY_TOTAL <= 750" | bc -l) )); then
  echo "✅ Monthly consumption is within target range (650-750 kWh)"
else
  echo "⚠️  Monthly consumption is outside target range"
  echo "   Target: ~700 kWh"
  echo "   Actual: $MONTHLY_TOTAL kWh"
fi

echo ""
echo "====================================="
echo "✅ Test complete!"

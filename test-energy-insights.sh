#!/bin/bash

# Test Energy Insights API Endpoints
# This script tests the new energy insights functionality

echo "🧪 Testing Energy Insights API"
echo "================================"
echo ""

# Backend URL
API_URL="http://localhost:3001/api"

# Test credentials (assuming test user exists)
EMAIL="test@example.com"
PASSWORD="password123"

echo "1️⃣  Testing Authentication..."
AUTH_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $AUTH_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Authentication failed. Creating test user..."
  
  # Register new user
  REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
  
  TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  
  if [ -z "$TOKEN" ]; then
    echo "❌ Failed to create test user"
    exit 1
  fi
  
  echo "✅ Test user created"
else
  echo "✅ Authentication successful"
fi

echo ""
echo "2️⃣  Testing Energy Insights - Full Endpoint..."
INSIGHTS_RESPONSE=$(curl -s -X GET "$API_URL/energy-insights" \
  -H "Authorization: Bearer $TOKEN")

echo "$INSIGHTS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$INSIGHTS_RESPONSE"

if echo "$INSIGHTS_RESPONSE" | grep -q "disaggregation"; then
  echo "✅ Energy Insights endpoint working"
else
  echo "❌ Energy Insights endpoint failed"
fi

echo ""
echo "3️⃣  Testing Consumption Disaggregation..."
DISAGG_RESPONSE=$(curl -s -X GET "$API_URL/energy-insights/disaggregation" \
  -H "Authorization: Bearer $TOKEN")

echo "$DISAGG_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$DISAGG_RESPONSE"

if echo "$DISAGG_RESPONSE" | grep -q "totalKwh"; then
  echo "✅ Disaggregation endpoint working"
else
  echo "❌ Disaggregation endpoint failed"
fi

echo ""
echo "4️⃣  Testing Solar Performance..."
SOLAR_RESPONSE=$(curl -s -X GET "$API_URL/energy-insights/solar-performance" \
  -H "Authorization: Bearer $TOKEN")

echo "$SOLAR_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$SOLAR_RESPONSE"

if echo "$SOLAR_RESPONSE" | grep -q "null\|totalGenerationKwh"; then
  echo "✅ Solar Performance endpoint working"
else
  echo "❌ Solar Performance endpoint failed"
fi

echo ""
echo "5️⃣  Testing Household Comparison..."
HOUSEHOLD_RESPONSE=$(curl -s -X GET "$API_URL/energy-insights/household-comparison" \
  -H "Authorization: Bearer $TOKEN")

echo "$HOUSEHOLD_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$HOUSEHOLD_RESPONSE"

if echo "$HOUSEHOLD_RESPONSE" | grep -q "personality"; then
  echo "✅ Household Comparison endpoint working"
else
  echo "❌ Household Comparison endpoint failed"
fi

echo ""
echo "================================"
echo "✅ All Energy Insights API tests complete!"
echo ""
echo "📱 Frontend is running at: http://localhost:3000"
echo "🔧 Backend is running at: http://localhost:3001"
echo ""
echo "Next steps:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Complete onboarding or login"
echo "3. Navigate to Energy Insights tab"
echo "4. Verify all three sections display correctly"

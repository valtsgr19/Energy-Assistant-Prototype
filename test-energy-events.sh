#!/bin/bash

# Test Energy Events API
# This script tests if energy events are being returned correctly

echo "🧪 Testing Energy Events API"
echo "================================"
echo ""

# Backend URL
BACKEND_URL="https://energy-assistant-prototype-production.up.railway.app"

# Test credentials
EMAIL="test-events-$(date +%s)@example.com"
PASSWORD="TestPassword123"

echo "📝 Step 1: Register new user"
echo "Email: $EMAIL"
REGISTER_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

echo "Response: $REGISTER_RESPONSE"
TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get token"
  exit 1
fi

echo "✅ Got token: ${TOKEN:0:20}..."
echo ""

echo "⏳ Step 2: Wait 3 seconds for seeding to complete..."
sleep 3
echo ""

echo "📊 Step 3: Fetch today's chart data"
CHART_DATA=$(curl -s -X GET "$BACKEND_URL/api/daily-assistant/chart-data?date=today" \
  -H "Authorization: Bearer $TOKEN")

echo "Chart data response (first 500 chars):"
echo "$CHART_DATA" | head -c 500
echo ""
echo ""

echo "🔍 Step 4: Check for energy events"
EVENT_COUNT=$(echo "$CHART_DATA" | grep -o '"energyEvents":\[' | wc -l)
if [ "$EVENT_COUNT" -gt 0 ]; then
  echo "✅ Energy events array found in response"
  
  # Extract and display energy events
  echo ""
  echo "Energy events details:"
  echo "$CHART_DATA" | grep -o '"energyEvents":\[[^]]*\]' | head -c 1000
  echo ""
else
  echo "❌ No energy events found in response"
fi

echo ""
echo "🔍 Step 5: Check for red shading (event indicators)"
RED_COUNT=$(echo "$CHART_DATA" | grep -o '"shading":"red"' | wc -l)
echo "Number of intervals with red shading: $RED_COUNT"

if [ "$RED_COUNT" -gt 0 ]; then
  echo "✅ Found $RED_COUNT intervals marked with energy events"
else
  echo "⚠️  No intervals marked with red shading (might be no events today)"
fi

echo ""
echo "📊 Step 6: Fetch tomorrow's chart data"
TOMORROW_DATA=$(curl -s -X GET "$BACKEND_URL/api/daily-assistant/chart-data?date=tomorrow" \
  -H "Authorization: Bearer $TOKEN")

TOMORROW_EVENT_COUNT=$(echo "$TOMORROW_DATA" | grep -o '"energyEvents":\[' | wc -l)
TOMORROW_RED_COUNT=$(echo "$TOMORROW_DATA" | grep -o '"shading":"red"' | wc -l)

echo "Tomorrow's energy events: $TOMORROW_EVENT_COUNT array(s) found"
echo "Tomorrow's red intervals: $TOMORROW_RED_COUNT"

echo ""
echo "================================"
echo "✅ Test complete!"
echo ""
echo "Summary:"
echo "- User created: $EMAIL"
echo "- Today's events: $EVENT_COUNT array(s)"
echo "- Today's red intervals: $RED_COUNT"
echo "- Tomorrow's events: $TOMORROW_EVENT_COUNT array(s)"
echo "- Tomorrow's red intervals: $TOMORROW_RED_COUNT"
echo ""
echo "Event Time Windows:"
echo "- INCREASE events: 10:00-14:00 (max 2 hours)"
echo "- DECREASE events: 18:00-22:00 (max 2 hours)"

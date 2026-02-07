#!/bin/bash

# Test auto-seeding for new users
echo "Testing auto-seed functionality..."
echo ""

# Generate a random email
RANDOM_EMAIL="test$(date +%s)@example.com"
echo "Creating new user: $RANDOM_EMAIL"
echo ""

# Register new user
RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$RANDOM_EMAIL\",\"password\":\"password123\"}")

echo "Registration response:"
echo "$RESPONSE" | python3 -m json.tool
echo ""

# Extract token and userId
TOKEN=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])" 2>/dev/null)
USER_ID=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['userId'])" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "❌ Registration failed!"
  exit 1
fi

echo "✅ User created successfully!"
echo "User ID: $USER_ID"
echo ""

# Wait a moment for seeding to complete
sleep 2

# Check if data was seeded
echo "Checking if demo data was seeded..."
echo ""

# Check solar system
SOLAR=$(curl -s "http://localhost:3001/api/settings/profile" \
  -H "Authorization: Bearer $TOKEN" | python3 -c "import sys, json; data = json.load(sys.stdin); print('Solar:', data['solarSystem']['hasSolar'])" 2>/dev/null)

echo "$SOLAR"

# Check consumption data count
CHART_DATA=$(curl -s "http://localhost:3001/api/daily-assistant/chart-data?date=today" \
  -H "Authorization: Bearer $TOKEN")

INTERVALS=$(echo "$CHART_DATA" | python3 -c "import sys, json; data = json.load(sys.stdin); print('Intervals:', len(data['intervals']))" 2>/dev/null)
echo "$INTERVALS"

NON_NULL=$(echo "$CHART_DATA" | python3 -c "import sys, json; data = json.load(sys.stdin); count = sum(1 for i in data['intervals'] if i['consumptionKwh'] is not None); print('Non-null consumption:', count)" 2>/dev/null)
echo "$NON_NULL"

echo ""
echo "✅ Auto-seed test complete!"
echo ""
echo "You can now login with:"
echo "Email: $RANDOM_EMAIL"
echo "Password: password123"

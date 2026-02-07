#!/bin/bash

echo "🧪 Pre-Deployment Test Suite"
echo "============================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected=$3
    
    echo -n "Testing $name... "
    response=$(curl -s "$url")
    
    if echo "$response" | grep -q "$expected"; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}"
        echo "  Expected: $expected"
        echo "  Got: $response"
        ((FAILED++))
    fi
}

echo "1️⃣  Testing Backend..."
echo "--------------------"

# Test health endpoint
test_endpoint "Health check" "http://localhost:3001/health" "ok"

# Test registration
echo -n "Testing registration... "
RANDOM_EMAIL="test$(date +%s)@example.com"
REG_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$RANDOM_EMAIL\",\"password\":\"password123\"}")

if echo "$REG_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((PASSED++))
    
    # Extract token
    TOKEN=$(echo "$REG_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])" 2>/dev/null)
    
    # Test auto-seeding
    echo -n "Testing auto-seed... "
    sleep 2
    CHART_RESPONSE=$(curl -s "http://localhost:3001/api/daily-assistant/chart-data?date=today" \
      -H "Authorization: Bearer $TOKEN")
    
    if echo "$CHART_RESPONSE" | grep -q "intervals"; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}"
        ((FAILED++))
    fi
else
    echo -e "${RED}✗ FAIL${NC}"
    echo "  Response: $REG_RESPONSE"
    ((FAILED++))
fi

echo ""
echo "2️⃣  Testing Frontend..."
echo "--------------------"

# Test frontend is running
test_endpoint "Frontend running" "http://localhost:3000" "html"

echo ""
echo "3️⃣  Checking Configuration..."
echo "-------------------------"

# Check .env.example files exist
echo -n "Backend .env.example... "
if [ -f "backend/.env.example" ]; then
    echo -e "${GREEN}✓ EXISTS${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ MISSING${NC}"
    ((FAILED++))
fi

echo -n "Frontend .env.example... "
if [ -f "frontend/.env.example" ]; then
    echo -e "${GREEN}✓ EXISTS${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ MISSING${NC}"
    ((FAILED++))
fi

# Check deployment files
echo -n "Deployment configs... "
if [ -f "vercel.json" ] && [ -f "railway.toml" ]; then
    echo -e "${GREEN}✓ EXISTS${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ MISSING${NC}"
    ((FAILED++))
fi

echo ""
echo "4️⃣  Checking Git..."
echo "----------------"

echo -n "Git initialized... "
if [ -d ".git" ]; then
    echo -e "${GREEN}✓ YES${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ NO${NC} (run: git init)"
    ((FAILED++))
fi

echo -n ".gitignore exists... "
if [ -f ".gitignore" ]; then
    echo -e "${GREEN}✓ YES${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ NO${NC}"
    ((FAILED++))
fi

echo ""
echo "📊 Test Results"
echo "==============="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed! Ready for deployment.${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Commit your code: git add . && git commit -m 'Ready for deployment'"
    echo "  2. Push to GitHub"
    echo "  3. Follow DEPLOYMENT_CHECKLIST.md"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Fix issues before deploying.${NC}"
    exit 1
fi

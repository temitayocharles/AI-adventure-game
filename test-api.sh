#!/bin/bash

# Get a token
TOKEN=$(curl -s -X POST http://localhost:4000/api/v1/auth/demo-login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser789"}' | jq -r '.token')

echo "Token obtained: ${TOKEN:0:20}..."
echo ""

# Test 1: Get levels without token (should fail)
echo "=== TEST 4: GET /players/me/levels WITHOUT token ==="
RESULT=$(curl -s http://localhost:4000/api/v1/players/me/levels)
if echo "$RESULT" | grep -q "error\|Unauthorized\|unauthorized"; then
  echo "✅ PASS: Endpoint requires token"
  echo "Response: $RESULT"
else
  echo "❌ FAIL: Endpoint should require token"
  echo "Response: $RESULT"
fi

echo ""
echo "=== TEST 5: GET /players/me/levels WITH token ==="
RESULT=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/v1/players/me/levels?worldId=1)
echo "$RESULT" | jq .

if echo "$RESULT" | grep -q "levels"; then
  echo "✅ PASS: Per-player levels returned"
  
  # Check if first level is unlocked
  UNLOCKED=$(echo "$RESULT" | jq '.levels[0].unlocked' 2>/dev/null)
  if [ "$UNLOCKED" = "true" ]; then
    echo "✅ PASS: First level is unlocked by default"
  else
    echo "❌ FAIL: First level should be unlocked"
  fi
else
  echo "❌ FAIL: Should return levels"
fi

#!/bin/bash

echo "=== COMPREHENSIVE API TESTING ==="
echo ""

# Test 6: Level completion
echo "TEST 6: Level completion and unlock"
TOKEN=$(curl -s -X POST http://localhost:4000/api/v1/auth/demo-login \
  -H "Content-Type: application/json" \
  -d '{"username":"testlevelcomp"}' | jq -r '.token')

INITIAL=$(curl -s -H "Authorization: Bearer $TOKEN" 'http://localhost:4000/api/v1/players/me/levels?worldId=1')
LEVEL1_ID=$(echo "$INITIAL" | jq '.levels[0].id' -r)

echo "Level 1 ID: $LEVEL1_ID"
COMPLETE=$(curl -s -X POST "http://localhost:4000/api/v1/players/me/levels/$LEVEL1_ID/complete" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}')

echo "Completion response:"
echo "$COMPLETE" | jq .

if echo "$COMPLETE" | jq -e '.completed == true' > /dev/null 2>&1; then
  echo "✅ PASS: Level completed"
else
  echo "❌ FAIL: Level not completed"
fi

echo ""
echo "Checking if level 2 unlocked..."
AFTER=$(curl -s -H "Authorization: Bearer $TOKEN" 'http://localhost:4000/api/v1/players/me/levels?worldId=1')
LEVEL2_UNLOCKED=$(echo "$AFTER" | jq '.levels[1].unlocked')
echo "Level 2 unlocked: $LEVEL2_UNLOCKED"

if [ "$LEVEL2_UNLOCKED" = "true" ]; then
  echo "✅ PASS: Level 2 unlocked after level 1 completion"
else
  echo "❌ FAIL: Level 2 should be unlocked"
fi

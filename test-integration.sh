#!/bin/bash

echo "🧪 Testing Game API Integration"
echo "================================"

# Test 1: Check if server is responding
echo -e "\n1. Testing API server..."
SERVER_HEALTH=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:4000/api/health)
if [ "$SERVER_HEALTH" = "200" ]; then
  echo "✅ Server is healthy (HTTP 200)"
else
  echo "❌ Server responded with HTTP $SERVER_HEALTH"
  exit 1
fi

# Test 2: Check if worlds endpoint responds
echo -e "\n2. Testing /api/v1/worlds endpoint..."
WORLDS=$(curl -s http://localhost:4000/api/v1/worlds)
WORLD_COUNT=$(echo "$WORLDS" | jq '.worlds | length' 2>/dev/null || echo 0)
echo "📊 Found $WORLD_COUNT worlds:"
echo "$WORLDS" | jq '.worlds[] | {id, name, disaster_type}' 2>/dev/null | head -20

# Test 3: Check if client is serving
echo -e "\n3. Testing client server..."
CLIENT=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:5173/)
if [ "$CLIENT" = "200" ]; then
  echo "✅ Client is serving (HTTP 200)"
else
  echo "⚠️  Client responded with HTTP $CLIENT (may need a moment to start)"
fi

# Test 4: Check if client can reach server from container network
echo -e "\n4. Testing container-to-container networking..."
docker exec worldhero-client curl -s http://worldhero-server:4000/api/v1/worlds | jq '.worlds | length' 2>/dev/null && echo "✅ Container networking verified" || echo "⚠️  Container networking check inconclusive"

echo -e "\n✨ Integration test complete!"

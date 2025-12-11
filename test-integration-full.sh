#!/bin/bash
# test-integration.sh
# Comprehensive integration test suite for all game stages
# Tests: AI integration, multiplayer, mobile, advanced features

set -e

echo "=========================================="
echo "🎮 World Hero Adventures - Integration Tests"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Helper functions
test_start() {
  echo -e "${BLUE}📋 Testing: $1${NC}"
}

test_pass() {
  echo -e "${GREEN}✅ PASS: $1${NC}"
  ((TESTS_PASSED++))
}

test_fail() {
  echo -e "${RED}❌ FAIL: $1${NC}"
  ((TESTS_FAILED++))
}

# Check if services are running
check_services() {
  test_start "Checking services"
  
  # Check frontend build
  if npm run build > /dev/null 2>&1; then
    test_pass "Frontend builds successfully"
  else
    test_fail "Frontend build failed"
  fi

  # Check for required files
  if [ -f "services/levelEngine.ts" ]; then
    test_pass "LevelEngine service exists"
  else
    test_fail "LevelEngine service missing"
  fi

  if [ -f "services/aiService.ts" ]; then
    test_pass "AI service exists"
  else
    test_fail "AI service missing"
  fi

  if [ -f "services/gameAPI.ts" ]; then
    test_pass "Game API service exists"
  else
    test_fail "Game API service missing"
  fi

  if [ -f "services/responsiveCanvas.ts" ]; then
    test_pass "Responsive canvas service exists"
  else
    test_fail "Responsive canvas service missing"
  fi

  if [ -f "services/analyticsService.ts" ]; then
    test_pass "Analytics service exists"
  else
    test_fail "Analytics service missing"
  fi
}

# Test Stage 7: AI Integration
test_stage_7_ai() {
  test_start "Stage 7: AI Integration"
  
  # Check fallback implementations
  if grep -q "FALLBACK_QUESTS" services/aiServiceFallbacks.ts 2>/dev/null; then
    test_pass "AI fallbacks implemented"
  else
    test_fail "AI fallbacks not found"
  fi

  if grep -q "chatWithNPC" services/aiService.ts; then
    test_pass "NPC chat service exists"
  else
    test_fail "NPC chat service missing"
  fi

  if grep -q "getAdaptiveDifficulty" services/aiService.ts; then
    test_pass "Adaptive difficulty service exists"
  else
    test_fail "Adaptive difficulty service missing"
  fi

  if grep -q "generateDynamicLevel" services/aiService.ts; then
    test_pass "Dynamic level generation exists"
  else
    test_fail "Dynamic level generation missing"
  fi

  if grep -q "fallback: true" server/routes/ai.js 2>/dev/null || [ -f "FALLBACK_IMPLEMENTATION.md" ]; then
    test_pass "Fallback system documented"
  else
    test_fail "Fallback system documentation missing"
  fi
}

# Test Stage 8: Frontend Integration
test_stage_8_frontend() {
  test_start "Stage 8: Frontend Integration"
  
  if grep -q "LevelEngine" views/LevelView.tsx; then
    test_pass "LevelView uses LevelEngine"
  else
    test_fail "LevelView not using LevelEngine"
  fi

  if grep -q "gameAPI" views/LevelView.tsx; then
    test_pass "LevelView uses gameAPI"
  else
    test_fail "LevelView not using gameAPI"
  fi

  if grep -q "aiService" views/LevelView.tsx; then
    test_pass "LevelView uses aiService"
  else
    test_fail "LevelView not using aiService"
  fi
}

# Test Stage 6: Multiplayer
test_stage_6_multiplayer() {
  test_start "Stage 6: Multiplayer"
  
  if [ -f "components/MultiplayerLeaderboard.tsx" ]; then
    test_pass "Multiplayer leaderboard component exists"
  else
    test_fail "Multiplayer leaderboard component missing"
  fi

  if grep -q "WebSocket\|socket" server/index.js 2>/dev/null || [ -f "server/middleware/auth.js" ]; then
    test_pass "Multiplayer infrastructure configured"
  else
    test_fail "Multiplayer infrastructure missing"
  fi
}

# Test Stage 9: Mobile Optimization
test_stage_9_mobile() {
  test_start "Stage 9: Mobile Optimization"
  
  if [ -f "components/MobileControls.tsx" ]; then
    test_pass "Mobile controls component exists"
  else
    test_fail "Mobile controls component missing"
  fi

  if grep -q "MobileControls" views/LevelView.tsx; then
    test_pass "LevelView integrates mobile controls"
  else
    test_fail "LevelView missing mobile controls"
  fi

  if [ -f "services/responsiveCanvas.ts" ]; then
    test_pass "Responsive canvas manager exists"
  else
    test_fail "Responsive canvas manager missing"
  fi

  if grep -q "ResponsiveCanvasManager" views/LevelView.tsx; then
    test_pass "LevelView uses responsive canvas"
  else
    test_fail "LevelView missing responsive canvas"
  fi

  if grep -q "devicePixelRatio\|orientation" services/responsiveCanvas.ts; then
    test_pass "DPI and orientation handling implemented"
  else
    test_fail "DPI/orientation handling missing"
  fi
}

# Test Stage 10: Advanced Features
test_stage_10_advanced() {
  test_start "Stage 10: Advanced Features"
  
  # Achievements
  if [ -f "components/AchievementsModal.tsx" ]; then
    test_pass "Achievements UI component exists"
  else
    test_fail "Achievements UI component missing"
  fi

  # Crafting
  if [ -f "components/CraftingModal.tsx" ]; then
    test_pass "Crafting UI component exists"
  else
    test_fail "Crafting UI component missing"
  fi

  # Friends
  if [ -f "components/FriendsModal.tsx" ]; then
    test_pass "Friends UI component exists"
  else
    test_fail "Friends UI component missing"
  fi

  # Analytics
  if [ -f "services/analyticsService.ts" ]; then
    test_pass "Analytics service exists"
  else
    test_fail "Analytics service missing"
  fi

  if grep -q "trackEvent\|trackLevelComplete" services/analyticsService.ts; then
    test_pass "Event tracking implemented"
  else
    test_fail "Event tracking missing"
  fi
}

# Test TypeScript Compilation
test_typescript() {
  test_start "TypeScript Compilation"
  
  if npx tsc --noEmit > /dev/null 2>&1; then
    test_pass "All TypeScript files compile without errors"
  else
    test_fail "TypeScript compilation errors found"
    npx tsc --noEmit 2>&1 | head -10
  fi
}

# Test Database
test_database() {
  test_start "Database Configuration"
  
  if [ -d "server/db" ]; then
    test_pass "Database migration files exist"
  else
    test_fail "Database migrations missing"
  fi

  if [ -f "server/db/01-schema.sql" ]; then
    test_pass "Core schema migration exists"
  else
    test_fail "Schema migration missing"
  fi

  if [ -f "server/db/06-achievements.sql" ]; then
    test_pass "Achievements schema migration exists"
  else
    test_fail "Achievements migration missing"
  fi
}

# Test Docker Configuration
test_docker() {
  test_start "Docker Configuration"
  
  if [ -f "docker-compose.yml" ]; then
    test_pass "Docker Compose configuration exists"
  else
    test_fail "Docker Compose configuration missing"
  fi

  if [ -f "Dockerfile.client" ]; then
    test_pass "Client Dockerfile exists"
  else
    test_fail "Client Dockerfile missing"
  fi

  if [ -f "server/Dockerfile" ]; then
    test_pass "Server Dockerfile exists"
  else
    test_fail "Server Dockerfile missing"
  fi
}

# Main test execution
echo ""
check_services
echo ""
test_stage_7_ai
echo ""
test_stage_8_frontend
echo ""
test_stage_6_multiplayer
echo ""
test_stage_9_mobile
echo ""
test_stage_10_advanced
echo ""
test_typescript
echo ""
test_database
echo ""
test_docker

# Summary
echo ""
echo "=========================================="
echo "📊 Test Summary"
echo "=========================================="
echo -e "${GREEN}✅ Passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Failed: $TESTS_FAILED${NC}"
TOTAL=$((TESTS_PASSED + TESTS_FAILED))
echo -e "📈 Total: $TOTAL tests"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 All integration tests passed!${NC}"
  exit 0
else
  echo -e "${RED}⚠️  Some tests failed. Review output above.${NC}"
  exit 1
fi

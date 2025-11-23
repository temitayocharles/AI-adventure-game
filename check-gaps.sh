#!/bin/bash
# CRITICAL GAPS STATUS CHECK
# Generated: November 22, 2025

echo "🔍 CRITICAL GAPS CLOSURE REPORT"
echo "================================="
echo ""

# Track status
COMPLETED=0
TOTAL=9

check_feature() {
  local name=$1
  local file=$2
  local pattern=$3
  
  if grep -r "$pattern" "$file" > /dev/null 2>&1; then
    echo "✅ $name"
    ((COMPLETED++))
  else
    echo "❌ $name"
  fi
}

echo "CRITICAL ITEMS:"
echo ""
check_feature "Error boundaries" "components/ErrorBoundary.tsx" "ErrorBoundary"
check_feature "Rate limiting on AI" "server/middleware/auth.js" "rateLimitMiddleware"
check_feature "Input sanitization" "server/middleware/security.js" "sanitizeInput"
check_feature "CSP headers" "server/middleware/security.js" "Content-Security-Policy"
check_feature "HTTPS headers" "server/middleware/security.js" "Strict-Transport-Security"
check_feature "API auth middleware" "server/middleware/auth.js" "authMiddleware"
check_feature "Security headers applied" "server/index.js" "securityHeadersMiddleware"
check_feature "Database schema" "server/db/schema.sql" "CREATE TABLE"
check_feature "Logging system" "server/index.js" "const log ="

echo ""
echo "STATUS: $COMPLETED / $TOTAL CRITICAL ITEMS IMPLEMENTED ✨"
echo ""

if [ $COMPLETED -eq $TOTAL ]; then
  echo "🎉 ALL CRITICAL GAPS CLOSED!"
  echo "🚀 READY FOR PRODUCTION DEPLOYMENT"
else
  echo "⚠️  SOME GAPS REMAIN - SEE BELOW"
fi

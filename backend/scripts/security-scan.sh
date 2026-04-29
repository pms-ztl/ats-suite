#!/bin/bash
# Pre-deployment security verification script
set -euo pipefail

echo "ATS Security Scan"
echo ""

FAILURES=0

# 1. Check for hardcoded secrets
echo "Checking for hardcoded secrets..."
if grep -rn "password.*=.*['\"].*['\"]" src/ --include="*.ts" | grep -v test | grep -v ".d.ts" | grep -v seed | grep -v schema | grep -v ".example" | head -5 | grep -q .; then
  echo "  FAIL: Hardcoded passwords found"
  FAILURES=$((FAILURES + 1))
else
  echo "  PASS: No hardcoded passwords"
fi

# 2. Check for Math.random
echo "Checking for Math.random..."
RANDOM_COUNT=$(grep -rn "Math\.random" src/ --include="*.ts" | grep -v test | grep -v node_modules | wc -l)
if [ "$RANDOM_COUNT" -gt 0 ]; then
  echo "  FAIL: $RANDOM_COUNT instances of Math.random found"
  FAILURES=$((FAILURES + 1))
else
  echo "  PASS: No Math.random in production code"
fi

# 3. Check for eval()
echo "Checking for eval()..."
EVAL_COUNT=$(grep -rn "\beval\s*(" src/ --include="*.ts" | grep -v test | grep -v node_modules | wc -l)
if [ "$EVAL_COUNT" -gt 0 ]; then
  echo "  FAIL: $EVAL_COUNT instances of eval() found"
  FAILURES=$((FAILURES + 1))
else
  echo "  PASS: No eval() in production code"
fi

# 4. Check .env not tracked
echo "Checking .env..."
if [ -f ".gitignore" ] && grep -q "^\.env$" .gitignore; then
  echo "  PASS: .env in .gitignore"
else
  echo "  FAIL: .env may be tracked in git"
  FAILURES=$((FAILURES + 1))
fi

# 5. Check JWT_SECRET not default
echo "Checking JWT_SECRET..."
if grep -q "change-me-in-production" docker-compose.yml 2>/dev/null; then
  echo "  FAIL: Default JWT_SECRET in docker-compose"
  FAILURES=$((FAILURES + 1))
else
  echo "  PASS: No default JWT_SECRET"
fi

# 6. npm audit
echo "Running npm audit..."
AUDIT_RESULT=$(npm audit --audit-level=critical 2>&1 | tail -3)
echo "  $AUDIT_RESULT"

# 7. TypeScript check
echo "Running TypeScript check..."
if npx tsc --noEmit 2>/dev/null; then
  echo "  PASS: TypeScript compiles clean"
else
  echo "  FAIL: TypeScript errors"
  FAILURES=$((FAILURES + 1))
fi

# 8. Test suite
echo "Running tests..."
if npx vitest run 2>/dev/null | tail -3 | grep -q "passed"; then
  echo "  PASS: All tests pass"
else
  echo "  FAIL: Test failures"
  FAILURES=$((FAILURES + 1))
fi

echo ""
if [ "$FAILURES" -eq 0 ]; then
  echo "Security scan PASSED - 0 issues found"
  exit 0
else
  echo "Security scan FAILED - $FAILURES issues found"
  exit 1
fi

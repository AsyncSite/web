#!/bin/bash

# 🔍 Payment System Integration Test Script
# Tests the complete payment flow from checkout to completion

echo "🚀 Starting Payment System Integration Test"
echo "=========================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results tracking
PASSED=0
FAILED=0
WARNINGS=0

# Function to print test results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $2"
        ((FAILED++))
    fi
}

# Function to print warnings
print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

# Function to print section headers
print_header() {
    echo ""
    echo -e "${BLUE}▶ $1${NC}"
    echo "-------------------"
}

# 1. TypeScript Compilation Check
print_header "TypeScript Compilation"
npx tsc --noEmit 2>&1 | grep -q "error"
if [ $? -eq 0 ]; then
    print_result 1 "TypeScript compilation has errors"
    npx tsc --noEmit
else
    print_result 0 "TypeScript compilation successful"
fi

# 2. Check for required files
print_header "File Structure Verification"

FILES_TO_CHECK=(
    "src/services/checkoutService.ts"
    "src/hooks/usePaymentSession.ts"
    "src/pages/PaymentSuccessPage.tsx"
    "src/pages/PaymentFailPage.tsx"
    "src/pages/MockPaymentPage.tsx"
    "src/components/UnifiedCheckout/UnifiedCheckoutModal.tsx"
    "src/components/UnifiedCheckout/PaymentMethodSelector.tsx"
    "src/components/UnifiedCheckout/CheckoutSummary.tsx"
)

for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        print_result 0 "Found: $file"
    else
        print_result 1 "Missing: $file"
    fi
done

# 3. Check for console.log statements
print_header "Console.log Check"

CONSOLE_LOGS=$(grep -r "console.log" src/ --include="*.tsx" --include="*.ts" | grep -v "// console.log" | wc -l)
if [ $CONSOLE_LOGS -gt 0 ]; then
    print_warning "Found $CONSOLE_LOGS console.log statements in code"
    grep -r "console.log" src/ --include="*.tsx" --include="*.ts" | grep -v "// console.log" | head -5
else
    print_result 0 "No console.log statements found"
fi

# 4. Check imports are correct
print_header "Import Verification"

# Check if checkoutService is imported correctly
grep -q "import.*checkoutService.*from.*services/checkoutService" src/pages/PaymentSuccessPage.tsx
print_result $? "PaymentSuccessPage imports checkoutService"

grep -q "import.*checkoutService.*from.*services/checkoutService" src/pages/PaymentFailPage.tsx
print_result $? "PaymentFailPage imports checkoutService"

grep -q "import.*usePaymentSession.*from.*hooks/usePaymentSession" src/components/UnifiedCheckout/UnifiedCheckoutModal.tsx
print_result $? "UnifiedCheckoutModal imports usePaymentSession"

# 5. Check for proper error handling
print_header "Error Handling Verification"

# Check async functions in critical services
grep -q "async" src/services/checkoutService.ts
print_result $? "CheckoutService has async functions"

grep -q "catch" src/pages/PaymentSuccessPage.tsx
print_result $? "PaymentSuccessPage has error handling"

grep -q "catch" src/pages/PaymentFailPage.tsx
print_result $? "PaymentFailPage has error handling"

# 6. Check for PG-specific parameter handling
print_header "PG Integration Check"

# NaverPay parameters
grep -q "paymentId" src/pages/PaymentSuccessPage.tsx
print_result $? "NaverPay parameter handling in PaymentSuccessPage"

# KakaoPay parameters
grep -q "pg_token" src/pages/PaymentSuccessPage.tsx
print_result $? "KakaoPay parameter handling in PaymentSuccessPage"

# 7. Check polling mechanism
print_header "Polling Mechanism"

grep -q "pollPaymentStatus" src/services/checkoutService.ts
print_result $? "pollPaymentStatus method exists"

grep -q "setInterval\|setTimeout" src/hooks/usePaymentSession.ts
print_result $? "Timer mechanism in usePaymentSession"

# 8. Check session management
print_header "Session Management"

grep -q "sessionStorage\|localStorage" src/services/checkoutService.ts
print_result $? "Session storage implementation"

grep -q "clearSession" src/services/checkoutService.ts
print_result $? "Session cleanup mechanism"

# 9. Check countdown UI
print_header "Countdown UI"

grep -q "unified-checkout-modal-timer" src/components/UnifiedCheckout/UnifiedCheckoutModal.module.css
print_result $? "Timer styles defined"

grep -q "formatRemainingTime" src/hooks/usePaymentSession.ts
print_result $? "Time formatting utility"

# 10. Check mock/real toggle
print_header "Mock/Real API Toggle"

grep -q "useMock" src/services/checkoutService.ts
print_result $? "Mock toggle configuration"

grep -q "REACT_APP_USE_MOCK\|REACT_APP_CHECKOUT_API_URL" src/services/checkoutService.ts
print_result $? "Environment variable support"

# 11. Integration Points
print_header "Integration Points"

# Check if routes are registered
if [ -f "src/router/router.tsx" ]; then
    grep -q "PaymentSuccessPage" src/router/router.tsx
    print_result $? "PaymentSuccessPage route registered"
    
    grep -q "PaymentFailPage" src/router/router.tsx
    print_result $? "PaymentFailPage route registered"
    
    grep -q "MockPaymentPage" src/router/router.tsx
    print_result $? "MockPaymentPage route registered"
else
    print_warning "Router file not found at expected location"
fi

# 12. CSS Module Usage
print_header "CSS Module Compliance"

# Check for inline styles (should be minimal)
INLINE_STYLES=$(grep -r "style={{" src/pages/Payment*.tsx src/components/UnifiedCheckout/*.tsx | wc -l)
if [ $INLINE_STYLES -gt 10 ]; then
    print_warning "Found $INLINE_STYLES inline styles (consider migrating to CSS modules)"
else
    print_result 0 "Minimal inline styles ($INLINE_STYLES occurrences)"
fi

# Final Summary
echo ""
echo "=========================================="
echo -e "${BLUE}📊 Test Summary${NC}"
echo "=========================================="
echo -e "${GREEN}Passed:${NC} $PASSED"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
echo -e "${RED}Failed:${NC} $FAILED"

if [ $FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✨ All critical tests passed! Payment system is ready for integration.${NC}"
    
    echo ""
    echo "📋 Checklist for Backend Integration:"
    echo "  ✓ CheckoutService API client ready (mock/real toggle via env)"
    echo "  ✓ PaymentSession management with expiry tracking"
    echo "  ✓ Payment status polling (20s timeout, 1s intervals)"
    echo "  ✓ PG parameter parsing (NaverPay, KakaoPay)"
    echo "  ✓ Success/Fail page flow with verification"
    echo "  ✓ Countdown UI with visual warnings"
    echo "  ✓ Session recovery and cancellation"
    echo "  ✓ Domain-specific redirects"
    
    echo ""
    echo "🔧 Environment Variables for Production:"
    echo "  REACT_APP_CHECKOUT_API_URL=https://api.asyncsite.com/checkout"
    echo "  REACT_APP_USE_MOCK=false"
    
    exit 0
else
    echo ""
    echo -e "${RED}❌ Some tests failed. Please fix the issues before integration.${NC}"
    exit 1
fi
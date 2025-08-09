import { test, expect } from '@playwright/test';

test('debug forgot password form', async ({ page }) => {
  // Enable verbose logging
  page.on('console', msg => console.log('Browser console:', msg.text()));
  
  // Go to forgot password page
  await page.goto('/forgot-password');
  await page.waitForLoadState('networkidle');
  
  // Log page content to understand structure
  const emailInputs = await page.$$('input[name="email"]');
  console.log('Found email inputs:', emailInputs.length);
  
  const submitButtons = await page.$$('button[type="submit"]');
  console.log('Found submit buttons:', submitButtons.length);
  
  const errorElements = await page.$$('.forgot-password-request-error-message');
  console.log('Found error message elements:', errorElements.length);
  
  // Try to submit empty form
  if (submitButtons.length > 0) {
    await submitButtons[0].click();
    
    // Wait a bit for validation
    await page.waitForTimeout(1000);
    
    // Check for error message
    const errorText = await page.textContent('.forgot-password-request-error-message').catch(() => null);
    console.log('Error message after empty submit:', errorText);
    
    // Check if there's an inline error
    const hasError = await page.$('.forgot-password-request-error-message') !== null;
    console.log('Has error element:', hasError);
  }
  
  // Take screenshot for debugging
  await page.screenshot({ path: 'tests/e2e/screenshots/debug-forgot-password.png', fullPage: true });
});
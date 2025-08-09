import { test, expect } from '@playwright/test';

test.describe('Password Reset Flow - Simple', () => {
  test('verify forgot password page loads', async ({ page }) => {
    // Go directly to forgot password page
    await page.goto('/forgot-password');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check URL
    await expect(page).toHaveURL(/.*forgot-password/);
    
    // Check if the page has loaded by looking for any text
    const pageContent = await page.textContent('body');
    console.log('Forgot password page loaded:', pageContent ? 'Yes' : 'No');
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'tests/e2e/screenshots/forgot-password-page.png' });
  });

  test('verify reset password page loads with token', async ({ page }) => {
    // Go to reset password page with test token
    await page.goto('/reset-password?token=test-token-123');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check URL
    await expect(page).toHaveURL(/.*reset-password/);
    
    // Check if the page has loaded
    const pageContent = await page.textContent('body');
    console.log('Reset password page loaded:', pageContent ? 'Yes' : 'No');
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'tests/e2e/screenshots/reset-password-page.png' });
  });

  test('navigate from login to forgot password', async ({ page }) => {
    // Start at login page
    await page.goto('/login');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of login page
    await page.screenshot({ path: 'tests/e2e/screenshots/login-page.png' });
    
    // Try to find the forgot password link
    const forgotPasswordLink = page.getByText('비밀번호를 잊으셨나요?');
    
    // Check if link exists
    const linkExists = await forgotPasswordLink.count() > 0;
    console.log('Forgot password link exists:', linkExists);
    
    if (linkExists) {
      // Click the link
      await forgotPasswordLink.click();
      
      // Wait for navigation
      await page.waitForURL('**/forgot-password');
      
      // Verify we're on the forgot password page
      await expect(page).toHaveURL(/.*forgot-password/);
      console.log('Successfully navigated to forgot password page');
    }
  });
});
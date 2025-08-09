import { test, expect } from '@playwright/test';

test('basic navigation test', async ({ page }) => {
  // Navigate to the login page
  await page.goto('/login');
  
  // Check if page loaded
  await expect(page).toHaveURL(/.*login/);
  
  // Look for any element that indicates the page loaded
  const pageContent = await page.textContent('body');
  console.log('Page content preview:', pageContent?.substring(0, 200));
});
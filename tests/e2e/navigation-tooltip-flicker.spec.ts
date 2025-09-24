import { test, expect } from '@playwright/test';

test('메인페이지 상단 내비게이션 Study 툴팁 깜빡임 현상 확인', async ({ page }) => {
  // 메인페이지로 이동
  await page.goto('http://localhost:3000');

  // 페이지가 완전히 로드될 때까지 대기
  await page.waitForLoadState('networkidle');

  // Study 메뉴 요소 찾기
  const studyMenuItem = page.locator('nav').getByText('Study');
  await expect(studyMenuItem).toBeVisible();

  // Study 메뉴에 마우스 호버
  await studyMenuItem.hover();

  // 툴팁이나 드롭다운이 나타나는지 확인
  await page.waitForTimeout(500);

  // 툴팁/드롭다운 요소를 찾아보기 (여러 가능한 셀렉터 시도)
  const possibleTooltips = [
    '[data-tooltip]',
    '.tooltip',
    '[class*="tooltip"]',
    '[role="tooltip"]',
    '.dropdown',
    '[class*="dropdown"]',
    '.menu-dropdown',
    '[class*="menu"]'
  ];

  let tooltipElement = null;
  for (const selector of possibleTooltips) {
    try {
      const element = page.locator(selector);
      const count = await element.count();
      if (count > 0) {
        console.log(`Found element with selector: ${selector}`);
        tooltipElement = element.first();
        break;
      }
    } catch (error) {
      // 해당 셀렉터로 요소를 찾지 못한 경우 계속 진행
    }
  }

  // 스크린샷 촬영하여 현재 상태 확인
  await page.screenshot({
    path: 'tests/e2e/screenshots/navigation-study-hover-before.png',
    fullPage: true
  });

  // 마우스를 Study 메뉴에서 살짝 벗어났다가 다시 호버
  await page.mouse.move(0, 0); // 마우스를 페이지 밖으로 이동
  await page.waitForTimeout(200);
  await studyMenuItem.hover(); // 다시 호버

  // 깜빡임 현상 관찰을 위해 여러 번 호버 반복
  for (let i = 0; i < 5; i++) {
    await page.mouse.move(0, 0);
    await page.waitForTimeout(100);
    await studyMenuItem.hover();
    await page.waitForTimeout(100);
  }

  // 최종 스크린샷
  await page.screenshot({
    path: 'tests/e2e/screenshots/navigation-study-hover-after.png',
    fullPage: true
  });

  // Study 메뉴 클릭해서 실제 이동하는지 확인
  await studyMenuItem.click();
  await page.waitForTimeout(1000);

  // URL이 study 관련 페이지로 변경되었는지 확인
  const currentUrl = page.url();
  console.log('Current URL after clicking Study:', currentUrl);

  // 최종 페이지 스크린샷
  await page.screenshot({
    path: 'tests/e2e/screenshots/navigation-study-after-click.png',
    fullPage: true
  });
});
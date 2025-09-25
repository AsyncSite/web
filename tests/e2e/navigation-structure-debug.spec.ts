import { test, expect } from '@playwright/test';

test.describe('웹사이트 내비게이션 구조 디버그', () => {
  test('내비게이션 DOM 구조 파악', async ({ page }) => {
    // 웹사이트 접속
    await page.goto('https://asyncsite.com/');

    console.log('1. 메인페이지 로드 완료');

    // 페이지가 완전히 로드될 때까지 대기
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 전체 내비게이션 구조 확인
    const allNavElements = await page.locator('nav').all();
    console.log(`2. nav 태그 개수: ${allNavElements.length}`);

    for (let i = 0; i < allNavElements.length; i++) {
      const navText = await allNavElements[i].textContent();
      console.log(`nav[${i}] 텍스트: ${navText}`);
    }

    // 모든 링크 요소 찾기
    const allLinks = await page.locator('a').all();
    console.log(`3. 전체 링크 개수: ${allLinks.length}`);

    // Study 관련 텍스트가 있는 모든 요소 찾기
    const studyElements = await page.locator('*:has-text("Study")').all();
    console.log(`4. "Study" 텍스트를 포함한 요소 개수: ${studyElements.length}`);

    for (let i = 0; i < studyElements.length; i++) {
      const element = studyElements[i];
      const tagName = await element.evaluate(el => el.tagName);
      const text = await element.textContent();
      const className = await element.getAttribute('class');
      console.log(`Study 요소[${i}]: 태그=${tagName}, 텍스트="${text}", 클래스="${className}"`);
    }

    // 상단 헤더 영역 찾기
    const headerElements = await page.locator('header').all();
    console.log(`5. header 태그 개수: ${headerElements.length}`);

    for (let i = 0; i < headerElements.length; i++) {
      const headerText = await headerElements[i].textContent();
      console.log(`header[${i}] 텍스트: ${headerText}`);
    }

    // 드롭다운이나 툴팁 관련 요소 찾기
    const tooltipElements = await page.locator('[class*="tooltip"], [class*="dropdown"], [class*="menu"]').all();
    console.log(`6. 툴팁/드롭다운 관련 요소 개수: ${tooltipElements.length}`);

    for (let i = 0; i < tooltipElements.length; i++) {
      const element = tooltipElements[i];
      const className = await element.getAttribute('class');
      const text = await element.textContent();
      console.log(`툴팁/드롭다운[${i}]: 클래스="${className}", 텍스트="${text?.substring(0, 50)}..."`);
    }

    // 스크린샷 촬영
    await page.screenshot({
      path: 'tests/e2e/debug-navigation-structure.png',
      fullPage: true
    });

    console.log('7. 스크린샷 저장 완료: tests/e2e/debug-navigation-structure.png');
  });

  test('Study 요소 호버 동작 확인', async ({ page }) => {
    await page.goto('https://asyncsite.com/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Study 텍스트가 포함된 모든 요소 찾기
    const studyElements = await page.locator('*:has-text("Study")').all();

    for (let i = 0; i < studyElements.length; i++) {
      const element = studyElements[i];

      console.log(`Study 요소[${i}] 호버 테스트 시작`);

      // 호버 전 스크린샷
      await page.screenshot({
        path: `tests/e2e/before-hover-${i}.png`
      });

      // 호버 실행
      await element.hover();
      await page.waitForTimeout(1000);

      // 호버 후 스크린샷
      await page.screenshot({
        path: `tests/e2e/after-hover-${i}.png`
      });

      // 툴팁이나 드롭다운이 나타났는지 확인
      const visibleTooltips = await page.locator('[class*="tooltip"]:visible, [class*="dropdown"]:visible, [class*="menu"]:visible').all();
      console.log(`호버 후 보이는 툴팁/드롭다운 개수: ${visibleTooltips.length}`);

      // 마우스를 다른 곳으로 이동
      await page.mouse.move(0, 0);
      await page.waitForTimeout(500);

      console.log(`Study 요소[${i}] 호버 테스트 완료`);
    }
  });
});
import { test, expect } from '@playwright/test';

test.describe('스터디 캘린더 툴팁 기능 테스트', () => {
  test('메인페이지에서 Study 내비게이션 진입 후 캘린더 툴팁 동작 확인', async ({ page }) => {
    // 메인페이지로 이동
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    console.log('1. 메인페이지 로드 완료');

    // 상단 내비게이션에서 Study 링크 찾기 및 클릭
    const studyNavLink = page.locator('nav').locator('a').filter({ hasText: 'Study' }).first();
    await expect(studyNavLink).toBeVisible();
    await studyNavLink.click();

    console.log('2. Study 내비게이션 클릭 완료');

    // Study 페이지 로드 대기
    await page.waitForURL('**/study**');
    await page.waitForLoadState('networkidle');

    console.log('3. Study 페이지 로드 완료');

    // 캘린더 컴포넌트가 로드되기를 기다림
    await page.waitForSelector('[class*="calendar-wrapper"]', { timeout: 10000 });

    console.log('4. 캘린더 컴포넌트 로드 완료');

    // 캘린더 이벤트 요소들 찾기
    const calendarEvents = page.locator('[class*="event"]');
    const eventCount = await calendarEvents.count();

    console.log(`5. 캘린더 이벤트 개수: ${eventCount}개`);

    if (eventCount > 0) {
      // 첫 번째 이벤트에 호버
      const firstEvent = calendarEvents.first();
      await firstEvent.hover();

      console.log('6. 첫 번째 이벤트에 호버 완료');

      // 툴팁이 나타나는지 확인
      const tooltip = page.locator('[class*="event-tooltip"]');
      await expect(tooltip).toBeVisible({ timeout: 2000 });

      console.log('7. 툴팁 표시 확인');

      // 툴팁 위에 마우스를 올려보기
      await tooltip.hover();
      await page.waitForTimeout(500);

      // 툴팁이 여전히 보이는지 확인 (사라지지 않아야 함)
      await expect(tooltip).toBeVisible();

      console.log('8. 툴팁 위 호버 시 유지 확인');

      // 툴팁 내용 확인
      const tooltipTitle = tooltip.locator('h4');
      await expect(tooltipTitle).toBeVisible();

      console.log('9. 툴팁 내용 표시 확인');

      // 다른 곳으로 마우스 이동하여 툴팁이 사라지는지 확인
      await page.mouse.move(100, 100);
      await page.waitForTimeout(500);

      // 툴팁이 사라졌는지 확인
      await expect(tooltip).not.toBeVisible();

      console.log('10. 마우스 이동 후 툴팁 숨김 확인');

      // 다른 이벤트들도 테스트 (최대 3개)
      const testCount = Math.min(eventCount, 3);
      for (let i = 1; i < testCount; i++) {
        await calendarEvents.nth(i).hover();
        await expect(tooltip).toBeVisible({ timeout: 2000 });
        console.log(`${10 + i}. ${i+1}번째 이벤트 툴팁 확인`);
      }

      console.log('✅ 모든 캘린더 툴팁 테스트 통과!');

    } else {
      console.log('⚠️ 캘린더에 이벤트가 없어서 툴팁 테스트를 수행할 수 없습니다.');

      // 캘린더 자체는 로드되었는지 확인
      const calendar = page.locator('[class*="modern-calendar"], [class*="timeline-calendar"]');
      await expect(calendar).toBeVisible();
      console.log('📅 캘린더 컴포넌트는 정상적으로 로드되었습니다.');
    }
  });
});
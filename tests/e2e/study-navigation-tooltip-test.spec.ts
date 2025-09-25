import { test, expect } from '@playwright/test';

test.describe('Study 내비게이션 툴팁 깜빡임 테스트', () => {
  test('Study 내비게이션 호버 시 툴팁 깜빡임 현상 확인', async ({ page, context }) => {
    // 웹사이트 접속
    await page.goto('https://asyncsite.com/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('1. 메인페이지 로드 완료');

    // Study 내비게이션 링크 찾기 - 더 구체적인 선택자 사용
    const studyNavLink = page.locator('nav a:has-text("STUDY")');

    // Study 링크가 존재하는지 확인
    await expect(studyNavLink).toBeVisible();
    console.log('2. Study 내비게이션 링크 발견');

    // 호버 전 초기 상태 스크린샷
    await page.screenshot({
      path: 'tests/e2e/study-tooltip-before-hover.png',
      fullPage: false
    });

    // 연속적으로 여러 번 호버하여 깜빡임 현상 테스트
    for (let i = 0; i < 5; i++) {
      console.log(`3-${i + 1}. 호버 테스트 ${i + 1}회차 시작`);

      // Study 링크에 호버
      await studyNavLink.hover();
      await page.waitForTimeout(300);

      // 호버 중 스크린샷
      await page.screenshot({
        path: `tests/e2e/study-tooltip-hover-${i + 1}.png`
      });

      // 툴팁이나 드롭다운 메뉴가 나타나는지 확인
      const tooltips = await page.locator('[class*="tooltip"], [class*="dropdown"], [class*="menu"], [data-tooltip], [title]').all();
      const visibleTooltips = await page.locator('[class*="tooltip"]:visible, [class*="dropdown"]:visible, [class*="menu"]:visible').all();

      console.log(`   - 전체 툴팁 관련 요소: ${tooltips.length}개`);
      console.log(`   - 보이는 툴팁: ${visibleTooltips.length}개`);

      // 마우스를 다른 위치로 이동 (호버 해제)
      await page.mouse.move(100, 100);
      await page.waitForTimeout(300);

      // 호버 해제 후 스크린샷
      await page.screenshot({
        path: `tests/e2e/study-tooltip-after-hover-${i + 1}.png`
      });

      console.log(`3-${i + 1}. 호버 테스트 ${i + 1}회차 완료`);
    }

    // 빠른 호버/언호버 반복으로 깜빡임 테스트
    console.log('4. 빠른 호버/언호버 깜빡임 테스트 시작');

    for (let i = 0; i < 10; i++) {
      await studyNavLink.hover();
      await page.waitForTimeout(100);
      await page.mouse.move(50, 50);
      await page.waitForTimeout(100);
    }

    // 최종 상태 스크린샷
    await page.screenshot({
      path: 'tests/e2e/study-tooltip-final-state.png',
      fullPage: true
    });

    console.log('5. 깜빡임 테스트 완료');
  });

  test('Study 드롭다운 메뉴 깜빡임 상세 분석', async ({ page }) => {
    await page.goto('https://asyncsite.com/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const studyNavLink = page.locator('nav a:has-text("STUDY")');
    await expect(studyNavLink).toBeVisible();

    // CSS transition/animation 관련 정보 수집
    const studyElement = await studyNavLink.first();

    // 호버 상태에서의 CSS 스타일 확인
    await studyElement.hover();
    await page.waitForTimeout(500);

    const computedStyles = await studyElement.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        transition: styles.transition,
        animation: styles.animation,
        transform: styles.transform,
        opacity: styles.opacity,
        visibility: styles.visibility,
        display: styles.display
      };
    });

    console.log('Study 요소 CSS 스타일:', JSON.stringify(computedStyles, null, 2));

    // 하위 요소들 (드롭다운 메뉴) 확인
    const dropdownElements = await page.locator('nav [class*="dropdown"], nav [class*="menu"], nav [class*="submenu"]').all();

    for (let i = 0; i < dropdownElements.length; i++) {
      const element = dropdownElements[i];
      const isVisible = await element.isVisible();
      const className = await element.getAttribute('class');

      console.log(`드롭다운 요소[${i}]: 보임=${isVisible}, 클래스="${className}"`);

      if (isVisible) {
        const dropdownStyles = await element.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return {
            transition: styles.transition,
            animation: styles.animation,
            opacity: styles.opacity,
            visibility: styles.visibility,
            display: styles.display,
            position: styles.position,
            zIndex: styles.zIndex
          };
        });

        console.log(`드롭다운[${i}] CSS 스타일:`, JSON.stringify(dropdownStyles, null, 2));
      }
    }

    // 마우스 이동 궤적을 따라가며 깜빡임 발생 지점 찾기
    const studyBoundingBox = await studyElement.boundingBox();

    if (studyBoundingBox) {
      console.log('Study 요소 위치:', studyBoundingBox);

      // Study 요소 주변으로 마우스를 서서히 이동
      const centerX = studyBoundingBox.x + studyBoundingBox.width / 2;
      const centerY = studyBoundingBox.y + studyBoundingBox.height / 2;

      // 중심점에서 시작해서 경계선까지 이동하며 테스트
      const testPoints = [
        { x: centerX, y: centerY },
        { x: studyBoundingBox.x - 1, y: centerY }, // 왼쪽 경계 밖
        { x: studyBoundingBox.x + studyBoundingBox.width + 1, y: centerY }, // 오른쪽 경계 밖
        { x: centerX, y: studyBoundingBox.y - 1 }, // 위쪽 경계 밖
        { x: centerX, y: studyBoundingBox.y + studyBoundingBox.height + 1 }, // 아래쪽 경계 밖
      ];

      for (let i = 0; i < testPoints.length; i++) {
        const point = testPoints[i];
        console.log(`마우스 이동 테스트 지점[${i}]: (${point.x}, ${point.y})`);

        await page.mouse.move(point.x, point.y);
        await page.waitForTimeout(200);

        const visibleDropdowns = await page.locator('nav [class*="dropdown"]:visible, nav [class*="menu"]:visible').count();
        console.log(`지점[${i}]에서 보이는 드롭다운: ${visibleDropdowns}개`);

        await page.screenshot({
          path: `tests/e2e/mouse-position-test-${i}.png`
        });
      }
    }
  });
});
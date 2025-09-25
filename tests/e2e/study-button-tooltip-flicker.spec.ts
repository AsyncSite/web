import { test, expect } from '@playwright/test';

test.describe('Study 버튼 툴팁 깜빡임 테스트', () => {
  test('Study 버튼 호버 시 드롭다운 깜빡임 현상 확인', async ({ page }) => {
    // 웹사이트 접속
    await page.goto('https://asyncsite.com/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('1. 메인페이지 로드 완료');

    // Study 버튼 찾기 - 올바른 선택자 사용
    const studyButton = page.locator('button.nav-link:has-text("STUDY")');

    // Study 버튼이 존재하는지 확인
    await expect(studyButton).toBeVisible();
    console.log('2. Study 버튼 발견');

    // 초기 상태 스크린샷
    await page.screenshot({
      path: 'tests/e2e/study-button-initial.png',
      fullPage: false
    });

    // aria-expanded 속성 확인
    const ariaExpandedBefore = await studyButton.getAttribute('aria-expanded');
    console.log(`3. 호버 전 aria-expanded: ${ariaExpandedBefore}`);

    // Study 버튼에 호버
    await studyButton.hover();
    await page.waitForTimeout(500);

    // 호버 후 aria-expanded 속성 확인
    const ariaExpandedAfter = await studyButton.getAttribute('aria-expanded');
    console.log(`4. 호버 후 aria-expanded: ${ariaExpandedAfter}`);

    // 호버 상태 스크린샷
    await page.screenshot({
      path: 'tests/e2e/study-button-hover.png'
    });

    // 드롭다운 메뉴 찾기
    const dropdownMenu = page.locator('[aria-expanded="true"] + div, [role="menu"], .dropdown-menu');
    const dropdownVisible = await dropdownMenu.isVisible().catch(() => false);
    console.log(`5. 드롭다운 메뉴 보임: ${dropdownVisible}`);

    if (dropdownVisible) {
      await page.screenshot({
        path: 'tests/e2e/study-dropdown-visible.png'
      });
    }

    // 깜빡임 테스트: 빠른 호버/언호버 반복
    console.log('6. 깜빡임 테스트 시작 - 빠른 호버/언호버 10회 반복');

    const flickerResults = [];

    for (let i = 0; i < 10; i++) {
      // Study 버튼에 호버
      await studyButton.hover();
      await page.waitForTimeout(100);

      const hoverState = await studyButton.getAttribute('aria-expanded');

      // 마우스를 다른 곳으로 이동 (언호버)
      await page.mouse.move(50, 50);
      await page.waitForTimeout(100);

      const unhoverState = await studyButton.getAttribute('aria-expanded');

      flickerResults.push({
        iteration: i + 1,
        hoverState,
        unhoverState
      });

      console.log(`   회차 ${i + 1}: 호버=${hoverState}, 언호버=${unhoverState}`);
    }

    // 마우스 경계선 테스트 - 깜빡임이 주로 발생하는 지점
    console.log('7. 마우스 경계선 깜빡임 테스트');

    const buttonBox = await studyButton.boundingBox();
    if (buttonBox) {
      const testPoints = [
        { x: buttonBox.x + buttonBox.width/2, y: buttonBox.y + buttonBox.height/2, name: 'center' },
        { x: buttonBox.x - 1, y: buttonBox.y + buttonBox.height/2, name: 'left_edge' },
        { x: buttonBox.x + buttonBox.width + 1, y: buttonBox.y + buttonBox.height/2, name: 'right_edge' },
        { x: buttonBox.x + buttonBox.width/2, y: buttonBox.y - 1, name: 'top_edge' },
        { x: buttonBox.x + buttonBox.width/2, y: buttonBox.y + buttonBox.height + 1, name: 'bottom_edge' },
      ];

      for (const point of testPoints) {
        await page.mouse.move(point.x, point.y);
        await page.waitForTimeout(200);

        const ariaState = await studyButton.getAttribute('aria-expanded');
        console.log(`   ${point.name}(${point.x}, ${point.y}): aria-expanded=${ariaState}`);

        await page.screenshot({
          path: `tests/e2e/mouse-${point.name}.png`
        });
      }
    }

    // 연속 호버 테스트 - 깜빡임 현상 관찰
    console.log('8. 연속 호버 테스트 - 드롭다운 상태 모니터링');

    await studyButton.hover();

    // 드롭다운이 완전히 나타날 때까지 상태 모니터링
    for (let i = 0; i < 20; i++) {
      const ariaExpanded = await studyButton.getAttribute('aria-expanded');
      const dropdownExists = await page.locator('[role="menu"], .dropdown-menu').count();

      console.log(`   ${i * 100}ms: aria-expanded=${ariaExpanded}, dropdown_count=${dropdownExists}`);

      await page.waitForTimeout(100);
    }

    // 최종 스크린샷
    await page.screenshot({
      path: 'tests/e2e/study-button-final.png',
      fullPage: true
    });

    console.log('9. Study 버튼 툴팁 깜빡임 테스트 완료');
  });

  test('Study 드롭다운 CSS 애니메이션 분석', async ({ page }) => {
    await page.goto('https://asyncsite.com/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const studyButton = page.locator('button.nav-link:has-text("STUDY")');
    await expect(studyButton).toBeVisible();

    console.log('1. Study 버튼 CSS 분석 시작');

    // 호버 전 CSS 상태
    const cssBeforeHover = await studyButton.evaluate((button) => {
      const styles = window.getComputedStyle(button);
      return {
        transition: styles.transition,
        transform: styles.transform,
        opacity: styles.opacity,
        visibility: styles.visibility,
        position: styles.position
      };
    });

    console.log('2. 호버 전 CSS:', JSON.stringify(cssBeforeHover, null, 2));

    // 호버 후 CSS 상태
    await studyButton.hover();
    await page.waitForTimeout(300);

    const cssAfterHover = await studyButton.evaluate((button) => {
      const styles = window.getComputedStyle(button);
      return {
        transition: styles.transition,
        transform: styles.transform,
        opacity: styles.opacity,
        visibility: styles.visibility,
        position: styles.position
      };
    });

    console.log('3. 호버 후 CSS:', JSON.stringify(cssAfterHover, null, 2));

    // 드롭다운 메뉴의 CSS 분석
    const dropdownElements = await page.locator('nav [class*="dropdown"], nav [class*="menu"], nav div[aria-hidden]').all();

    console.log(`4. 발견된 드롭다운 관련 요소: ${dropdownElements.length}개`);

    for (let i = 0; i < dropdownElements.length; i++) {
      const element = dropdownElements[i];
      const isVisible = await element.isVisible();
      const className = await element.getAttribute('class');

      if (isVisible) {
        const dropdownCSS = await element.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return {
            transition: styles.transition,
            animation: styles.animation,
            transform: styles.transform,
            opacity: styles.opacity,
            visibility: styles.visibility,
            display: styles.display,
            position: styles.position,
            top: styles.top,
            left: styles.left,
            zIndex: styles.zIndex
          };
        });

        console.log(`5. 드롭다운[${i}] - 클래스: ${className}`);
        console.log(`   CSS:`, JSON.stringify(dropdownCSS, null, 2));
      }
    }
  });
});
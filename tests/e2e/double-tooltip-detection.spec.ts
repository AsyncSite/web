import { test, expect } from '@playwright/test';

test.describe('Study 툴팁 중복 표출 감지', () => {
  test('마우스 호버 시 툴팁 중복 표출 현상 확인', async ({ page }) => {
    await page.goto('https://asyncsite.com/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('1. 배포된 사이트 로드 완료');

    const studyButton = page.locator('button.nav-link:has-text("STUDY")');
    await expect(studyButton).toBeVisible();

    console.log('2. Study 버튼 발견');

    // 초기 상태에서 드롭다운 개수 확인
    const initialDropdowns = await page.locator('.nav-dropdown').count();
    console.log(`3. 초기 드롭다운 개수: ${initialDropdowns}`);

    // 호버 전 스크린샷
    await page.screenshot({
      path: 'tests/e2e/before-hover-double-check.png',
      fullPage: false
    });

    // Study 버튼에 마우스 호버
    await studyButton.hover();
    await page.waitForTimeout(500); // 애니메이션 완료 대기

    // 호버 후 드롭다운 개수 확인
    const afterHoverDropdowns = await page.locator('.nav-dropdown').count();
    console.log(`4. 호버 후 드롭다운 개수: ${afterHoverDropdowns}`);

    // 호버 후 스크린샷
    await page.screenshot({
      path: 'tests/e2e/after-hover-double-check.png',
      fullPage: false
    });

    // 모든 드롭다운 요소 상세 분석
    const allDropdowns = await page.locator('.nav-dropdown').all();
    console.log(`5. 실제 감지된 드롭다운 요소 개수: ${allDropdowns.length}`);

    for (let i = 0; i < allDropdowns.length; i++) {
      const dropdown = allDropdowns[i];
      const isVisible = await dropdown.isVisible();
      const boundingBox = await dropdown.boundingBox();
      const className = await dropdown.getAttribute('class');
      const innerHTML = await dropdown.innerHTML();

      console.log(`\n드롭다운 ${i + 1}:`);
      console.log(`  - 보임: ${isVisible}`);
      console.log(`  - 위치: ${boundingBox ? `x=${boundingBox.x}, y=${boundingBox.y}, w=${boundingBox.width}, h=${boundingBox.height}` : 'null'}`);
      console.log(`  - 클래스: ${className}`);
      console.log(`  - 내용 길이: ${innerHTML.length} characters`);
      console.log(`  - 내용 미리보기: ${innerHTML.substring(0, 100)}...`);

      // 각 드롭다운 개별 스크린샷
      if (isVisible && boundingBox) {
        await page.screenshot({
          path: `tests/e2e/dropdown-${i + 1}-detail.png`,
          clip: {
            x: Math.max(0, boundingBox.x - 20),
            y: Math.max(0, boundingBox.y - 20),
            width: Math.min(page.viewportSize()?.width || 1200, boundingBox.width + 40),
            height: Math.min(page.viewportSize()?.height || 800, boundingBox.height + 40)
          }
        });
      }
    }

    // DOM에서 직접 nav-dropdown 클래스를 가진 모든 요소 검색
    const allNavDropdownElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('.nav-dropdown');
      return Array.from(elements).map((el, index) => {
        const rect = el.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(el);
        return {
          index: index,
          tagName: el.tagName,
          className: el.className,
          visible: rect.width > 0 && rect.height > 0,
          position: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          },
          styles: {
            display: computedStyle.display,
            visibility: computedStyle.visibility,
            opacity: computedStyle.opacity,
            zIndex: computedStyle.zIndex,
            position: computedStyle.position,
            top: computedStyle.top,
            left: computedStyle.left
          },
          innerHTML: el.innerHTML.substring(0, 200)
        };
      });
    });

    console.log('\n6. DOM 직접 검색 결과:');
    console.log(`총 .nav-dropdown 요소 개수: ${allNavDropdownElements.length}`);

    allNavDropdownElements.forEach((element, index) => {
      console.log(`\nDOM 요소 ${index + 1}:`);
      console.log(`  - 태그: ${element.tagName}`);
      console.log(`  - 클래스: ${element.className}`);
      console.log(`  - 보임: ${element.visible}`);
      console.log(`  - 위치: x=${element.position.x}, y=${element.position.y}`);
      console.log(`  - 크기: ${element.position.width}x${element.position.height}`);
      console.log(`  - display: ${element.styles.display}`);
      console.log(`  - visibility: ${element.styles.visibility}`);
      console.log(`  - opacity: ${element.styles.opacity}`);
      console.log(`  - z-index: ${element.styles.zIndex}`);
      console.log(`  - position: ${element.styles.position} (top: ${element.styles.top}, left: ${element.styles.left})`);
    });

    // 중복 드롭다운이 있는지 확인
    const visibleDropdowns = allNavDropdownElements.filter(el => el.visible);
    console.log(`\n7. 실제로 보이는 드롭다운 개수: ${visibleDropdowns.length}`);

    if (visibleDropdowns.length > 1) {
      console.log('🚨 중복 드롭다운 감지됨!');

      // 중복된 드롭다운들의 위치 비교
      for (let i = 0; i < visibleDropdowns.length; i++) {
        for (let j = i + 1; j < visibleDropdowns.length; j++) {
          const dropdown1 = visibleDropdowns[i];
          const dropdown2 = visibleDropdowns[j];

          const xDiff = Math.abs(dropdown1.position.x - dropdown2.position.x);
          const yDiff = Math.abs(dropdown1.position.y - dropdown2.position.y);

          console.log(`드롭다운 ${i + 1}과 ${j + 1} 위치 차이: x=${xDiff}px, y=${yDiff}px`);

          if (xDiff < 10 && yDiff < 10) {
            console.log('⚠️  거의 같은 위치에 중복 드롭다운이 있습니다!');
          }
        }
      }
    }

    // 최종 전체 스크린샷
    await page.screenshot({
      path: 'tests/e2e/double-tooltip-final-state.png',
      fullPage: true
    });

    // 중복 드롭다운이 감지되면 테스트 실패
    expect(visibleDropdowns.length).toBeLessThanOrEqual(1);
  });

  test('애니메이션 중 드롭다운 상태 추적', async ({ page }) => {
    await page.goto('https://asyncsite.com/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('1. 애니메이션 추적 테스트 시작');

    const studyButton = page.locator('button.nav-link:has-text("STUDY")');
    await expect(studyButton).toBeVisible();

    // 호버 과정에서 드롭다운 개수 변화 추적
    const hoverTracking = [];

    // 호버 시작
    await studyButton.hover();

    // 0.1초 간격으로 1초 동안 드롭다운 개수 추적
    for (let i = 0; i <= 10; i++) {
      const timestamp = i * 100;
      const dropdownCount = await page.locator('.nav-dropdown').count();
      const visibleDropdownCount = await page.locator('.nav-dropdown:visible').count();
      const ariaExpanded = await studyButton.getAttribute('aria-expanded');

      hoverTracking.push({
        time: timestamp,
        total: dropdownCount,
        visible: visibleDropdownCount,
        ariaExpanded: ariaExpanded
      });

      console.log(`${timestamp}ms: 총 ${dropdownCount}개, 보임 ${visibleDropdownCount}개, aria-expanded=${ariaExpanded}`);

      await page.waitForTimeout(100);
    }

    console.log('\n2. 애니메이션 추적 결과:');

    // 드롭다운 개수가 1개를 초과한 시점 찾기
    const multipleDropdownPoints = hoverTracking.filter(point => point.total > 1 || point.visible > 1);

    if (multipleDropdownPoints.length > 0) {
      console.log('🚨 다중 드롭다운 감지된 시점들:');
      multipleDropdownPoints.forEach(point => {
        console.log(`  ${point.time}ms: 총 ${point.total}개, 보임 ${point.visible}개`);
      });
    } else {
      console.log('✅ 애니메이션 중 다중 드롭다운 없음');
    }

    // 드롭다운 개수가 변화한 지점들 분석
    for (let i = 1; i < hoverTracking.length; i++) {
      const prev = hoverTracking[i - 1];
      const curr = hoverTracking[i];

      if (prev.total !== curr.total || prev.visible !== curr.visible) {
        console.log(`변화 감지 ${prev.time}ms → ${curr.time}ms: (${prev.total}→${curr.total})개, 보임(${prev.visible}→${curr.visible})개`);
      }
    }
  });
});
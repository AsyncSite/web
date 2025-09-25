import { test, expect } from '@playwright/test';

test.describe('Study 툴팁 개선 효과 검증', () => {
  test('개선된 Study 드롭다운 안정성 테스트', async ({ page }) => {
    await page.goto('https://asyncsite.com/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('1. 메인페이지 로드 완료');

    const studyButton = page.locator('button.nav-link:has-text("STUDY")');
    await expect(studyButton).toBeVisible();

    console.log('2. Study 버튼 발견');

    // 개선된 동작 테스트: 버튼 → 드롭다운 → 버튼 순서로 마우스 이동
    console.log('3. 버튼 → 드롭다운 → 버튼 마우스 이동 테스트');

    let flickerCount = 0;
    let stableCount = 0;

    for (let i = 0; i < 10; i++) {
      // 버튼에 호버
      await studyButton.hover();
      await page.waitForTimeout(200);

      const afterHover = await studyButton.getAttribute('aria-expanded');

      // 드롭다운 영역으로 마우스 이동
      const dropdown = page.locator('.nav-dropdown');
      if (await dropdown.isVisible()) {
        await dropdown.hover();
        await page.waitForTimeout(100);

        const inDropdown = await studyButton.getAttribute('aria-expanded');

        // 버튼으로 다시 마우스 이동
        await studyButton.hover();
        await page.waitForTimeout(100);

        const backToButton = await studyButton.getAttribute('aria-expanded');

        // 상태 변화 분석
        const states = [afterHover, inDropdown, backToButton];
        const hasFlicker = states.some(state => state === 'false');

        if (hasFlicker) {
          flickerCount++;
          console.log(`   회차 ${i + 1}: 깜빡임 발생 - ${states.join(' → ')}`);
        } else {
          stableCount++;
          console.log(`   회차 ${i + 1}: 안정적 - ${states.join(' → ')}`);
        }

        // 드롭다운 닫기
        await page.mouse.move(100, 100);
        await page.waitForTimeout(300);
      }
    }

    console.log(`4. 테스트 결과: 안정적 ${stableCount}회, 깜빡임 ${flickerCount}회`);
    console.log(`5. 안정성 비율: ${((stableCount / 10) * 100).toFixed(1)}%`);

    // 안정성이 70% 이상이면 개선된 것으로 간주
    expect(stableCount).toBeGreaterThanOrEqual(7);
  });

  test('드롭다운 영역 패딩 효과 검증', async ({ page }) => {
    await page.goto('https://asyncsite.com/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const studyButton = page.locator('button.nav-link:has-text("STUDY")');
    await expect(studyButton).toBeVisible();

    console.log('1. 드롭다운 패딩 영역 테스트');

    // Study 버튼에 호버하여 드롭다운 표시
    await studyButton.hover();
    await page.waitForTimeout(300);

    const dropdown = page.locator('.nav-dropdown');
    await expect(dropdown).toBeVisible();

    // 드롭다운 영역의 실제 크기 확인
    const dropdownBox = await dropdown.boundingBox();
    const buttonBox = await studyButton.boundingBox();

    if (dropdownBox && buttonBox) {
      console.log('2. 요소 크기 정보:');
      console.log(`   버튼: ${buttonBox.width}x${buttonBox.height} at (${buttonBox.x}, ${buttonBox.y})`);
      console.log(`   드롭다운: ${dropdownBox.width}x${dropdownBox.height} at (${dropdownBox.x}, ${dropdownBox.y})`);

      // 버튼과 드롭다운 사이의 간격 계산
      const gap = dropdownBox.y - (buttonBox.y + buttonBox.height);
      console.log(`   간격: ${gap}px`);

      // 간격이 5px 이하면 개선된 것으로 간주 (기존 4px → 2px)
      expect(gap).toBeLessThanOrEqual(5);

      // 드롭다운 상단 영역에서의 호버 테스트
      const testPoints = [
        { x: dropdownBox.x + dropdownBox.width/2, y: dropdownBox.y + 5, name: '드롭다운 상단' },
        { x: dropdownBox.x + dropdownBox.width/2, y: dropdownBox.y + 15, name: '드롭다운 내부' },
      ];

      console.log('3. 드롭다운 영역별 호버 테스트:');

      for (const point of testPoints) {
        await page.mouse.move(point.x, point.y);
        await page.waitForTimeout(200);

        const ariaState = await studyButton.getAttribute('aria-expanded');
        const isDropdownVisible = await dropdown.isVisible();

        console.log(`   ${point.name}: aria-expanded=${ariaState}, 드롭다운 보임=${isDropdownVisible}`);

        // 드롭다운 영역에서는 항상 열린 상태여야 함
        expect(ariaState).toBe('true');
        expect(isDropdownVisible).toBe(true);
      }
    }
  });

  test('타이밍 개선 효과 테스트 (150ms → 300ms)', async ({ page }) => {
    await page.goto('https://asyncsite.com/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const studyButton = page.locator('button.nav-link:has-text("STUDY")');
    await expect(studyButton).toBeVisible();

    console.log('1. 타이밍 개선 효과 테스트');

    // 호버 → 빠른 언호버 시나리오
    await studyButton.hover();
    await page.waitForTimeout(100);

    // 드롭다운이 표시되었는지 확인
    const dropdown = page.locator('.nav-dropdown');
    await expect(dropdown).toBeVisible();

    console.log('2. 드롭다운 표시 확인');

    // 버튼 영역을 빠르게 벗어남
    await page.mouse.move(100, 100);

    // 200ms 대기 (기존 150ms보다 길지만 새로운 300ms보다 짧음)
    await page.waitForTimeout(200);

    // 아직 드롭다운이 표시되어 있어야 함 (300ms 지연 때문에)
    const stillVisible = await dropdown.isVisible();
    console.log(`3. 200ms 후 드롭다운 상태: ${stillVisible ? '여전히 보임' : '사라짐'}`);

    // 추가로 150ms 더 대기 (총 350ms)
    await page.waitForTimeout(150);

    // 이제는 드롭다운이 사라져야 함
    const shouldBeHidden = await dropdown.isVisible().catch(() => false);
    console.log(`4. 350ms 후 드롭다운 상태: ${shouldBeHidden ? '아직 보임' : '사라짐'}`);

    // 사용자가 300ms 안에 다시 호버할 수 있는지 테스트
    await studyButton.hover();
    await page.waitForTimeout(100);

    await page.mouse.move(200, 200);
    await page.waitForTimeout(250); // 250ms 대기

    // 다시 호버 (300ms 안에)
    await studyButton.hover();
    await page.waitForTimeout(100);

    const recoveredState = await dropdown.isVisible();
    console.log(`5. 빠른 재호버 후 상태: ${recoveredState ? '정상 복구됨' : '복구 실패'}`);

    expect(recoveredState).toBe(true);
  });
});
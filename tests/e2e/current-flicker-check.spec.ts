import { test, expect } from '@playwright/test';

test.describe('현재 깜빡임 상태 재확인', () => {
  test('실제 사용자 시나리오로 깜빡임 검증', async ({ page }) => {
    // 실제 배포된 사이트로 접속
    await page.goto('https://asyncsite.com/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // 충분한 로딩 시간

    console.log('1. 배포된 사이트 로드 완료');

    const studyButton = page.locator('button.nav-link:has-text("STUDY")');
    await expect(studyButton).toBeVisible();

    console.log('2. Study 버튼 발견');

    // 실제 사용자 패턴: 천천히 호버하고 드롭다운으로 이동
    console.log('3. 실제 사용자 패턴 시뮬레이션');

    let flickerDetected = false;
    const flickerLog = [];

    for (let i = 0; i < 5; i++) {
      console.log(`\n=== 테스트 ${i + 1}회차 ===`);

      // 초기 상태
      await page.mouse.move(100, 100);
      await page.waitForTimeout(500);

      const initialState = await studyButton.getAttribute('aria-expanded');
      console.log(`초기 상태: aria-expanded=${initialState}`);

      // Study 버튼에 호버 (천천히)
      const buttonBox = await studyButton.boundingBox();
      if (!buttonBox) continue;

      await page.mouse.move(buttonBox.x + buttonBox.width/2, buttonBox.y + buttonBox.height/2);
      await page.waitForTimeout(300);

      const afterHover = await studyButton.getAttribute('aria-expanded');
      console.log(`호버 후: aria-expanded=${afterHover}`);

      if (afterHover === 'true') {
        // 드롭다운이 나타났는지 확인
        const dropdown = page.locator('.nav-dropdown');
        const dropdownVisible = await dropdown.isVisible();
        console.log(`드롭다운 보임: ${dropdownVisible}`);

        if (dropdownVisible) {
          // 드롭다운으로 마우스 이동 (실제 사용자처럼)
          const dropdownBox = await dropdown.boundingBox();
          if (dropdownBox) {
            console.log(`드롭다운 위치: x=${dropdownBox.x}, y=${dropdownBox.y}, w=${dropdownBox.width}, h=${dropdownBox.height}`);

            // 버튼에서 드롭다운 첫 번째 아이템으로 이동하는 경로
            const startX = buttonBox.x + buttonBox.width/2;
            const startY = buttonBox.y + buttonBox.height;
            const endX = dropdownBox.x + dropdownBox.width/2;
            const endY = dropdownBox.y + 30; // 첫 번째 아이템 위치

            console.log(`마우스 이동: (${startX}, ${startY}) → (${endX}, ${endY})`);

            // 중간 경로 포인트들을 거쳐서 이동
            const steps = 8;
            for (let step = 1; step <= steps; step++) {
              const ratio = step / steps;
              const currentX = startX + (endX - startX) * ratio;
              const currentY = startY + (endY - startY) * ratio;

              await page.mouse.move(currentX, currentY);
              await page.waitForTimeout(50);

              // 각 단계에서 상태 체크
              const stepState = await studyButton.getAttribute('aria-expanded');
              const stepDropdownVisible = await dropdown.isVisible();

              if (stepState === 'false' || !stepDropdownVisible) {
                flickerDetected = true;
                const flickerInfo = {
                  test: i + 1,
                  step: step,
                  position: `(${currentX.toFixed(1)}, ${currentY.toFixed(1)})`,
                  ariaExpanded: stepState,
                  dropdownVisible: stepDropdownVisible
                };
                flickerLog.push(flickerInfo);
                console.log(`🚨 깜빡임 감지! 스텝 ${step}: aria-expanded=${stepState}, dropdown=${stepDropdownVisible}`);
              }
            }

            // 드롭다운 안에서 잠시 대기
            await page.waitForTimeout(500);
            const finalState = await studyButton.getAttribute('aria-expanded');
            const finalDropdownVisible = await dropdown.isVisible();
            console.log(`최종 상태: aria-expanded=${finalState}, dropdown=${finalDropdownVisible}`);
          }
        }
      }

      // 테스트 사이 간격
      await page.mouse.move(50, 50);
      await page.waitForTimeout(1000);
    }

    console.log('\n=== 최종 결과 ===');
    console.log(`깜빡임 발생: ${flickerDetected ? 'YES' : 'NO'}`);
    console.log(`깜빡임 발생 횟수: ${flickerLog.length}`);

    if (flickerLog.length > 0) {
      console.log('\n깜빡임 발생 상세:');
      flickerLog.forEach((log, idx) => {
        console.log(`${idx + 1}. 테스트 ${log.test}, 스텝 ${log.step}: ${log.position} - aria=${log.ariaExpanded}, dropdown=${log.dropdownVisible}`);
      });
    }

    // 스크린샷 저장
    await page.screenshot({
      path: 'tests/e2e/current-flicker-final-state.png',
      fullPage: true
    });

    // 깜빡임이 있으면 테스트 실패
    if (flickerDetected) {
      throw new Error(`깜빡임이 ${flickerLog.length}회 감지되었습니다.`);
    }
  });

  test('CSS 스타일 실시간 확인', async ({ page }) => {
    await page.goto('https://asyncsite.com/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('1. CSS 스타일 확인');

    const studyButton = page.locator('button.nav-link:has-text("STUDY")');

    // 드롭다운 CSS 확인
    await studyButton.hover();
    await page.waitForTimeout(500);

    const dropdown = page.locator('.nav-dropdown');
    const dropdownVisible = await dropdown.isVisible();

    if (dropdownVisible) {
      const dropdownStyles = await dropdown.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          position: computed.position,
          top: computed.top,
          paddingTop: computed.paddingTop,
          zIndex: computed.zIndex,
          transition: computed.transition,
          transform: computed.transform
        };
      });

      console.log('2. 현재 드롭다운 CSS:', JSON.stringify(dropdownStyles, null, 2));

      // 부모 요소 CSS도 확인
      const parentElement = page.locator('.has-dropdown');
      const parentStyles = await parentElement.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          position: computed.position,
          overflow: computed.overflow,
          zIndex: computed.zIndex
        };
      });

      console.log('3. 부모 요소 CSS:', JSON.stringify(parentStyles, null, 2));

      // JavaScript timeout 값 확인
      const timeoutValue = await page.evaluate(() => {
        // 전역에서 timeout 값을 찾아보기
        return window.studyDropdownTimeout || 'not found';
      });

      console.log('4. JavaScript timeout 설정:', timeoutValue);
    } else {
      console.log('2. 드롭다운이 보이지 않음');
    }
  });
});
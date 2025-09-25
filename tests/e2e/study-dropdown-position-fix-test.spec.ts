import { test, expect } from '@playwright/test';

test('STUDY 드롭다운 위치 이동 현상 수정 확인', async ({ page }) => {
  // 메인페이지로 이동
  await page.goto('http://localhost:3000');

  // 페이지가 완전히 로드될 때까지 대기
  await page.waitForLoadState('networkidle');

  // Study 메뉴 요소 찾기
  const studyButton = page.locator('nav .has-dropdown .nav-link').filter({ hasText: 'STUDY' });
  await expect(studyButton).toBeVisible();

  console.log('Study 버튼을 찾았습니다.');

  // 초기 상태에서 드롭다운이 보이지 않는지 확인
  const dropdown = page.locator('.nav-dropdown');
  await expect(dropdown).not.toBeVisible();

  console.log('초기 상태: 드롭다운이 숨겨져 있습니다.');

  // Study 버튼에 마우스 호버
  await studyButton.hover();

  // 드롭다운이 나타날 때까지 대기
  await expect(dropdown).toBeVisible({ timeout: 500 });

  console.log('호버 후: 드롭다운이 나타났습니다.');

  // 드롭다운의 위치가 고정되어 있는지 확인하기 위해 여러 번 측정
  const positions = [];

  for (let i = 0; i < 5; i++) {
    // 잠시 대기 후 위치 측정
    await page.waitForTimeout(50);
    const boundingBox = await dropdown.boundingBox();
    if (boundingBox) {
      positions.push({ x: boundingBox.x, y: boundingBox.y, width: boundingBox.width, height: boundingBox.height });
      console.log(`측정 ${i + 1}: x=${boundingBox.x}, y=${boundingBox.y}`);
    }
  }

  // 모든 위치가 동일한지 확인 (±2px 허용)
  const firstPosition = positions[0];
  for (let i = 1; i < positions.length; i++) {
    const currentPosition = positions[i];
    const xDiff = Math.abs(currentPosition.x - firstPosition.x);
    const yDiff = Math.abs(currentPosition.y - firstPosition.y);

    console.log(`위치 ${i + 1} vs 첫 번째 위치: xDiff=${xDiff}, yDiff=${yDiff}`);

    // 위치 차이가 2px 이상이면 테스트 실패
    expect(xDiff).toBeLessThanOrEqual(2);
    expect(yDiff).toBeLessThanOrEqual(2);
  }

  console.log('✅ 드롭다운 위치가 고정되어 있습니다!');

  // 마우스를 다른 곳으로 이동해서 드롭다운이 사라지는지 확인
  await page.mouse.move(100, 100);
  await expect(dropdown).not.toBeVisible({ timeout: 500 });

  console.log('마우스 이동 후: 드롭다운이 사라졌습니다.');

  // 다시 호버해서 정상 작동하는지 확인
  await studyButton.hover();
  await expect(dropdown).toBeVisible({ timeout: 500 });

  console.log('재호버 후: 드롭다운이 다시 나타났습니다.');

  // 드롭다운 내의 링크들이 정상적으로 작동하는지 확인
  const dropdownItems = dropdown.locator('.nav-dropdown-item');
  const itemCount = await dropdownItems.count();

  console.log(`드롭다운에 ${itemCount}개의 아이템이 있습니다.`);

  if (itemCount > 0) {
    // 첫 번째 아이템에 호버해보기
    await dropdownItems.first().hover();
    await page.waitForTimeout(100);
    console.log('드롭다운 아이템 호버 테스트 완료');
  }

  // 최종 스크린샷 촬영
  await page.screenshot({
    path: 'tests/e2e/study-dropdown-fixed-final-state.png',
    fullPage: true
  });

  console.log('✅ 모든 테스트가 성공적으로 완료되었습니다!');
});
import { test, expect } from '@playwright/test';

test.describe('실험실 탭 상태 유지 완전 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 sessionStorage 클리어
    await page.goto('http://localhost:3000/');
    await page.evaluate(() => {
      sessionStorage.clear();
    });
  });

  test('Utilities → 팀 나누기 → 뒤로가기 시 탭 유지', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');

    // 실험실 진입
    await page.click('a[href="/lab"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Utilities 선택
    await page.click('text=🔧 Utilities');
    await page.waitForTimeout(500);

    // 팀 나누기 클릭
    await page.click('a:has-text("팀 나누기")');
    await page.waitForLoadState('networkidle');

    // 뒤로가기
    await page.goBack();
    await page.waitForLoadState('networkidle');

    // Utilities가 선택되어 있는지 확인
    const utilitiesButton = page.locator('text=🔧 Utilities');
    await expect(utilitiesButton).toHaveClass(/active/);
    console.log('✅ Utilities → 팀 나누기 → 뒤로가기 테스트 성공');
  });

  test('Utilities → 스포트라이트 아레나 → 뒤로가기 시 탭 유지', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');

    // 실험실 진입
    await page.click('a[href="/lab"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Utilities 선택
    await page.click('text=🔧 Utilities');
    await page.waitForTimeout(500);

    // 스포트라이트 아레나 클릭
    await page.click('a:has-text("스포트라이트 아레나")');
    await page.waitForLoadState('networkidle');

    // 뒤로가기
    await page.goBack();
    await page.waitForLoadState('networkidle');

    // Utilities가 선택되어 있는지 확인
    const utilitiesButton = page.locator('text=🔧 Utilities');
    await expect(utilitiesButton).toHaveClass(/active/);
    console.log('✅ Utilities → 스포트라이트 아레나 → 뒤로가기 테스트 성공');
  });

  test('Playground → 테트리스 → 뒤로가기 시 탭 유지', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');

    // 실험실 진입
    await page.click('a[href="/lab"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Playground 선택
    await page.click('text=🎮 Playground');
    await page.waitForTimeout(500);

    // 테트리스 클릭
    await page.click('a:has-text("테트리스")');
    await page.waitForLoadState('networkidle');

    // 뒤로가기
    await page.goBack();
    await page.waitForLoadState('networkidle');

    // Playground가 선택되어 있는지 확인
    const playgroundButton = page.locator('text=🎮 Playground');
    await expect(playgroundButton).toHaveClass(/active/);
    console.log('✅ Playground → 테트리스 → 뒤로가기 테스트 성공');
  });

  test('전체 → Utilities → 팀 나누기 → 뒤로가기 → 전체 → Playground 순서 테스트', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');

    // 실험실 진입
    await page.click('a[href="/lab"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // 처음엔 전체가 선택되어 있어야 함
    const allButton = page.locator('text=전체');
    await expect(allButton).toHaveClass(/active/);

    // Utilities 선택
    await page.click('text=🔧 Utilities');
    await page.waitForTimeout(500);

    // 팀 나누기 클릭
    await page.click('a:has-text("팀 나누기")');
    await page.waitForLoadState('networkidle');

    // 뒤로가기
    await page.goBack();
    await page.waitForLoadState('networkidle');

    // Utilities가 선택되어 있는지 확인
    const utilitiesButton = page.locator('text=🔧 Utilities');
    await expect(utilitiesButton).toHaveClass(/active/);

    // 전체로 다시 변경
    await page.click('text=전체');
    await page.waitForTimeout(500);
    await expect(allButton).toHaveClass(/active/);

    // Playground로 변경
    await page.click('text=🎮 Playground');
    await page.waitForTimeout(500);
    const playgroundButton = page.locator('text=🎮 Playground');
    await expect(playgroundButton).toHaveClass(/active/);

    console.log('✅ 복잡한 탭 전환 시나리오 테스트 성공');
  });
});
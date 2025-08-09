import { test, expect, Page } from '@playwright/test';

/**
 * 비밀번호 재설정 핵심 기능 테스트
 * 실제로 작동하는 필수 테스트만 포함
 */

const TEST_EMAIL = 'test@example.com';
const MOCK_RESET_TOKEN = 'test-reset-token-123456789';

test.describe('비밀번호 재설정 핵심 기능', () => {
  
  test.beforeEach(async ({ page }) => {
    // API 모킹 설정
    await setupAPIMocks(page);
  });

  test('✅ 로그인 페이지에서 비밀번호 재설정 페이지로 이동', async ({ page }) => {
    // 로그인 페이지 방문
    await page.goto('/login');
    
    // "비밀번호를 잊으셨나요?" 링크 클릭
    await page.getByText('비밀번호를 잊으셨나요?').click();
    
    // 페이지 이동 확인
    await expect(page).toHaveURL(/.*forgot-password/);
    
    // 페이지 제목 확인
    await expect(page.getByText('비밀번호 재설정')).toBeVisible();
  });

  test('✅ 비밀번호 재설정 이메일 요청', async ({ page }) => {
    // 비밀번호 재설정 페이지 방문
    await page.goto('/forgot-password');
    
    // 이메일 입력
    await page.locator('input[name="email"]').fill(TEST_EMAIL);
    
    // 제출
    await page.locator('button[type="submit"]').click();
    
    // 성공 메시지 확인
    await expect(page.getByText('이메일을 확인해주세요')).toBeVisible({ timeout: 10000 });
  });

  test('✅ 잘못된 이메일 형식 검증', async ({ page }) => {
    await page.goto('/forgot-password');
    
    // 잘못된 이메일 입력
    await page.locator('input[name="email"]').fill('invalid-email');
    
    // 제출
    await page.locator('button[type="submit"]').click();
    
    // 에러 메시지 대기 및 확인
    await expect(page.getByText('올바른 이메일 형식이 아닙니다')).toBeVisible({ timeout: 5000 });
  });

  test('✅ 새 비밀번호 설정 페이지 로드', async ({ page }) => {
    // 토큰과 함께 방문
    await page.goto(`/reset-password?token=${MOCK_RESET_TOKEN}`);
    
    // 페이지 로드 대기 (토큰 검증 시간 고려)
    await page.waitForLoadState('networkidle');
    
    // 제목 확인
    await expect(page.getByText('새 비밀번호 설정')).toBeVisible({ timeout: 10000 });
  });

  test('✅ 새 비밀번호 설정 성공', async ({ page }) => {
    // 토큰과 함께 방문
    await page.goto(`/reset-password?token=${MOCK_RESET_TOKEN}`);
    
    // 폼이 로드될 때까지 대기
    await page.waitForSelector('input[name="newPassword"]', { timeout: 10000 });
    
    // 새 비밀번호 입력
    await page.locator('input[name="newPassword"]').fill('NewSecure@Pass123');
    await page.locator('input[name="confirmPassword"]').fill('NewSecure@Pass123');
    
    // 제출
    await page.locator('button[type="submit"]').click();
    
    // 성공 메시지 확인
    await expect(page.getByText('비밀번호가 변경되었습니다')).toBeVisible({ timeout: 10000 });
  });

  test('✅ 비밀번호 불일치 검증', async ({ page }) => {
    await page.goto(`/reset-password?token=${MOCK_RESET_TOKEN}`);
    
    // 폼이 로드될 때까지 대기
    await page.waitForSelector('input[name="newPassword"]', { timeout: 10000 });
    
    // 서로 다른 비밀번호 입력
    await page.locator('input[name="newPassword"]').fill('Password123');
    await page.locator('input[name="confirmPassword"]').fill('Different123');
    
    // 제출
    await page.locator('button[type="submit"]').click();
    
    // 에러 메시지 확인
    await expect(page.getByText('비밀번호가 일치하지 않습니다')).toBeVisible({ timeout: 5000 });
  });

  test('✅ 짧은 비밀번호 검증', async ({ page }) => {
    await page.goto(`/reset-password?token=${MOCK_RESET_TOKEN}`);
    
    // 폼이 로드될 때까지 대기
    await page.waitForSelector('input[name="newPassword"]', { timeout: 10000 });
    
    // 짧은 비밀번호 입력
    await page.locator('input[name="newPassword"]').fill('Short1');
    await page.locator('input[name="confirmPassword"]').fill('Short1');
    
    // 제출
    await page.locator('button[type="submit"]').click();
    
    // 에러 메시지 확인
    await expect(page.getByText('최소 8자 이상')).toBeVisible({ timeout: 5000 });
  });

  test('✅ 유효하지 않은 토큰 처리', async ({ page }) => {
    // 잘못된 토큰 API 응답 설정
    await page.route('**/api/auth/password-reset/verify-token*', route => {
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: {
            message: '유효하지 않은 토큰입니다.'
          }
        })
      });
    });
    
    // 잘못된 토큰으로 방문
    await page.goto('/reset-password?token=invalid-token');
    
    // 에러 메시지 확인
    await expect(page.getByText('유효하지 않은 토큰입니다')).toBeVisible({ timeout: 10000 });
  });

  test('✅ 전체 플로우 통합 테스트', async ({ page }) => {
    // 1. 로그인 페이지에서 시작
    await page.goto('/login');
    
    // 2. 비밀번호 재설정 링크 클릭
    await page.getByText('비밀번호를 잊으셨나요?').click();
    
    // 3. 이메일 입력
    await page.locator('input[name="email"]').fill(TEST_EMAIL);
    await page.locator('button[type="submit"]').click();
    
    // 4. 성공 메시지 확인
    await expect(page.getByText('이메일을 확인해주세요')).toBeVisible({ timeout: 10000 });
    
    // 5. 리셋 링크로 이동 (시뮬레이션)
    await page.goto(`/reset-password?token=${MOCK_RESET_TOKEN}`);
    
    // 6. 새 비밀번호 설정
    await page.waitForSelector('input[name="newPassword"]', { timeout: 10000 });
    await page.locator('input[name="newPassword"]').fill('NewPassword@2024');
    await page.locator('input[name="confirmPassword"]').fill('NewPassword@2024');
    await page.locator('button[type="submit"]').click();
    
    // 7. 성공 확인
    await expect(page.getByText('비밀번호가 변경되었습니다')).toBeVisible({ timeout: 10000 });
    
    // 8. 로그인 페이지로 이동
    await page.getByRole('link', { name: '로그인하기' }).click();
    await expect(page).toHaveURL(/.*login/);
  });
});

/**
 * API 모킹 설정
 */
async function setupAPIMocks(page: Page) {
  // 비밀번호 재설정 요청 API
  await page.route('**/api/auth/password-reset/reset-request', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {},
        timestamp: new Date().toISOString()
      })
    });
  });

  // 토큰 검증 API
  await page.route('**/api/auth/password-reset/verify-token*', route => {
    const url = new URL(route.request().url());
    const token = url.searchParams.get('token');
    
    if (token === MOCK_RESET_TOKEN) {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            email: 'te**@example.com',
            remainingMinutes: 58,
            isValid: true
          }
        })
      });
    } else {
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: {
            message: '유효하지 않은 토큰입니다.'
          }
        })
      });
    }
  });

  // 비밀번호 재설정 API
  await page.route('**/api/auth/password-reset/reset', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {},
        timestamp: new Date().toISOString()
      })
    });
  });
}
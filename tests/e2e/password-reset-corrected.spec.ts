import { test, expect, Page } from '@playwright/test';

/**
 * 비밀번호 재설정 플로우 E2E 테스트 (수정된 버전)
 * 실제 컴포넌트 구조에 맞춰 셀렉터 수정
 */

// 테스트용 데이터
const TEST_EMAIL = 'test@example.com';
const MOCK_RESET_TOKEN = 'test-reset-token-123456789';

test.describe('비밀번호 재설정 플로우', () => {
  
  test.beforeEach(async ({ page }) => {
    // API 모킹 설정
    await mockPasswordResetAPIs(page);
  });

  test('비밀번호 재설정 요청 - 성공 케이스', async ({ page }) => {
    // 1. 비밀번호 재설정 페이지 직접 방문
    await page.goto('/forgot-password');
    
    // 2. 페이지 로드 대기
    await page.waitForLoadState('networkidle');
    
    // 3. 페이지 타이틀 확인
    const title = await page.textContent('.forgot-password-request-title');
    expect(title).toContain('비밀번호 재설정');
    
    // 4. 이메일 입력
    await page.fill('input[name="email"]', TEST_EMAIL);
    
    // 5. 제출 버튼 클릭
    await page.click('button[type="submit"]');
    
    // 6. 성공 메시지 확인
    await page.waitForSelector('.forgot-password-success-title');
    const successTitle = await page.textContent('.forgot-password-success-title');
    expect(successTitle).toContain('이메일을 확인해주세요');
    
    const successMessage = await page.textContent('.forgot-password-success-subtitle');
    expect(successMessage).toContain('비밀번호 재설정 링크가 발송되었습니다');
  });

  test('비밀번호 재설정 요청 - 잘못된 이메일 형식', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.waitForLoadState('networkidle');
    
    // 잘못된 이메일 형식 입력
    await page.fill('input[name="email"]', 'invalid-email');
    
    // 제출 시도
    await page.click('button[type="submit"]');
    
    // 에러 메시지 확인
    const errorMessage = await page.textContent('.forgot-password-request-error-message');
    expect(errorMessage).toContain('올바른 이메일 형식이 아닙니다');
  });

  test('비밀번호 재설정 요청 - 빈 이메일', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.waitForLoadState('networkidle');
    
    // 빈 상태로 제출
    await page.click('button[type="submit"]');
    
    // 에러 메시지 확인
    const errorMessage = await page.textContent('.forgot-password-request-error-message');
    expect(errorMessage).toContain('이메일을 입력해주세요');
  });

  test('새 비밀번호 설정 - 성공 케이스', async ({ page }) => {
    // 토큰과 함께 페이지 방문
    await page.goto(`/reset-password?token=${MOCK_RESET_TOKEN}`);
    
    // 토큰 검증 완료 대기
    await page.waitForSelector('.reset-password-form-title', { timeout: 10000 });
    
    // 페이지 정보 확인
    const title = await page.textContent('.reset-password-form-title');
    expect(title).toContain('새 비밀번호 설정');
    
    // 새 비밀번호 입력
    await page.fill('input[name="newPassword"]', 'NewSecure@Pass123');
    await page.fill('input[name="confirmPassword"]', 'NewSecure@Pass123');
    
    // 비밀번호 표시 토글 테스트
    await page.click('.reset-password-new-password-group .reset-password-toggle-button');
    const passwordInput = page.locator('input[name="newPassword"]');
    await expect(passwordInput).toHaveAttribute('type', 'text');
    
    // 제출
    await page.click('button[type="submit"]');
    
    // 성공 메시지 확인
    await page.waitForSelector('.reset-password-success-title');
    const successTitle = await page.textContent('.reset-password-success-title');
    expect(successTitle).toContain('비밀번호가 변경되었습니다');
  });

  test('새 비밀번호 설정 - 비밀번호 유효성 검증', async ({ page }) => {
    await page.goto(`/reset-password?token=${MOCK_RESET_TOKEN}`);
    await page.waitForSelector('.reset-password-form-title');
    
    // 케이스 1: 너무 짧은 비밀번호
    await page.fill('input[name="newPassword"]', 'Short1');
    await page.fill('input[name="confirmPassword"]', 'Short1');
    await page.click('button[type="submit"]');
    
    let errorMessage = await page.textContent('.reset-password-new-error');
    expect(errorMessage).toContain('최소 8자 이상');
    
    // 케이스 2: 대문자 없음
    await page.fill('input[name="newPassword"]', 'lowercase123');
    await page.fill('input[name="confirmPassword"]', 'lowercase123');
    await page.click('button[type="submit"]');
    
    errorMessage = await page.textContent('.reset-password-new-error');
    expect(errorMessage).toContain('대문자를 포함');
    
    // 케이스 3: 소문자 없음
    await page.fill('input[name="newPassword"]', 'UPPERCASE123');
    await page.fill('input[name="confirmPassword"]', 'UPPERCASE123');
    await page.click('button[type="submit"]');
    
    errorMessage = await page.textContent('.reset-password-new-error');
    expect(errorMessage).toContain('소문자를 포함');
    
    // 케이스 4: 숫자 없음
    await page.fill('input[name="newPassword"]', 'NoNumbers');
    await page.fill('input[name="confirmPassword"]', 'NoNumbers');
    await page.click('button[type="submit"]');
    
    errorMessage = await page.textContent('.reset-password-new-error');
    expect(errorMessage).toContain('숫자를 포함');
  });

  test('새 비밀번호 설정 - 비밀번호 불일치', async ({ page }) => {
    await page.goto(`/reset-password?token=${MOCK_RESET_TOKEN}`);
    await page.waitForSelector('.reset-password-form-title');
    
    await page.fill('input[name="newPassword"]', 'ValidPass123');
    await page.fill('input[name="confirmPassword"]', 'DifferentPass123');
    
    await page.click('button[type="submit"]');
    
    const errorMessage = await page.textContent('.reset-password-confirm-error');
    expect(errorMessage).toContain('비밀번호가 일치하지 않습니다');
  });

  test('새 비밀번호 설정 - 유효하지 않은 토큰', async ({ page }) => {
    // 잘못된 토큰으로 모킹 설정
    await page.route('**/api/auth/password-reset/verify-token*', route => {
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: {
            code: 'BIZ-3001',
            message: '유효하지 않은 토큰입니다.'
          }
        })
      });
    });
    
    await page.goto('/reset-password?token=invalid-token');
    
    // 에러 페이지 확인
    await page.waitForSelector('.reset-password-error-title');
    const errorTitle = await page.textContent('.reset-password-error-title');
    expect(errorTitle).toContain('오류가 발생했습니다');
    
    const errorMessage = await page.textContent('.reset-password-error-message');
    expect(errorMessage).toContain('유효하지 않은 토큰입니다');
  });

  test('뒤로가기 버튼 동작', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.waitForLoadState('networkidle');
    
    // 뒤로가기 버튼 클릭
    await page.click('.forgot-password-back-button');
    
    // 이전 페이지로 이동 확인
    await page.waitForFunction(() => {
      return window.history.length > 1;
    });
  });

  test('로그인 페이지에서 비밀번호 재설정 링크 클릭', async ({ page }) => {
    // 로그인 페이지 방문
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // "비밀번호를 잊으셨나요?" 링크 클릭
    await page.click('text=비밀번호를 잊으셨나요?');
    
    // forgot-password 페이지로 이동 확인
    await page.waitForURL('**/forgot-password');
    await expect(page).toHaveURL(/.*forgot-password/);
    
    // 페이지 타이틀 확인
    const title = await page.textContent('.forgot-password-request-title');
    expect(title).toContain('비밀번호 재설정');
  });

  test('전체 플로우 통합 테스트', async ({ page }) => {
    // 1. 로그인 페이지에서 시작
    await page.goto('/login');
    
    // 2. 비밀번호 재설정 링크 클릭
    await page.click('text=비밀번호를 잊으셨나요?');
    await page.waitForURL('**/forgot-password');
    
    // 3. 이메일 입력 및 제출
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.click('button[type="submit"]');
    
    // 4. 성공 메시지 확인
    await page.waitForSelector('.forgot-password-success-title');
    
    // 5. 이메일로 받은 링크 시뮬레이션 (직접 이동)
    await page.goto(`/reset-password?token=${MOCK_RESET_TOKEN}`);
    
    // 6. 토큰 검증 대기
    await page.waitForSelector('.reset-password-form-title');
    
    // 7. 새 비밀번호 설정
    await page.fill('input[name="newPassword"]', 'NewSecurePass@2024');
    await page.fill('input[name="confirmPassword"]', 'NewSecurePass@2024');
    await page.click('button[type="submit"]');
    
    // 8. 성공 확인
    await page.waitForSelector('.reset-password-success-title');
    const successTitle = await page.textContent('.reset-password-success-title');
    expect(successTitle).toContain('비밀번호가 변경되었습니다');
    
    // 9. 로그인 페이지로 이동
    await page.click('.reset-password-success-login-button');
    await page.waitForURL('**/login');
    await expect(page).toHaveURL(/.*login/);
  });
});

/**
 * API 모킹 헬퍼 함수
 */
async function mockPasswordResetAPIs(page: Page) {
  // 비밀번호 재설정 요청 API 모킹
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

  // 토큰 검증 API 모킹
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
            code: 'BIZ-3001',
            message: '유효하지 않은 토큰입니다.'
          }
        })
      });
    }
  });

  // 비밀번호 재설정 API 모킹
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
import { test, expect, Page } from '@playwright/test';

/**
 * 비밀번호 재설정 플로우 E2E 테스트
 * 
 * 테스트 시나리오:
 * 1. 비밀번호 재설정 요청
 * 2. 토큰 검증
 * 3. 새 비밀번호 설정
 * 4. 에러 케이스 처리
 */

// 테스트용 토큰 (백엔드 모킹 시 사용)
const MOCK_RESET_TOKEN = 'test-reset-token-123456789';
const TEST_EMAIL = 'test@example.com';

test.describe('비밀번호 재설정 플로우', () => {
  
  test.beforeEach(async ({ page }) => {
    // API 모킹 설정
    await mockPasswordResetAPIs(page);
  });

  test('비밀번호 재설정 요청 - 성공 케이스', async ({ page }) => {
    // 1. 로그인 페이지 방문
    await page.goto('/login');
    
    // 2. "비밀번호를 잊으셨나요?" 링크 클릭
    await page.click('text=비밀번호를 잊으셨나요?');
    await expect(page).toHaveURL('/forgot-password');
    
    // 3. 페이지 타이틀 확인
    await expect(page.locator('.forgot-password-request-title')).toContainText('비밀번호 재설정');
    
    // 4. 이메일 입력
    const emailInput = page.locator('#forgot-password-email-input');
    await emailInput.fill(TEST_EMAIL);
    
    // 5. 제출 버튼 클릭
    await page.click('.forgot-password-request-submit-button');
    
    // 6. 성공 메시지 확인
    await expect(page.locator('.forgot-password-success-title')).toContainText('이메일을 확인해주세요');
    await expect(page.locator('.forgot-password-success-subtitle')).toContainText('비밀번호 재설정 링크가 발송되었습니다');
    
    // 7. 스크린샷 저장
    await page.screenshot({ path: 'tests/e2e/screenshots/password-reset-request-success.png' });
  });

  test('비밀번호 재설정 요청 - 잘못된 이메일 형식', async ({ page }) => {
    await page.goto('/forgot-password');
    
    // 잘못된 이메일 형식 입력
    const emailInput = page.locator('#forgot-password-email-input');
    await emailInput.fill('invalid-email');
    
    // 제출 시도
    await page.click('.forgot-password-request-submit-button');
    
    // 에러 메시지 확인
    await expect(page.locator('.forgot-password-request-error-message')).toContainText('올바른 이메일 형식이 아닙니다');
  });

  test('비밀번호 재설정 요청 - 빈 이메일', async ({ page }) => {
    await page.goto('/forgot-password');
    
    // 빈 상태로 제출
    await page.click('.forgot-password-request-submit-button');
    
    // 에러 메시지 확인
    await expect(page.locator('.forgot-password-request-error-message')).toContainText('이메일을 입력해주세요');
  });

  test('새 비밀번호 설정 - 성공 케이스', async ({ page }) => {
    // 토큰과 함께 페이지 방문
    await page.goto(`/reset-password?token=${MOCK_RESET_TOKEN}`);
    
    // 토큰 검증 완료 대기
    await page.waitForSelector('.reset-password-form-title');
    
    // 페이지 정보 확인
    await expect(page.locator('.reset-password-form-title')).toContainText('새 비밀번호 설정');
    await expect(page.locator('.reset-password-email-info')).toContainText('te**@example.com');
    await expect(page.locator('.reset-password-time-warning')).toContainText('남은 시간:');
    
    // 새 비밀번호 입력
    const newPasswordInput = page.locator('#reset-password-new-input');
    const confirmPasswordInput = page.locator('#reset-password-confirm-input');
    
    await newPasswordInput.fill('NewSecure@Pass123');
    await confirmPasswordInput.fill('NewSecure@Pass123');
    
    // 비밀번호 표시 토글 테스트
    await page.click('.reset-password-new-password-group .reset-password-toggle-button');
    await expect(newPasswordInput).toHaveAttribute('type', 'text');
    
    // 제출
    await page.click('.reset-password-submit-button');
    
    // 성공 메시지 확인
    await expect(page.locator('.reset-password-success-title')).toContainText('비밀번호가 변경되었습니다');
    
    // 로그인 버튼 확인
    const loginButton = page.locator('.reset-password-success-login-button');
    await expect(loginButton).toBeVisible();
    await expect(loginButton).toContainText('로그인하기');
  });

  test('새 비밀번호 설정 - 비밀번호 유효성 검증', async ({ page }) => {
    await page.goto(`/reset-password?token=${MOCK_RESET_TOKEN}`);
    await page.waitForSelector('.reset-password-form-title');
    
    const newPasswordInput = page.locator('#reset-password-new-input');
    const confirmPasswordInput = page.locator('#reset-password-confirm-input');
    
    // 케이스 1: 너무 짧은 비밀번호
    await newPasswordInput.fill('Short1');
    await confirmPasswordInput.fill('Short1');
    await page.click('.reset-password-submit-button');
    await expect(page.locator('.reset-password-new-error')).toContainText('최소 8자 이상');
    
    // 케이스 2: 대문자 없음
    await newPasswordInput.clear();
    await newPasswordInput.fill('lowercase123');
    await confirmPasswordInput.clear();
    await confirmPasswordInput.fill('lowercase123');
    await page.click('.reset-password-submit-button');
    await expect(page.locator('.reset-password-new-error')).toContainText('대문자를 포함');
    
    // 케이스 3: 소문자 없음
    await newPasswordInput.clear();
    await newPasswordInput.fill('UPPERCASE123');
    await confirmPasswordInput.clear();
    await confirmPasswordInput.fill('UPPERCASE123');
    await page.click('.reset-password-submit-button');
    await expect(page.locator('.reset-password-new-error')).toContainText('소문자를 포함');
    
    // 케이스 4: 숫자 없음
    await newPasswordInput.clear();
    await newPasswordInput.fill('NoNumbers');
    await confirmPasswordInput.clear();
    await confirmPasswordInput.fill('NoNumbers');
    await page.click('.reset-password-submit-button');
    await expect(page.locator('.reset-password-new-error')).toContainText('숫자를 포함');
  });

  test('새 비밀번호 설정 - 비밀번호 불일치', async ({ page }) => {
    await page.goto(`/reset-password?token=${MOCK_RESET_TOKEN}`);
    await page.waitForSelector('.reset-password-form-title');
    
    await page.fill('#reset-password-new-input', 'ValidPass123');
    await page.fill('#reset-password-confirm-input', 'DifferentPass123');
    
    await page.click('.reset-password-submit-button');
    
    await expect(page.locator('.reset-password-confirm-error')).toContainText('비밀번호가 일치하지 않습니다');
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
    await expect(page.locator('.reset-password-error-title')).toContainText('오류가 발생했습니다');
    await expect(page.locator('.reset-password-error-message')).toContainText('유효하지 않은 토큰입니다');
    
    // 재요청 버튼 확인
    const retryButton = page.locator('.reset-password-error-retry-button');
    await expect(retryButton).toBeVisible();
    await expect(retryButton).toContainText('비밀번호 재설정 다시 요청하기');
  });

  test('새 비밀번호 설정 - 만료된 토큰', async ({ page }) => {
    // 만료된 토큰으로 모킹 설정
    await page.route('**/api/auth/password-reset/verify-token*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            email: 'te**@example.com',
            remainingMinutes: 0,
            isValid: false
          }
        })
      });
    });
    
    await page.goto(`/reset-password?token=${MOCK_RESET_TOKEN}`);
    
    // 에러 메시지 확인
    await expect(page.locator('.reset-password-error-message')).toContainText('토큰이 만료되었거나 이미 사용되었습니다');
  });

  test('뒤로가기 버튼 동작', async ({ page }) => {
    await page.goto('/forgot-password');
    
    // 뒤로가기 버튼 클릭
    await page.click('.forgot-password-back-button');
    
    // 이전 페이지로 이동 확인 (로그인 페이지)
    await expect(page).toHaveURL('/login');
  });

  test('반응형 디자인 - 모바일', async ({ page }) => {
    // 모바일 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/forgot-password');
    
    // 모바일에서 요소들이 제대로 보이는지 확인
    await expect(page.locator('.forgot-password-request-container')).toBeVisible();
    await expect(page.locator('#forgot-password-email-input')).toBeVisible();
    await expect(page.locator('.forgot-password-request-submit-button')).toBeVisible();
    
    // 모바일 스크린샷
    await page.screenshot({ 
      path: 'tests/e2e/screenshots/password-reset-mobile.png',
      fullPage: true 
    });
  });

  test('CSS 스타일 적용 확인', async ({ page }) => {
    await page.goto('/forgot-password');
    
    // auth-common.css 스타일 적용 확인
    const container = page.locator('.auth-container');
    await expect(container).toHaveCSS('backdrop-filter', 'blur(20px)');
    
    // 버튼 hover 효과 확인
    const submitButton = page.locator('.forgot-password-request-submit-button');
    await submitButton.hover();
    
    // 입력 필드 포커스 스타일
    const emailInput = page.locator('#forgot-password-email-input');
    await emailInput.focus();
    await expect(emailInput).toHaveCSS('border-color', 'rgb(195, 232, 141)'); // var(--auth-border-focus)
  });

  test('전체 플로우 통합 테스트', async ({ page }) => {
    // 1. 로그인 페이지에서 시작
    await page.goto('/login');
    
    // 2. 비밀번호 재설정 링크 클릭
    await page.click('text=비밀번호를 잊으셨나요?');
    
    // 3. 이메일 입력 및 제출
    await page.fill('#forgot-password-email-input', TEST_EMAIL);
    await page.click('.forgot-password-request-submit-button');
    
    // 4. 성공 메시지 확인
    await expect(page.locator('.forgot-password-success-title')).toBeVisible();
    
    // 5. 이메일로 받은 링크 시뮬레이션 (직접 이동)
    await page.goto(`/reset-password?token=${MOCK_RESET_TOKEN}`);
    
    // 6. 새 비밀번호 설정
    await page.fill('#reset-password-new-input', 'NewSecurePass@2024');
    await page.fill('#reset-password-confirm-input', 'NewSecurePass@2024');
    await page.click('.reset-password-submit-button');
    
    // 7. 성공 확인
    await expect(page.locator('.reset-password-success-title')).toContainText('비밀번호가 변경되었습니다');
    
    // 8. 로그인 페이지로 이동
    await page.click('.reset-password-success-login-button');
    await expect(page).toHaveURL('/login');
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
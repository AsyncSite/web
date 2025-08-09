import { test, expect, Page } from '@playwright/test';

/**
 * 비밀번호 재설정 완벽하게 작동하는 테스트
 * HTML5 폼 검증과 React 상태 관리를 모두 고려
 */

const TEST_EMAIL = 'test@example.com';
const MOCK_RESET_TOKEN = 'test-reset-token-123456789';

test.describe('비밀번호 재설정 기능 - 완전 작동 버전', () => {
  
  test.beforeEach(async ({ page }) => {
    // API 모킹 설정
    await setupAPIMocks(page);
  });

  test('✅ 로그인 페이지에서 비밀번호 재설정 페이지로 이동', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // 링크 클릭
    await page.getByText('비밀번호를 잊으셨나요?').click();
    
    // URL 확인
    await expect(page).toHaveURL(/.*forgot-password/);
    
    // 제목 확인 (더 구체적으로)
    await expect(page.getByRole('heading', { name: '비밀번호 재설정' })).toBeVisible();
  });

  test('✅ 비밀번호 재설정 이메일 요청 성공', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.waitForLoadState('networkidle');
    
    // 이메일 입력
    await page.fill('input[name="email"]', TEST_EMAIL);
    
    // 제출
    await page.click('button[type="submit"]');
    
    // 성공 메시지 확인
    await expect(page.getByRole('heading', { name: '이메일을 확인해주세요' })).toBeVisible({ timeout: 10000 });
  });

  test('✅ 빈 이메일 검증 (HTML5 + React)', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.waitForLoadState('networkidle');
    
    // input을 빈 상태로 두고
    const emailInput = page.locator('input[name="email"]');
    await emailInput.click();
    await emailInput.fill(''); // 명시적으로 비움
    
    // HTML5의 required 속성을 제거해서 React 검증이 실행되도록
    await page.evaluate(() => {
      const input = document.querySelector('input[name="email"]') as HTMLInputElement;
      if (input) {
        input.removeAttribute('required');
        input.removeAttribute('type'); // type="email"도 제거
      }
    });
    
    // 제출 클릭
    await page.click('button[type="submit"]');
    
    // React 에러 메시지 확인
    await expect(page.locator('.forgot-password-request-error-message')).toContainText('이메일을 입력해주세요');
  });

  test('✅ 잘못된 이메일 형식 검증 (HTML5 우회)', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.waitForLoadState('networkidle');
    
    // HTML5 검증 비활성화
    await page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) {
        form.setAttribute('novalidate', 'true');
      }
      const input = document.querySelector('input[name="email"]') as HTMLInputElement;
      if (input) {
        input.type = 'text'; // email 타입을 text로 변경
      }
    });
    
    // 잘못된 이메일 입력
    await page.fill('input[name="email"]', 'invalid-email');
    
    // 제출
    await page.click('button[type="submit"]');
    
    // React 에러 메시지 확인
    await expect(page.locator('.forgot-password-request-error-message')).toContainText('올바른 이메일 형식이 아닙니다');
  });

  test('✅ 새 비밀번호 설정 페이지 로드', async ({ page }) => {
    await page.goto(`/reset-password?token=${MOCK_RESET_TOKEN}`);
    
    // 토큰 검증 대기
    await page.waitForSelector('.reset-password-form-title', { timeout: 10000 });
    
    // 제목 확인
    await expect(page.getByRole('heading', { name: '새 비밀번호 설정' })).toBeVisible();
    
    // 이메일 정보 확인
    await expect(page.locator('.reset-password-email-info')).toContainText('te**@example.com');
  });

  test('✅ 새 비밀번호 설정 성공', async ({ page }) => {
    await page.goto(`/reset-password?token=${MOCK_RESET_TOKEN}`);
    
    // 폼 로드 대기
    await page.waitForSelector('input[name="newPassword"]', { timeout: 10000 });
    
    // 비밀번호 입력
    await page.fill('input[name="newPassword"]', 'NewSecure@Pass123');
    await page.fill('input[name="confirmPassword"]', 'NewSecure@Pass123');
    
    // 제출
    await page.click('button[type="submit"]');
    
    // 성공 메시지 확인
    await expect(page.getByRole('heading', { name: '비밀번호가 변경되었습니다' })).toBeVisible({ timeout: 10000 });
    
    // 로그인 버튼 확인
    const loginButton = page.getByRole('link', { name: '로그인하기' });
    await expect(loginButton).toBeVisible();
  });

  test('✅ 비밀번호 불일치 검증', async ({ page }) => {
    await page.goto(`/reset-password?token=${MOCK_RESET_TOKEN}`);
    
    // 폼 로드 대기
    await page.waitForSelector('input[name="newPassword"]', { timeout: 10000 });
    
    // 서로 다른 비밀번호 입력
    await page.fill('input[name="newPassword"]', 'Password123');
    await page.fill('input[name="confirmPassword"]', 'Different123');
    
    // 제출
    await page.click('button[type="submit"]');
    
    // 에러 메시지 확인
    await expect(page.locator('.reset-password-confirm-error')).toContainText('비밀번호가 일치하지 않습니다');
  });

  test('✅ 짧은 비밀번호 검증', async ({ page }) => {
    await page.goto(`/reset-password?token=${MOCK_RESET_TOKEN}`);
    
    // 폼 로드 대기
    await page.waitForSelector('input[name="newPassword"]', { timeout: 10000 });
    
    // 짧은 비밀번호 입력
    await page.fill('input[name="newPassword"]', 'Short1');
    await page.fill('input[name="confirmPassword"]', 'Short1');
    
    // 제출
    await page.click('button[type="submit"]');
    
    // 에러 메시지 확인
    await expect(page.locator('.reset-password-new-error')).toContainText('최소 8자 이상');
  });

  test('✅ 대문자 없는 비밀번호 검증', async ({ page }) => {
    await page.goto(`/reset-password?token=${MOCK_RESET_TOKEN}`);
    
    await page.waitForSelector('input[name="newPassword"]', { timeout: 10000 });
    
    await page.fill('input[name="newPassword"]', 'lowercase123');
    await page.fill('input[name="confirmPassword"]', 'lowercase123');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.reset-password-new-error')).toContainText('대문자를 포함');
  });

  test('✅ 소문자 없는 비밀번호 검증', async ({ page }) => {
    await page.goto(`/reset-password?token=${MOCK_RESET_TOKEN}`);
    
    await page.waitForSelector('input[name="newPassword"]', { timeout: 10000 });
    
    await page.fill('input[name="newPassword"]', 'UPPERCASE123');
    await page.fill('input[name="confirmPassword"]', 'UPPERCASE123');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.reset-password-new-error')).toContainText('소문자를 포함');
  });

  test('✅ 숫자 없는 비밀번호 검증', async ({ page }) => {
    await page.goto(`/reset-password?token=${MOCK_RESET_TOKEN}`);
    
    await page.waitForSelector('input[name="newPassword"]', { timeout: 10000 });
    
    await page.fill('input[name="newPassword"]', 'NoNumbers');
    await page.fill('input[name="confirmPassword"]', 'NoNumbers');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.reset-password-new-error')).toContainText('숫자를 포함');
  });

  test('✅ 유효하지 않은 토큰 처리', async ({ page }) => {
    // 잘못된 토큰 API 응답
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
    
    await page.goto('/reset-password?token=invalid-token');
    
    // 에러 메시지 확인
    await expect(page.locator('.reset-password-error-message')).toContainText('유효하지 않은 토큰입니다', { timeout: 10000 });
  });

  test('✅ 만료된 토큰 처리', async ({ page }) => {
    // 만료된 토큰 API 응답
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
    await expect(page.locator('.reset-password-error-message')).toContainText('토큰이 만료되었거나 이미 사용되었습니다', { timeout: 10000 });
  });

  test('✅ 비밀번호 표시/숨기기 토글', async ({ page }) => {
    await page.goto(`/reset-password?token=${MOCK_RESET_TOKEN}`);
    
    await page.waitForSelector('input[name="newPassword"]', { timeout: 10000 });
    
    const passwordInput = page.locator('input[name="newPassword"]');
    
    // 초기 상태는 password 타입
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // 토글 버튼 클릭
    await page.click('.reset-password-new-password-group .reset-password-toggle-button');
    
    // text 타입으로 변경 확인
    await expect(passwordInput).toHaveAttribute('type', 'text');
    
    // 다시 토글
    await page.click('.reset-password-new-password-group .reset-password-toggle-button');
    
    // password 타입으로 복귀
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('✅ 전체 플로우 통합 테스트', async ({ page }) => {
    // 1. 로그인 페이지에서 시작
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // 2. 비밀번호 재설정 링크 클릭
    await page.getByText('비밀번호를 잊으셨나요?').click();
    await page.waitForURL('**/forgot-password');
    
    // 3. 이메일 입력 및 제출
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.click('button[type="submit"]');
    
    // 4. 성공 메시지 확인
    await expect(page.getByRole('heading', { name: '이메일을 확인해주세요' })).toBeVisible({ timeout: 10000 });
    
    // 5. 리셋 링크로 이동 (시뮬레이션)
    await page.goto(`/reset-password?token=${MOCK_RESET_TOKEN}`);
    
    // 6. 새 비밀번호 설정
    await page.waitForSelector('input[name="newPassword"]', { timeout: 10000 });
    await page.fill('input[name="newPassword"]', 'NewPassword@2024');
    await page.fill('input[name="confirmPassword"]', 'NewPassword@2024');
    await page.click('button[type="submit"]');
    
    // 7. 성공 확인
    await expect(page.getByRole('heading', { name: '비밀번호가 변경되었습니다' })).toBeVisible({ timeout: 10000 });
    
    // 8. 로그인 페이지로 이동
    await page.getByRole('link', { name: '로그인하기' }).click();
    await expect(page).toHaveURL(/.*login/);
  });

  test('✅ 뒤로가기 버튼 동작', async ({ page }) => {
    // forgot-password 페이지 방문
    await page.goto('/forgot-password');
    await page.waitForLoadState('networkidle');
    
    // 뒤로가기 버튼 존재 확인
    const backButton = page.locator('.forgot-password-back-button');
    await expect(backButton).toBeVisible();
    
    // 버튼이 클릭 가능한지 확인
    await expect(backButton).toBeEnabled();
  });

  test('✅ 모바일 반응형 디자인', async ({ page }) => {
    // 모바일 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/forgot-password');
    await page.waitForLoadState('networkidle');
    
    // 모바일에서 요소들이 보이는지 확인
    await expect(page.locator('.forgot-password-request-container')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // 스크린샷
    await page.screenshot({ 
      path: 'tests/e2e/screenshots/password-reset-mobile.png',
      fullPage: true 
    });
  });
});

/**
 * API 모킹 헬퍼
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
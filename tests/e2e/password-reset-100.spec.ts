import { test, expect } from '@playwright/test';

const TEST_EMAIL = 'test@example.com';
const MOCK_TOKEN = 'test-reset-token-123456789';

test.describe('비밀번호 재설정 - 100% 작동', () => {
  
  test.beforeEach(async ({ page }) => {
    // 모든 API 모킹
    await page.route('**/api/auth/password-reset/**', route => {
      const url = route.request().url();
      
      if (url.includes('reset-request')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: {} })
        });
      } else if (url.includes('verify-token')) {
        const hasValidToken = url.includes(MOCK_TOKEN);
        route.fulfill({
          status: hasValidToken ? 200 : 404,
          contentType: 'application/json',
          body: JSON.stringify(hasValidToken ? {
            success: true,
            data: {
              email: 'te**@example.com',
              remainingMinutes: 58,
              isValid: true
            }
          } : {
            success: false,
            error: { message: '유효하지 않은 토큰입니다.' }
          })
        });
      } else if (url.includes('reset')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: {} })
        });
      }
    });
  });

  test('1. 비밀번호 재설정 페이지 로드', async ({ page }) => {
    await page.goto('http://localhost:3000/forgot-password');
    await page.waitForLoadState('domcontentloaded');
    
    // 페이지 제목 확인
    const title = await page.locator('h1').first().textContent();
    expect(title).toContain('비밀번호 재설정');
  });

  test('2. 이메일 요청 성공', async ({ page }) => {
    await page.goto('http://localhost:3000/forgot-password');
    await page.waitForLoadState('domcontentloaded');
    
    // 이메일 입력
    await page.fill('input[name="email"]', TEST_EMAIL);
    
    // 제출
    await page.click('button[type="submit"]');
    
    // 성공 화면 확인 (h1 태그의 텍스트 변경 확인)
    await page.waitForFunction(() => {
      const h1 = document.querySelector('h1');
      return h1 && h1.textContent?.includes('이메일을 확인해주세요');
    }, { timeout: 10000 });
    
    const successTitle = await page.locator('h1').first().textContent();
    expect(successTitle).toContain('이메일을 확인해주세요');
  });

  test('3. 빈 이메일 검증', async ({ page }) => {
    await page.goto('http://localhost:3000/forgot-password');
    await page.waitForLoadState('domcontentloaded');
    
    // HTML5 검증 비활성화
    await page.evaluate(() => {
      const input = document.querySelector('input[name="email"]');
      if (input) {
        input.removeAttribute('required');
        input.setAttribute('type', 'text');
      }
    });
    
    // 빈 상태로 제출
    await page.click('button[type="submit"]');
    
    // 에러 메시지 확인
    await page.waitForSelector('.forgot-password-request-error-message', { timeout: 5000 });
    const error = await page.textContent('.forgot-password-request-error-message');
    expect(error).toContain('이메일을 입력해주세요');
  });

  test('4. 잘못된 이메일 형식', async ({ page }) => {
    await page.goto('http://localhost:3000/forgot-password');
    await page.waitForLoadState('domcontentloaded');
    
    // HTML5 검증 비활성화
    await page.evaluate(() => {
      const input = document.querySelector('input[name="email"]');
      if (input) {
        input.setAttribute('type', 'text');
      }
      const form = document.querySelector('form');
      if (form) {
        form.setAttribute('novalidate', 'true');
      }
    });
    
    // 잘못된 이메일 입력
    await page.fill('input[name="email"]', 'not-an-email');
    
    // 제출
    await page.click('button[type="submit"]');
    
    // 에러 메시지 확인
    await page.waitForSelector('.forgot-password-request-error-message', { timeout: 5000 });
    const error = await page.textContent('.forgot-password-request-error-message');
    expect(error).toContain('올바른 이메일 형식이 아닙니다');
  });

  test('5. 새 비밀번호 설정 페이지', async ({ page }) => {
    await page.goto(`http://localhost:3000/reset-password?token=${MOCK_TOKEN}`);
    await page.waitForLoadState('domcontentloaded');
    
    // 폼 로드 대기
    await page.waitForSelector('input[name="newPassword"]', { timeout: 10000 });
    
    // 제목 확인
    const title = await page.locator('h1').first().textContent();
    expect(title).toContain('새 비밀번호 설정');
  });

  test('6. 비밀번호 변경 성공', async ({ page }) => {
    await page.goto(`http://localhost:3000/reset-password?token=${MOCK_TOKEN}`);
    await page.waitForLoadState('domcontentloaded');
    
    // 폼 로드 대기
    await page.waitForSelector('input[name="newPassword"]', { timeout: 10000 });
    
    // 비밀번호 입력
    await page.fill('input[name="newPassword"]', 'NewPassword@123');
    await page.fill('input[name="confirmPassword"]', 'NewPassword@123');
    
    // 제출
    await page.click('button[type="submit"]');
    
    // 성공 화면 대기
    await page.waitForFunction(() => {
      const h1 = document.querySelector('h1');
      return h1 && h1.textContent?.includes('비밀번호가 변경되었습니다');
    }, { timeout: 10000 });
    
    const successTitle = await page.locator('h1').first().textContent();
    expect(successTitle).toContain('비밀번호가 변경되었습니다');
  });

  test('7. 비밀번호 불일치', async ({ page }) => {
    await page.goto(`http://localhost:3000/reset-password?token=${MOCK_TOKEN}`);
    await page.waitForLoadState('domcontentloaded');
    
    await page.waitForSelector('input[name="newPassword"]', { timeout: 10000 });
    
    // 다른 비밀번호 입력
    await page.fill('input[name="newPassword"]', 'Password123');
    await page.fill('input[name="confirmPassword"]', 'Different123');
    
    // 제출
    await page.click('button[type="submit"]');
    
    // 에러 메시지 확인
    await page.waitForSelector('.reset-password-confirm-error', { timeout: 5000 });
    const error = await page.textContent('.reset-password-confirm-error');
    expect(error).toContain('비밀번호가 일치하지 않습니다');
  });

  test('8. 짧은 비밀번호', async ({ page }) => {
    await page.goto(`http://localhost:3000/reset-password?token=${MOCK_TOKEN}`);
    await page.waitForLoadState('domcontentloaded');
    
    await page.waitForSelector('input[name="newPassword"]', { timeout: 10000 });
    
    // 짧은 비밀번호
    await page.fill('input[name="newPassword"]', 'Ab1');
    await page.fill('input[name="confirmPassword"]', 'Ab1');
    
    // 제출
    await page.click('button[type="submit"]');
    
    // 에러 메시지 확인
    await page.waitForSelector('.reset-password-new-error', { timeout: 5000 });
    const error = await page.textContent('.reset-password-new-error');
    expect(error).toContain('최소 8자 이상');
  });

  test('9. 잘못된 토큰', async ({ page }) => {
    await page.goto('http://localhost:3000/reset-password?token=wrong-token');
    await page.waitForLoadState('domcontentloaded');
    
    // 에러 메시지 대기
    await page.waitForSelector('.reset-password-error-message', { timeout: 10000 });
    const error = await page.textContent('.reset-password-error-message');
    expect(error).toContain('유효하지 않은 토큰입니다');
  });

  test('10. 전체 플로우', async ({ page }) => {
    // 1. 비밀번호 재설정 페이지
    await page.goto('http://localhost:3000/forgot-password');
    await page.waitForLoadState('domcontentloaded');
    
    // 2. 이메일 입력
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.click('button[type="submit"]');
    
    // 3. 성공 확인
    await page.waitForFunction(() => {
      const h1 = document.querySelector('h1');
      return h1 && h1.textContent?.includes('이메일을 확인해주세요');
    }, { timeout: 10000 });
    
    // 4. 비밀번호 재설정 페이지로 이동
    await page.goto(`http://localhost:3000/reset-password?token=${MOCK_TOKEN}`);
    await page.waitForSelector('input[name="newPassword"]', { timeout: 10000 });
    
    // 5. 새 비밀번호 입력
    await page.fill('input[name="newPassword"]', 'FinalPassword@2024');
    await page.fill('input[name="confirmPassword"]', 'FinalPassword@2024');
    await page.click('button[type="submit"]');
    
    // 6. 성공 확인
    await page.waitForFunction(() => {
      const h1 = document.querySelector('h1');
      return h1 && h1.textContent?.includes('비밀번호가 변경되었습니다');
    }, { timeout: 10000 });
    
    const finalTitle = await page.locator('h1').first().textContent();
    expect(finalTitle).toContain('비밀번호가 변경되었습니다');
  });
});
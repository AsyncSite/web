/**
 * Simple Playwright Test
 * 
 * Cucumber 없이 Playwright만으로 실제 테스트
 */

import { test, expect } from '@playwright/test';

test.describe('회원가입 검증 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/signup');
  });

  test('이메일 실시간 검증 테스트', async ({ page }) => {
    console.log('테스트 시작: 이메일 실시간 검증');
    
    // 이메일 방식 선택
    const emailMethodButton = page.locator('button:has-text("이메일로 시작하기")');
    await emailMethodButton.click();
    
    // 잘못된 이메일 입력
    const emailInput = page.locator('input#email');
    await emailInput.fill('test@');
    await page.waitForTimeout(600); // 디바운스 대기
    
    // 에러 메시지 확인
    const errorMessage = page.locator('.error-message').first();
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('올바른 이메일 형식');
    
    console.log('✅ 이메일 형식 검증 완료');
    
    // 올바른 이메일로 수정
    await emailInput.fill('test@example.com');
    await page.waitForTimeout(600);
    
    // 성공 상태 확인
    const successIndicator = page.locator('.input-status.success');
    await expect(successIndicator).toBeVisible({ timeout: 5000 });
    
    console.log('✅ 이메일 유효성 검증 완료');
  });

  test('비밀번호 강도 측정 테스트', async ({ page }) => {
    console.log('테스트 시작: 비밀번호 강도 측정');
    
    // 이메일 방식 선택
    await page.locator('button:has-text("이메일로 시작하기")').click();
    
    // 이메일 입력하고 다음 단계로
    await page.locator('input#email').fill('user@example.com');
    await page.waitForTimeout(600);
    // 이메일 단계의 계속하기 버튼 (첫 번째 enabled 버튼)
    await page.locator('button:has-text("계속하기"):not([disabled])').first().click();
    
    // 이름 입력하고 다음 단계로
    await page.locator('input#name').fill('테스트사용자');
    // 이름 단계의 계속하기 버튼 (현재 visible이고 enabled인 버튼)
    await page.locator('button:has-text("계속하기"):not([disabled]):visible').click();
    
    // 비밀번호 입력
    const passwordInput = page.locator('input#password');
    
    // 약한 비밀번호
    await passwordInput.fill('password');
    await page.waitForTimeout(300);
    
    const strengthIndicator = page.locator('.password-strength-indicator');
    await expect(strengthIndicator).toBeVisible();
    await expect(strengthIndicator).toContainText(/약함|매우 약함/);
    
    console.log('✅ 약한 비밀번호 감지 완료');
    
    // 강한 비밀번호
    await passwordInput.fill('P@ssw0rd!2024');
    await page.waitForTimeout(300);
    
    await expect(strengthIndicator).toContainText(/강함|매우 강함/);
    
    console.log('✅ 강한 비밀번호 감지 완료');
    
    // 엔트로피 표시 확인
    const entropyDisplay = page.locator('text=/엔트로피/');
    await expect(entropyDisplay).toBeVisible();
    
    console.log('✅ 엔트로피 표시 확인 완료');
  });

  test('다단계 회원가입 플로우 테스트', async ({ page }) => {
    console.log('테스트 시작: 다단계 회원가입 플로우');
    
    // 이메일 방식 선택
    await page.locator('button:has-text("이메일로 시작하기")').click();
    
    // 1단계: 이메일
    const emailInput = page.locator('input#email');
    await emailInput.fill('newuser@example.com');
    await page.waitForTimeout(600);
    
    const continueButton = page.locator('button:has-text("계속하기"):enabled');
    await continueButton.click();
    
    // 2단계 확인
    const nameInput = page.locator('input#name');
    await expect(nameInput).toBeVisible();
    
    console.log('✅ 1단계 완료: 이메일');
    
    // 2단계: 이름
    await nameInput.fill('테스트사용자');
    await continueButton.click();
    
    // 3단계 확인
    const passwordInput = page.locator('input#password');
    await expect(passwordInput).toBeVisible();
    
    console.log('✅ 2단계 완료: 이름');
    
    // 3단계: 비밀번호
    await passwordInput.fill('Test@1234567');
    await page.waitForTimeout(300);
    await continueButton.click();
    
    // 4단계 확인
    const confirmPasswordInput = page.locator('input#confirmPassword');
    await expect(confirmPasswordInput).toBeVisible();
    
    console.log('✅ 3단계 완료: 비밀번호');
    
    // 4단계: 비밀번호 확인
    await confirmPasswordInput.fill('Test@1234567');
    
    const signupButton = page.locator('button:has-text("회원가입 완료")');
    await expect(signupButton).toBeEnabled();
    
    console.log('✅ 4단계 완료: 전체 플로우 성공');
  });
});
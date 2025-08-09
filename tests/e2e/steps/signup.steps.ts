/**
 * Signup Step Definitions
 * 
 * 회원가입 Feature의 Step 구현
 */

import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { SignupPage } from '../pages/SignupPage';
import { TestWorld } from '../support/world';

/**
 * Given Steps - 사전 조건
 */

Given('회원가입 페이지에 접속한다', async function(this: TestWorld) {
  this.signupPage = new SignupPage(this.page);
  await this.signupPage.navigate();
  await this.signupPage.waitForPageLoad();
});

Given('이메일 회원가입 방식을 선택한다', async function(this: TestWorld) {
  await this.signupPage.selectEmailMethod();
});

Given('이메일 {string} 를 입력하고 다음 단계로 진행한다', async function(this: TestWorld, email: string) {
  await this.signupPage.enterEmail(email);
  await this.signupPage.clickContinue();
});

Given('이름 {string} 을 입력하고 다음 단계로 진행한다', async function(this: TestWorld, name: string) {
  await this.signupPage.enterName(name);
  await this.signupPage.clickContinue();
});

Given('다음 정보로 회원가입을 진행한다:', async function(this: TestWorld, dataTable: DataTable) {
  const data = dataTable.rowsHash();
  
  // 이메일 입력
  if (data['이메일']) {
    await this.signupPage.enterEmail(data['이메일']);
    await this.signupPage.clickContinue();
  }
  
  // 이름 입력
  if (data['이름']) {
    await this.signupPage.enterName(data['이름']);
    await this.signupPage.clickContinue();
  }
  
  // 비밀번호 입력
  if (data['비밀번호']) {
    await this.signupPage.enterPassword(data['비밀번호']);
    await this.signupPage.clickContinue();
  }
});

/**
 * When Steps - 액션
 */

When('이메일 필드에 {string} 를 입력한다', async function(this: TestWorld, email: string) {
  await this.signupPage.enterEmail(email, true);
});

When('이메일 필드를 {string} 로 수정한다', async function(this: TestWorld, email: string) {
  await this.signupPage.enterEmail(email, true);
});

When('이름 필드에 {string} 를 입력한다', async function(this: TestWorld, name: string) {
  await this.signupPage.enterName(name);
});

When('이름 필드를 {string} 로 수정한다', async function(this: TestWorld, name: string) {
  await this.signupPage.enterName(name);
});

When('비밀번호 필드에 {string} 를 입력한다', async function(this: TestWorld, password: string) {
  await this.signupPage.enterPassword(password, true);
});

When('비밀번호 필드에 {string} 를 천천히 입력한다', async function(this: TestWorld, password: string) {
  await this.signupPage.typePasswordSlowly(password);
});

When('비밀번호 필드를 {string} 로 수정한다', async function(this: TestWorld, password: string) {
  await this.signupPage.enterPassword(password, true);
});

When('비밀번호 확인 필드에 {string} 를 입력한다', async function(this: TestWorld, password: string) {
  await this.signupPage.enterConfirmPassword(password);
});

When('비밀번호 확인 필드를 {string} 로 수정한다', async function(this: TestWorld, password: string) {
  await this.signupPage.enterConfirmPassword(password);
});

When('계속하기 버튼을 클릭한다', async function(this: TestWorld) {
  await this.signupPage.clickContinue();
});

When('회원가입 완료 버튼을 클릭한다', async function(this: TestWorld) {
  await this.signupPage.clickSignup();
});

/**
 * Then Steps - 검증
 */

Then('이메일 에러 메시지 {string} 가 표시된다', async function(this: TestWorld, expectedMessage: string) {
  const errorMessage = await this.signupPage.getEmailErrorMessage();
  expect(errorMessage).toContain(expectedMessage);
});

Then('이메일 에러 메시지가 표시되지 않는다', async function(this: TestWorld) {
  const hasError = await this.signupPage.hasFieldError('email');
  expect(hasError).toBeFalsy();
});

Then('이메일 경고 메시지 {string} 가 표시된다', async function(this: TestWorld, expectedWarning: string) {
  const warnings = await this.signupPage.getEmailWarningMessages();
  const hasWarning = warnings.some(w => w.includes(expectedWarning));
  expect(hasWarning).toBeTruthy();
});

Then('이메일 검증 상태가 {string} 으로 표시된다', async function(this: TestWorld, expectedStatus: string) {
  const statusMap: Record<string, 'valid' | 'invalid' | 'checking'> = {
    '사용 가능': 'valid',
    '확인 중': 'checking',
    '사용 불가': 'invalid'
  };
  
  const status = await this.signupPage.getEmailValidationStatus();
  expect(status).toBe(statusMap[expectedStatus]);
});

Then('{int}초 후 이메일 검증 상태가 {string} 으로 표시된다', 
  async function(this: TestWorld, seconds: number, expectedStatus: string) {
    await this.page.waitForTimeout(seconds * 1000);
    
    const statusMap: Record<string, 'valid' | 'invalid' | 'checking'> = {
      '사용 가능': 'valid',
      '확인 중': 'checking',
      '사용 불가': 'invalid'
    };
    
    const status = await this.signupPage.getEmailValidationStatus();
    expect(status).toBe(statusMap[expectedStatus]);
});

Then('비밀번호 강도가 {string} 로 표시된다', async function(this: TestWorld, expectedStrength: string) {
  const strength = await this.signupPage.getPasswordStrength();
  expect(strength).toContain(expectedStrength);
});

Then('비밀번호 엔트로피가 {int} 이상이다', async function(this: TestWorld, minEntropy: number) {
  const entropy = await this.signupPage.getPasswordEntropy();
  expect(entropy).toBeGreaterThanOrEqual(minEntropy);
});

Then('예상 해독 시간이 표시된다', async function(this: TestWorld) {
  const crackTime = await this.signupPage.getPasswordCrackTime();
  expect(crackTime).toBeTruthy();
});

Then('비밀번호 에러 메시지 {string} 가 표시된다', async function(this: TestWorld, expectedMessage: string) {
  const errorMessage = await this.signupPage.getFieldErrorMessage('password');
  expect(errorMessage).toContain(expectedMessage);
});

Then('비밀번호 에러 메시지가 표시되지 않는다', async function(this: TestWorld) {
  const hasError = await this.signupPage.hasFieldError('password');
  expect(hasError).toBeFalsy();
});

Then('비밀번호 경고 메시지 {string} 가 표시된다', async function(this: TestWorld, expectedWarning: string) {
  // Password warning implementation
  const warningElement = this.page.locator('.field-warnings').filter({ hasText: expectedWarning });
  await expect(warningElement).toBeVisible();
});

Then('비밀번호 강도가 {string} 이상으로 표시된다', async function(this: TestWorld, minStrength: string) {
  const strengthOrder = ['매우 약함', '약함', '보통', '적절함', '강함', '매우 강함', '탁월함'];
  const strength = await this.signupPage.getPasswordStrength();
  
  const currentIndex = strengthOrder.findIndex(s => strength.includes(s));
  const minIndex = strengthOrder.indexOf(minStrength);
  
  expect(currentIndex).toBeGreaterThanOrEqual(minIndex);
});

Then('이름 에러 메시지 {string} 가 표시된다', async function(this: TestWorld, expectedMessage: string) {
  const errorMessage = await this.signupPage.getFieldErrorMessage('name');
  expect(errorMessage).toContain(expectedMessage);
});

Then('이름 에러 메시지가 표시되지 않는다', async function(this: TestWorld) {
  const hasError = await this.signupPage.hasFieldError('name');
  expect(hasError).toBeFalsy();
});

Then('비밀번호 확인 에러 메시지 {string} 가 표시된다', async function(this: TestWorld, expectedMessage: string) {
  const errorMessage = await this.signupPage.getFieldErrorMessage('confirmPassword');
  expect(errorMessage).toContain(expectedMessage);
});

Then('비밀번호 확인 에러 메시지가 표시되지 않는다', async function(this: TestWorld) {
  const hasError = await this.signupPage.hasFieldError('confirmPassword');
  expect(hasError).toBeFalsy();
});

Then('계속하기 버튼이 활성화된다', async function(this: TestWorld) {
  const continueButton = this.page.locator('button:has-text("계속하기")');
  await expect(continueButton).toBeEnabled();
});

Then('회원가입 완료 버튼이 활성화된다', async function(this: TestWorld) {
  const signupButton = this.page.locator('button:has-text("회원가입 완료")');
  await expect(signupButton).toBeEnabled();
});

Then('회원가입 완료 버튼이 비활성화된다', async function(this: TestWorld) {
  const signupButton = this.page.locator('button:has-text("회원가입 완료")');
  await expect(signupButton).toBeDisabled();
});

Then('현재 단계가 {string} 이다', async function(this: TestWorld, expectedStep: string) {
  const currentStep = await this.signupPage.getCurrentStep();
  expect(currentStep).toBe(expectedStep);
});

Then('완료된 단계 수가 {int} 이다', async function(this: TestWorld, expectedCount: number) {
  const count = await this.signupPage.getCompletedStepsCount();
  expect(count).toBe(expectedCount);
});

/**
 * Performance & Accessibility Steps
 */

Then('페이지 로딩이 {int}초 이내에 완료된다', async function(this: TestWorld, seconds: number) {
  const metrics = await this.signupPage.collectPerformanceMetrics();
  expect(metrics.loadComplete).toBeLessThan(seconds * 1000);
});

Then('First Contentful Paint가 {int}초 이내이다', async function(this: TestWorld, seconds: number) {
  const metrics = await this.signupPage.collectPerformanceMetrics();
  expect(metrics.firstContentfulPaint).toBeLessThan(seconds * 1000);
});

Then('콘솔에 에러가 없다', async function(this: TestWorld) {
  await this.signupPage.checkForConsoleErrors();
});

Then('페이지 제목이 {string} 를 포함한다', async function(this: TestWorld, expectedTitle: string) {
  await this.signupPage.verifyPageTitle(new RegExp(expectedTitle));
});

Then('모든 입력 필드에 레이블이 있다', async function(this: TestWorld) {
  const inputs = await this.page.locator('input').all();
  
  for (const input of inputs) {
    const id = await input.getAttribute('id');
    if (id) {
      const label = this.page.locator(`label[for="${id}"]`);
      await expect(label).toBeVisible();
    }
  }
});

Then('Tab 키로 모든 요소를 탐색할 수 있다', async function(this: TestWorld) {
  await this.signupPage.checkAccessibility();
});

Then('에러 메시지가 aria-live 영역에 표시된다', async function(this: TestWorld) {
  const errorMessages = await this.page.locator('.error-message').all();
  
  for (const error of errorMessages) {
    const ariaLive = await error.getAttribute('aria-live');
    expect(['polite', 'assertive']).toContain(ariaLive);
  }
});
/**
 * Login Page Object Model
 * 
 * 로그인 페이지의 모든 요소와 액션을 캡슐화
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  // 페이지 요소 로케이터
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly passwordToggle: Locator;
  private readonly forgotPasswordLink: Locator;
  private readonly signupLink: Locator;
  private readonly googleLoginButton: Locator;
  
  // 검증 관련 요소
  private readonly usernameValidationStatus: Locator;
  private readonly usernameErrorMessage: Locator;
  private readonly passwordErrorMessage: Locator;
  private readonly generalErrorMessage: Locator;
  private readonly passwordStrengthHint: Locator;
  private readonly emailFormatIndicator: Locator;
  
  constructor(page: Page) {
    super(page);
    
    // 입력 필드
    this.usernameInput = page.locator('input#username');
    this.passwordInput = page.locator('input#password');
    
    // 버튼
    this.loginButton = page.locator('button:has-text("로그인")').first();
    this.passwordToggle = page.locator('.password-toggle');
    this.googleLoginButton = page.locator('button:has-text("Google로 계속하기")');
    
    // 링크
    this.forgotPasswordLink = page.locator('a:has-text("비밀번호를 잊으셨나요")');
    this.signupLink = page.locator('a:has-text("회원가입")');
    
    // 검증 상태
    this.usernameValidationStatus = page.locator('.input-status').first();
    this.usernameErrorMessage = page.locator('#username ~ .error-message');
    this.passwordErrorMessage = page.locator('#password ~ .error-message');
    this.generalErrorMessage = page.locator('.general-error');
    this.passwordStrengthHint = page.locator('text=/비밀번호 강도/');
    this.emailFormatIndicator = page.locator('text=/이메일 형식 감지됨/');
  }
  
  get url(): string {
    return `${this.baseURL}/login`;
  }
  
  get title(): string {
    return '로그인';
  }
  
  /**
   * 사용자명/이메일 입력
   */
  async enterUsername(username: string): Promise<void> {
    await this.fillInput(this.usernameInput, username);
    await this.waitForDebounce(300);
  }
  
  /**
   * 비밀번호 입력
   */
  async enterPassword(password: string): Promise<void> {
    await this.fillInput(this.passwordInput, password);
  }
  
  /**
   * 로그인 시도
   */
  async login(username: string, password: string): Promise<void> {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLogin();
  }
  
  /**
   * 로그인 버튼 클릭
   */
  async clickLogin(): Promise<void> {
    await this.loginButton.click();
    
    // API 응답 대기
    try {
      await this.waitForAPIResponse('/api/auth/login', 'POST');
    } catch {
      // 로그인 실패도 정상 플로우
    }
  }
  
  /**
   * 비밀번호 토글
   */
  async togglePasswordVisibility(): Promise<void> {
    await this.passwordToggle.click();
  }
  
  /**
   * 비밀번호 가시성 확인
   */
  async isPasswordVisible(): Promise<boolean> {
    const type = await this.passwordInput.getAttribute('type');
    return type === 'text';
  }
  
  /**
   * 이메일 형식 감지 확인
   */
  async isEmailFormatDetected(): Promise<boolean> {
    return await this.emailFormatIndicator.isVisible();
  }
  
  /**
   * 비밀번호 강도 힌트 표시 확인
   */
  async isPasswordStrengthVisible(): Promise<boolean> {
    return await this.passwordStrengthHint.isVisible();
  }
  
  /**
   * 사용자명 검증 상태 확인
   */
  async getUsernameValidationStatus(): Promise<'valid' | 'invalid' | null> {
    if (await this.usernameValidationStatus.filter({ hasText: '✓' }).isVisible()) {
      return 'valid';
    }
    if (await this.usernameErrorMessage.isVisible()) {
      return 'invalid';
    }
    return null;
  }
  
  /**
   * 에러 메시지 가져오기
   */
  async getErrorMessage(field: 'username' | 'password' | 'general'): Promise<string | null> {
    const errorLocators = {
      username: this.usernameErrorMessage,
      password: this.passwordErrorMessage,
      general: this.generalErrorMessage
    };
    
    const locator = errorLocators[field];
    if (await locator.isVisible()) {
      return await locator.textContent();
    }
    return null;
  }
  
  /**
   * 로그인 성공 확인
   */
  async verifyLoginSuccess(): Promise<void> {
    // 로그인 후 리다이렉션 대기
    await this.page.waitForURL(/\/users\/me/, { timeout: 10000 });
  }
  
  /**
   * 로그인 실패 확인
   */
  async verifyLoginFailure(): Promise<void> {
    // 에러 메시지 표시 대기
    await this.waitForElement(this.generalErrorMessage);
  }
  
  /**
   * 비밀번호 찾기 링크 클릭
   */
  async clickForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
  }
  
  /**
   * 회원가입 링크 클릭
   */
  async clickSignupLink(): Promise<void> {
    await this.signupLink.click();
  }
  
  /**
   * Google 로그인 클릭
   */
  async clickGoogleLogin(): Promise<void> {
    await this.googleLoginButton.click();
  }
  
  /**
   * Enter 키로 로그인
   */
  async submitWithEnter(): Promise<void> {
    await this.passwordInput.press('Enter');
  }
  
  /**
   * 로그인 버튼 활성화 상태 확인
   */
  async isLoginButtonEnabled(): Promise<boolean> {
    return await this.loginButton.isEnabled();
  }
}
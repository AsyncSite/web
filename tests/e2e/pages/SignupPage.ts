/**
 * Signup Page Object Model
 * 
 * 회원가입 페이지의 모든 요소와 액션을 캡슐화
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class SignupPage extends BasePage {
  // 페이지 요소 로케이터
  private readonly emailInput: Locator;
  private readonly nameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly confirmPasswordInput: Locator;
  private readonly signupButton: Locator;
  private readonly continueButton: Locator;
  private readonly emailMethodButton: Locator;
  private readonly googleSignupButton: Locator;
  
  // 검증 관련 요소
  private readonly emailValidationStatus: Locator;
  private readonly emailErrorMessage: Locator;
  private readonly emailWarning: Locator;
  private readonly passwordStrengthIndicator: Locator;
  private readonly passwordStrengthLabel: Locator;
  private readonly passwordEntropy: Locator;
  private readonly passwordCrackTime: Locator;
  private readonly passwordErrorMessage: Locator;
  private readonly passwordWarning: Locator;
  private readonly nameErrorMessage: Locator;
  private readonly confirmPasswordErrorMessage: Locator;
  
  // 진행 상태 요소
  private readonly progressSteps: Locator;
  private readonly currentStep: Locator;
  private readonly completedSteps: Locator;
  
  // 보기/숨기기 토글
  private readonly passwordToggle: Locator;
  private readonly confirmPasswordToggle: Locator;
  
  constructor(page: Page) {
    super(page);
    
    // 입력 필드
    this.emailInput = page.locator('input#email');
    this.nameInput = page.locator('input#name');
    this.passwordInput = page.locator('input#password');
    this.confirmPasswordInput = page.locator('input#confirmPassword');
    
    // 버튼
    this.signupButton = page.locator('button:has-text("회원가입 완료")');
    this.continueButton = page.locator('button:has-text("계속하기")');
    this.emailMethodButton = page.locator('button:has-text("이메일로 시작하기")');
    this.googleSignupButton = page.locator('button:has-text("Google로 계속하기")');
    
    // 이메일 검증 상태
    this.emailValidationStatus = page.locator('.input-status');
    this.emailErrorMessage = page.locator('#email ~ .error-message');
    this.emailWarning = page.locator('.field-warnings');
    
    // 비밀번호 강도 표시
    this.passwordStrengthIndicator = page.locator('.password-strength-indicator');
    this.passwordStrengthLabel = page.locator('.password-strength-indicator span').first();
    this.passwordEntropy = page.locator('text=/엔트로피.*bits/');
    this.passwordCrackTime = page.locator('text=/예상 해독 시간/');
    this.passwordErrorMessage = page.locator('#password ~ .error-message');
    this.passwordWarning = page.locator('#password ~ .field-warnings');
    
    // 기타 에러 메시지
    this.nameErrorMessage = page.locator('#name ~ .error-message');
    this.confirmPasswordErrorMessage = page.locator('#confirmPassword ~ .error-message');
    
    // 진행 상태
    this.progressSteps = page.locator('.progress-step');
    this.currentStep = page.locator('.progress-step.active');
    this.completedSteps = page.locator('.progress-step.completed');
    
    // 토글 버튼
    this.passwordToggle = page.locator('#password ~ .password-toggle');
    this.confirmPasswordToggle = page.locator('#confirmPassword ~ .password-toggle');
  }
  
  get url(): string {
    return `${this.baseURL}/signup`;
  }
  
  get title(): string {
    return '회원가입';
  }
  
  /**
   * 이메일 방식 선택
   */
  async selectEmailMethod(): Promise<void> {
    await this.waitForElement(this.emailMethodButton);
    await this.clickAndWait(this.emailMethodButton);
  }
  
  /**
   * 이메일 입력 (실시간 검증 포함)
   */
  async enterEmail(email: string, waitForValidation: boolean = true): Promise<void> {
    await this.fillInput(this.emailInput, email);
    
    if (waitForValidation) {
      await this.waitForDebounce(600); // 디바운스 대기
      await this.waitForEmailValidation();
    }
  }
  
  /**
   * 이메일 천천히 입력 (실시간 검증 관찰용)
   */
  async typeEmailSlowly(email: string): Promise<void> {
    await this.typeSlowly(this.emailInput, email, 150);
    await this.waitForDebounce(600);
  }
  
  /**
   * 이메일 검증 완료 대기
   */
  async waitForEmailValidation(): Promise<void> {
    // API 호출 대기
    try {
      await this.waitForAPIResponse('/api/users/check-email', 'GET');
    } catch {
      // API 호출이 없을 수도 있음 (이미 캐시된 경우)
    }
    
    // 검증 상태 표시 대기
    await this.page.waitForTimeout(500);
  }
  
  /**
   * 이메일 검증 상태 확인
   */
  async getEmailValidationStatus(): Promise<'valid' | 'invalid' | 'checking'> {
    if (await this.emailValidationStatus.filter({ hasText: '확인 중' }).isVisible()) {
      return 'checking';
    }
    if (await this.emailValidationStatus.filter({ hasText: '✓' }).isVisible()) {
      return 'valid';
    }
    if (await this.emailErrorMessage.isVisible()) {
      return 'invalid';
    }
    return 'invalid';
  }
  
  /**
   * 이메일 에러 메시지 가져오기
   */
  async getEmailErrorMessage(): Promise<string | null> {
    if (await this.emailErrorMessage.isVisible()) {
      return await this.emailErrorMessage.textContent();
    }
    return null;
  }
  
  /**
   * 이메일 경고 메시지 가져오기
   */
  async getEmailWarningMessages(): Promise<string[]> {
    if (await this.emailWarning.isVisible()) {
      const warnings = await this.emailWarning.locator('div').allTextContents();
      return warnings.map(w => w.replace('⚠️', '').trim());
    }
    return [];
  }
  
  /**
   * 이름 입력
   */
  async enterName(name: string): Promise<void> {
    await this.fillInput(this.nameInput, name);
    await this.waitForDebounce(300);
  }
  
  /**
   * 비밀번호 입력 (실시간 강도 측정 포함)
   */
  async enterPassword(password: string, waitForStrength: boolean = true): Promise<void> {
    await this.fillInput(this.passwordInput, password);
    
    if (waitForStrength) {
      await this.waitForDebounce(300);
      await this.waitForPasswordStrength();
    }
  }
  
  /**
   * 비밀번호 천천히 입력 (강도 변화 관찰용)
   */
  async typePasswordSlowly(password: string): Promise<void> {
    await this.typeSlowly(this.passwordInput, password, 200);
    await this.waitForDebounce(300);
  }
  
  /**
   * 비밀번호 강도 측정 완료 대기
   */
  async waitForPasswordStrength(): Promise<void> {
    await this.waitForElement(this.passwordStrengthIndicator);
    await this.page.waitForTimeout(300);
  }
  
  /**
   * 비밀번호 강도 가져오기
   */
  async getPasswordStrength(): Promise<string> {
    await this.waitForElement(this.passwordStrengthLabel);
    const strength = await this.passwordStrengthLabel.textContent();
    return strength?.trim() || '';
  }
  
  /**
   * 비밀번호 엔트로피 가져오기
   */
  async getPasswordEntropy(): Promise<number> {
    if (await this.passwordEntropy.isVisible()) {
      const text = await this.passwordEntropy.textContent();
      const match = text?.match(/(\d+\.?\d*)/);
      return match ? parseFloat(match[1]) : 0;
    }
    return 0;
  }
  
  /**
   * 비밀번호 해독 시간 가져오기
   */
  async getPasswordCrackTime(): Promise<string | null> {
    if (await this.passwordCrackTime.isVisible()) {
      const text = await this.passwordCrackTime.textContent();
      const match = text?.match(/예상 해독 시간:\s*(.+)/);
      return match ? match[1].trim() : null;
    }
    return null;
  }
  
  /**
   * 비밀번호 확인 입력
   */
  async enterConfirmPassword(password: string): Promise<void> {
    await this.fillInput(this.confirmPasswordInput, password);
  }
  
  /**
   * 계속하기 버튼 클릭
   */
  async clickContinue(): Promise<void> {
    await this.waitForElement(this.continueButton);
    await this.clickAndWait(this.continueButton);
  }
  
  /**
   * 회원가입 완료 버튼 클릭
   */
  async clickSignup(): Promise<void> {
    await this.waitForElement(this.signupButton);
    await this.signupButton.click();
    
    // API 응답 대기
    await this.waitForAPIResponse('/api/auth/register', 'POST');
  }
  
  /**
   * 현재 단계 가져오기
   */
  async getCurrentStep(): Promise<string> {
    const stepText = await this.currentStep.locator('.step-label').textContent();
    return stepText?.trim() || '';
  }
  
  /**
   * 완료된 단계 수 가져오기
   */
  async getCompletedStepsCount(): Promise<number> {
    return await this.completedSteps.count();
  }
  
  /**
   * 전체 회원가입 플로우 실행
   */
  async completeSignup(userData: {
    email: string;
    name: string;
    password: string;
  }): Promise<void> {
    // 이메일 방식 선택
    await this.selectEmailMethod();
    
    // 이메일 입력
    await this.enterEmail(userData.email);
    await this.clickContinue();
    
    // 이름 입력
    await this.enterName(userData.name);
    await this.clickContinue();
    
    // 비밀번호 입력
    await this.enterPassword(userData.password);
    await this.clickContinue();
    
    // 비밀번호 확인
    await this.enterConfirmPassword(userData.password);
    
    // 회원가입 완료
    await this.clickSignup();
  }
  
  /**
   * 비밀번호 보기/숨기기 토글
   */
  async togglePasswordVisibility(): Promise<void> {
    await this.passwordToggle.click();
  }
  
  /**
   * 비밀번호 확인 보기/숨기기 토글
   */
  async toggleConfirmPasswordVisibility(): Promise<void> {
    await this.confirmPasswordToggle.click();
  }
  
  /**
   * 비밀번호 가시성 확인
   */
  async isPasswordVisible(): Promise<boolean> {
    const type = await this.passwordInput.getAttribute('type');
    return type === 'text';
  }
  
  /**
   * 필드별 검증 에러 확인
   */
  async hasFieldError(field: 'email' | 'name' | 'password' | 'confirmPassword'): Promise<boolean> {
    const errorLocators = {
      email: this.emailErrorMessage,
      name: this.nameErrorMessage,
      password: this.passwordErrorMessage,
      confirmPassword: this.confirmPasswordErrorMessage
    };
    
    return await errorLocators[field].isVisible();
  }
  
  /**
   * 필드별 에러 메시지 가져오기
   */
  async getFieldErrorMessage(field: 'email' | 'name' | 'password' | 'confirmPassword'): Promise<string | null> {
    const errorLocators = {
      email: this.emailErrorMessage,
      name: this.nameErrorMessage,
      password: this.passwordErrorMessage,
      confirmPassword: this.confirmPasswordErrorMessage
    };
    
    if (await errorLocators[field].isVisible()) {
      return await errorLocators[field].textContent();
    }
    return null;
  }
}
/**
 * Password Change Page Object Model
 * 
 * 비밀번호 변경 모달/페이지의 모든 요소와 액션을 캡슐화
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class PasswordChangePage extends BasePage {
  // 모달 요소
  private readonly modal: Locator;
  private readonly modalBackdrop: Locator;
  private readonly modalCloseButton: Locator;
  
  // 입력 필드
  private readonly currentPasswordInput: Locator;
  private readonly newPasswordInput: Locator;
  private readonly confirmPasswordInput: Locator;
  
  // 버튼
  private readonly changePasswordButton: Locator;
  private readonly cancelButton: Locator;
  private readonly currentPasswordToggle: Locator;
  private readonly newPasswordToggle: Locator;
  private readonly confirmPasswordToggle: Locator;
  
  // 검증 관련 요소
  private readonly currentPasswordError: Locator;
  private readonly newPasswordError: Locator;
  private readonly confirmPasswordError: Locator;
  private readonly generalError: Locator;
  private readonly successMessage: Locator;
  
  // 비밀번호 강도 표시
  private readonly passwordStrengthVisualization: Locator;
  private readonly strengthLabel: Locator;
  private readonly strengthBar: Locator;
  private readonly entropyDisplay: Locator;
  private readonly crackTimeDisplay: Locator;
  private readonly improvementTips: Locator;
  private readonly warningDisplay: Locator;
  
  // 보안 팁
  private readonly securityTips: Locator;
  
  constructor(page: Page) {
    super(page);
    
    // 모달 컨테이너
    this.modal = page.locator('.password-modal');
    this.modalBackdrop = page.locator('.modal-backdrop');
    this.modalCloseButton = page.locator('.modal-close');
    
    // 입력 필드
    this.currentPasswordInput = page.locator('input#currentPassword');
    this.newPasswordInput = page.locator('input#newPassword');
    this.confirmPasswordInput = page.locator('input#confirmPassword');
    
    // 버튼
    this.changePasswordButton = page.locator('button:has-text("비밀번호 변경")').last();
    this.cancelButton = page.locator('button:has-text("취소")');
    this.currentPasswordToggle = page.locator('#currentPassword ~ .password-toggle');
    this.newPasswordToggle = page.locator('#newPassword ~ .password-toggle');
    this.confirmPasswordToggle = page.locator('#confirmPassword ~ .password-toggle');
    
    // 에러 메시지
    this.currentPasswordError = page.locator('#currentPassword ~ .error-message');
    this.newPasswordError = page.locator('#newPassword ~ .error-message');
    this.confirmPasswordError = page.locator('#confirmPassword ~ .error-message');
    this.generalError = page.locator('.general-error');
    this.successMessage = page.locator('.success-message').filter({ hasText: '비밀번호가 성공적으로 변경되었습니다' });
    
    // 비밀번호 강도 시각화
    this.passwordStrengthVisualization = page.locator('.password-strength-visualization');
    this.strengthLabel = page.locator('.password-strength-visualization span').first();
    this.strengthBar = page.locator('.password-strength-visualization [style*="width"]');
    this.entropyDisplay = page.locator('text=/엔트로피.*bits/');
    this.crackTimeDisplay = page.locator('text=/해독 시간/');
    this.improvementTips = page.locator('text=/개선 제안/').locator('..');
    this.warningDisplay = page.locator('[style*="background-color: #fff8e1"]');
    
    // 보안 팁 섹션
    this.securityTips = page.locator('text=/보안 팁/').locator('..');
  }
  
  get url(): string {
    // 모달이므로 특정 URL 없음
    return `${this.baseURL}/users/me`;
  }
  
  get title(): string {
    return '비밀번호 변경';
  }
  
  /**
   * 모달 열기 (프로필 페이지에서)
   */
  async openModal(): Promise<void> {
    const changePasswordLink = this.page.locator('a:has-text("비밀번호 변경")');
    await changePasswordLink.click();
    await this.waitForElement(this.modal);
  }
  
  /**
   * 모달 닫기
   */
  async closeModal(): Promise<void> {
    await this.modalCloseButton.click();
    await this.waitForElementToDisappear(this.modal);
  }
  
  /**
   * 현재 비밀번호 입력
   */
  async enterCurrentPassword(password: string): Promise<void> {
    await this.fillInput(this.currentPasswordInput, password);
  }
  
  /**
   * 새 비밀번호 입력
   */
  async enterNewPassword(password: string, waitForStrength: boolean = true): Promise<void> {
    await this.fillInput(this.newPasswordInput, password);
    
    if (waitForStrength) {
      await this.waitForDebounce(300);
      await this.waitForPasswordStrength();
    }
  }
  
  /**
   * 새 비밀번호 천천히 입력 (강도 변화 관찰용)
   */
  async typeNewPasswordSlowly(password: string): Promise<void> {
    await this.typeSlowly(this.newPasswordInput, password, 150);
    await this.waitForDebounce(300);
  }
  
  /**
   * 비밀번호 확인 입력
   */
  async enterConfirmPassword(password: string): Promise<void> {
    await this.fillInput(this.confirmPasswordInput, password);
  }
  
  /**
   * 비밀번호 강도 측정 완료 대기
   */
  async waitForPasswordStrength(): Promise<void> {
    await this.waitForElement(this.passwordStrengthVisualization);
    await this.page.waitForTimeout(300);
  }
  
  /**
   * 비밀번호 강도 가져오기
   */
  async getPasswordStrength(): Promise<string> {
    await this.waitForElement(this.strengthLabel);
    const strength = await this.strengthLabel.textContent();
    return strength?.replace(/[😰😟😐🙂😊😄🔒]/g, '').trim() || '';
  }
  
  /**
   * 비밀번호 엔트로피 가져오기
   */
  async getPasswordEntropy(): Promise<number> {
    if (await this.entropyDisplay.isVisible()) {
      const text = await this.entropyDisplay.textContent();
      const match = text?.match(/(\d+\.?\d*)/);
      return match ? parseFloat(match[1]) : 0;
    }
    return 0;
  }
  
  /**
   * 해독 시간 가져오기
   */
  async getCrackTime(): Promise<string | null> {
    if (await this.crackTimeDisplay.isVisible()) {
      const text = await this.crackTimeDisplay.textContent();
      const match = text?.match(/해독 시간:\s*(.+)/);
      return match ? match[1].trim() : null;
    }
    return null;
  }
  
  /**
   * 개선 제안 가져오기
   */
  async getImprovementTips(): Promise<string[]> {
    if (await this.improvementTips.isVisible()) {
      const tips = await this.improvementTips.locator('div').allTextContents();
      return tips.map(t => t.replace('•', '').trim()).filter(t => t && !t.includes('개선 제안'));
    }
    return [];
  }
  
  /**
   * 경고 메시지 가져오기
   */
  async getWarningMessages(): Promise<string[]> {
    if (await this.warningDisplay.isVisible()) {
      const warnings = await this.warningDisplay.locator('div').allTextContents();
      return warnings.map(w => w.replace('⚠️', '').trim());
    }
    return [];
  }
  
  /**
   * 비밀번호 변경 실행
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.enterCurrentPassword(currentPassword);
    await this.enterNewPassword(newPassword);
    await this.enterConfirmPassword(newPassword);
    await this.clickChangePassword();
  }
  
  /**
   * 비밀번호 변경 버튼 클릭
   */
  async clickChangePassword(): Promise<void> {
    await this.changePasswordButton.click();
    
    // API 응답 대기
    try {
      await this.waitForAPIResponse('/api/users/change-password', 'POST');
    } catch {
      // 실패도 정상 플로우
    }
  }
  
  /**
   * 취소 버튼 클릭
   */
  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
    await this.waitForElementToDisappear(this.modal);
  }
  
  /**
   * 비밀번호 토글 (보기/숨기기)
   */
  async togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): Promise<void> {
    const toggleButtons = {
      current: this.currentPasswordToggle,
      new: this.newPasswordToggle,
      confirm: this.confirmPasswordToggle
    };
    
    await toggleButtons[field].click();
  }
  
  /**
   * 비밀번호 가시성 확인
   */
  async isPasswordVisible(field: 'current' | 'new' | 'confirm'): Promise<boolean> {
    const inputs = {
      current: this.currentPasswordInput,
      new: this.newPasswordInput,
      confirm: this.confirmPasswordInput
    };
    
    const type = await inputs[field].getAttribute('type');
    return type === 'text';
  }
  
  /**
   * 에러 메시지 가져오기
   */
  async getErrorMessage(field: 'current' | 'new' | 'confirm' | 'general'): Promise<string | null> {
    const errorLocators = {
      current: this.currentPasswordError,
      new: this.newPasswordError,
      confirm: this.confirmPasswordError,
      general: this.generalError
    };
    
    const locator = errorLocators[field];
    if (await locator.isVisible()) {
      return await locator.textContent();
    }
    return null;
  }
  
  /**
   * 성공 메시지 확인
   */
  async verifySuccessMessage(): Promise<void> {
    await this.waitForElement(this.successMessage);
  }
  
  /**
   * 비밀번호 변경 버튼 활성화 상태
   */
  async isChangeButtonEnabled(): Promise<boolean> {
    return await this.changePasswordButton.isEnabled();
  }
  
  /**
   * 모달 표시 상태 확인
   */
  async isModalVisible(): Promise<boolean> {
    return await this.modal.isVisible();
  }
  
  /**
   * 강도 바 너비 가져오기 (퍼센트)
   */
  async getStrengthBarWidth(): Promise<number> {
    const style = await this.strengthBar.getAttribute('style');
    const match = style?.match(/width:\s*(\d+)%/);
    return match ? parseInt(match[1]) : 0;
  }
  
  /**
   * 새 비밀번호가 현재 비밀번호와 같은지 확인
   */
  async checkSamePasswordError(): Promise<boolean> {
    const error = await this.getErrorMessage('new');
    return error?.includes('현재 비밀번호와 달라야') || false;
  }
  
  /**
   * 비밀번호 일치 확인 표시
   */
  async isPasswordMatchIndicatorVisible(): Promise<boolean> {
    const indicator = this.page.locator('text=/✓ 일치/');
    return await indicator.isVisible();
  }
}
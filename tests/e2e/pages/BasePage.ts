/**
 * Base Page Object Model
 * 
 * 모든 페이지 객체가 상속받는 베이스 클래스
 * 공통 기능과 유틸리티 메서드 제공
 */

import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  protected readonly page: Page;
  protected readonly baseURL: string;
  
  // 공통 로케이터
  protected readonly loadingSpinner: Locator;
  protected readonly errorMessage: Locator;
  protected readonly successMessage: Locator;
  protected readonly toastNotification: Locator;
  
  constructor(page: Page, baseURL: string = 'http://localhost:3000') {
    this.page = page;
    this.baseURL = baseURL;
    
    // 공통 요소 로케이터 초기화
    this.loadingSpinner = page.locator('.loading-spinner');
    this.errorMessage = page.locator('.error-message');
    this.successMessage = page.locator('.success-message');
    this.toastNotification = page.locator('.toast-notification');
  }
  
  /**
   * 페이지 URL (서브클래스에서 구현)
   */
  abstract get url(): string;
  
  /**
   * 페이지 타이틀 (서브클래스에서 구현)
   */
  abstract get title(): string;
  
  /**
   * 페이지로 이동
   */
  async navigate(): Promise<void> {
    await this.page.goto(this.url);
    await this.waitForPageLoad();
  }
  
  /**
   * 페이지 로드 대기
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.waitForLoadingToDisappear();
  }
  
  /**
   * 로딩 스피너가 사라질 때까지 대기
   */
  async waitForLoadingToDisappear(): Promise<void> {
    try {
      await this.loadingSpinner.waitFor({ state: 'visible', timeout: 1000 });
      await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 30000 });
    } catch {
      // 로딩 스피너가 없으면 무시
    }
  }
  
  /**
   * 요소가 보일 때까지 대기
   */
  async waitForElement(locator: Locator, timeout: number = 10000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }
  
  /**
   * 요소가 사라질 때까지 대기
   */
  async waitForElementToDisappear(locator: Locator, timeout: number = 10000): Promise<void> {
    await locator.waitFor({ state: 'hidden', timeout });
  }
  
  /**
   * 텍스트 입력 (clear 후 입력)
   */
  async fillInput(locator: Locator, text: string): Promise<void> {
    await locator.click();
    await locator.fill('');
    await locator.type(text, { delay: 50 }); // 실제 타이핑처럼
  }
  
  /**
   * 천천히 텍스트 입력 (실시간 검증 테스트용)
   */
  async typeSlowly(locator: Locator, text: string, delay: number = 100): Promise<void> {
    await locator.click();
    for (const char of text) {
      await locator.type(char, { delay });
    }
  }
  
  /**
   * 클릭하고 대기
   */
  async clickAndWait(locator: Locator, waitAfter: number = 1000): Promise<void> {
    await locator.click();
    await this.page.waitForTimeout(waitAfter);
  }
  
  /**
   * 스크린샷 촬영
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ 
      path: `tests/e2e/screenshots/${name}-${Date.now()}.png`,
      fullPage: true 
    });
  }
  
  /**
   * 에러 메시지 확인
   */
  async verifyErrorMessage(expectedMessage: string): Promise<void> {
    await this.waitForElement(this.errorMessage);
    await expect(this.errorMessage).toContainText(expectedMessage);
  }
  
  /**
   * 성공 메시지 확인
   */
  async verifySuccessMessage(expectedMessage: string): Promise<void> {
    await this.waitForElement(this.successMessage);
    await expect(this.successMessage).toContainText(expectedMessage);
  }
  
  /**
   * 필드 검증 상태 확인
   */
  async verifyFieldValidation(
    fieldLocator: Locator, 
    isValid: boolean, 
    errorMessage?: string
  ): Promise<void> {
    if (isValid) {
      await expect(fieldLocator).not.toHaveClass(/error/);
      // 성공 표시가 있다면 확인
      const successIndicator = fieldLocator.locator('..').locator('.input-status.success');
      if (await successIndicator.count() > 0) {
        await expect(successIndicator).toBeVisible();
      }
    } else {
      await expect(fieldLocator).toHaveClass(/error/);
      if (errorMessage) {
        const errorElement = fieldLocator.locator('..').locator('.error-message');
        await expect(errorElement).toContainText(errorMessage);
      }
    }
  }
  
  /**
   * 네트워크 요청 대기
   */
  async waitForAPIResponse(
    urlPattern: string | RegExp, 
    method: string = 'GET'
  ): Promise<any> {
    const response = await this.page.waitForResponse(
      response => {
        const matches = typeof urlPattern === 'string' 
          ? response.url().includes(urlPattern)
          : urlPattern.test(response.url());
        return matches && response.request().method() === method;
      },
      { timeout: 30000 }
    );
    return response.json();
  }
  
  /**
   * 디바운스 대기 (실시간 검증 테스트용)
   */
  async waitForDebounce(ms: number = 500): Promise<void> {
    await this.page.waitForTimeout(ms);
  }
  
  /**
   * 콘솔 에러 확인
   */
  async checkForConsoleErrors(): Promise<void> {
    const consoleErrors: string[] = [];
    
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await this.page.waitForTimeout(1000);
    
    expect(consoleErrors).toHaveLength(0);
  }
  
  /**
   * 접근성 체크 (기본)
   */
  async checkAccessibility(): Promise<void> {
    // 기본 접근성 체크
    const title = await this.page.title();
    expect(title).toBeTruthy();
    
    // lang 속성 확인
    const html = this.page.locator('html');
    await expect(html).toHaveAttribute('lang', /ko|en/);
    
    // 키보드 네비게이션 가능 확인
    await this.page.keyboard.press('Tab');
    const focusedElement = await this.page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  }
  
  /**
   * 페이지 성능 메트릭 수집
   */
  async collectPerformanceMetrics(): Promise<any> {
    return await this.page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        domInteractive: perfData.domInteractive,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      };
    });
  }
  
  /**
   * 로컬 스토리지 확인
   */
  async getLocalStorage(key: string): Promise<string | null> {
    return await this.page.evaluate((k) => localStorage.getItem(k), key);
  }
  
  /**
   * 세션 스토리지 확인
   */
  async getSessionStorage(key: string): Promise<string | null> {
    return await this.page.evaluate((k) => sessionStorage.getItem(k), key);
  }
  
  /**
   * 쿠키 확인
   */
  async getCookie(name: string): Promise<any> {
    const cookies = await this.page.context().cookies();
    return cookies.find(c => c.name === name);
  }
  
  /**
   * 현재 URL 확인
   */
  async verifyCurrentURL(expectedURL: string | RegExp): Promise<void> {
    if (typeof expectedURL === 'string') {
      await expect(this.page).toHaveURL(expectedURL);
    } else {
      await expect(this.page).toHaveURL(expectedURL);
    }
  }
  
  /**
   * 페이지 타이틀 확인
   */
  async verifyPageTitle(expectedTitle: string | RegExp): Promise<void> {
    await expect(this.page).toHaveTitle(expectedTitle);
  }
}
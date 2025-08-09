/**
 * Test World
 * 
 * Cucumber World 객체 - 테스트 실행 컨텍스트
 * 모든 step definitions에서 this로 접근 가능
 */

import { World, IWorldOptions, setWorldConstructor } from '@cucumber/cucumber';
import { 
  Browser, 
  BrowserContext, 
  Page, 
  chromium, 
  firefox, 
  webkit,
  PlaywrightTestConfig
} from '@playwright/test';
import { SignupPage } from '../pages/SignupPage';
import { LoginPage } from '../pages/LoginPage';
import { PasswordChangePage } from '../pages/PasswordChangePage';

export interface TestWorldOptions extends IWorldOptions {
  browser?: 'chromium' | 'firefox' | 'webkit';
  headless?: boolean;
  slowMo?: number;
  baseURL?: string;
  apiURL?: string;
  viewport?: { width: number; height: number };
  locale?: string;
  timezoneId?: string;
  permissions?: string[];
  recordVideo?: boolean;
  screenshot?: 'on' | 'off' | 'only-on-failure';
  trace?: 'on' | 'off' | 'retain-on-failure';
}

export class TestWorld extends World<TestWorldOptions> {
  // Playwright 객체들
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  
  // Page Objects
  signupPage!: SignupPage;
  loginPage!: LoginPage;
  passwordChangePage!: PasswordChangePage;
  
  // 테스트 데이터 저장
  testData: Map<string, any> = new Map();
  
  // 설정값
  baseURL: string;
  apiURL: string;
  
  constructor(options: TestWorldOptions) {
    super(options);
    
    // 환경 변수나 파라미터에서 설정 읽기
    this.baseURL = options.parameters?.baseUrl || 'http://localhost:3000';
    this.apiURL = options.parameters?.apiUrl || 'http://localhost:8080';
  }
  
  /**
   * 브라우저 초기화
   */
  async init(): Promise<void> {
    const browserType = this.parameters?.browser || 'chromium';
    const headless = this.parameters?.headless !== false;
    const slowMo = this.parameters?.slowMo || 0;
    
    // 브라우저 시작
    switch (browserType) {
      case 'firefox':
        this.browser = await firefox.launch({ headless, slowMo });
        break;
      case 'webkit':
        this.browser = await webkit.launch({ headless, slowMo });
        break;
      default:
        this.browser = await chromium.launch({ 
          headless, 
          slowMo,
          args: ['--disable-blink-features=AutomationControlled']
        });
    }
    
    // 컨텍스트 생성
    this.context = await this.browser.newContext({
      baseURL: this.baseURL,
      viewport: this.parameters?.viewport || { width: 1280, height: 720 },
      locale: this.parameters?.locale || 'ko-KR',
      timezoneId: this.parameters?.timezoneId || 'Asia/Seoul',
      permissions: this.parameters?.permissions || ['clipboard-read', 'clipboard-write'],
      recordVideo: this.parameters?.recordVideo ? {
        dir: 'tests/e2e/videos',
        size: { width: 1280, height: 720 }
      } : undefined,
      ignoreHTTPSErrors: true,
      extraHTTPHeaders: {
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
      }
    });
    
    // 페이지 생성
    this.page = await this.context.newPage();
    
    // 이벤트 리스너 설정
    this.setupEventListeners();
    
    // API 모킹 설정 (필요시)
    await this.setupAPIMocking();
  }
  
  /**
   * 이벤트 리스너 설정
   */
  private setupEventListeners(): void {
    // 콘솔 로그 캡처
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`[BROWSER ERROR] ${msg.text()}`);
      }
    });
    
    // 페이지 에러 캡처
    this.page.on('pageerror', error => {
      console.error(`[PAGE ERROR] ${error.message}`);
    });
    
    // 네트워크 요청 로깅 (디버그용)
    if (process.env.DEBUG) {
      this.page.on('request', request => {
        console.log(`[REQUEST] ${request.method()} ${request.url()}`);
      });
      
      this.page.on('response', response => {
        console.log(`[RESPONSE] ${response.status()} ${response.url()}`);
      });
    }
  }
  
  /**
   * API 모킹 설정
   */
  private async setupAPIMocking(): Promise<void> {
    // 이메일 중복 체크 모킹 (테스트용)
    if (process.env.MOCK_API === 'true') {
      await this.page.route('**/api/users/check-email**', async route => {
        const url = route.request().url();
        const email = new URL(url).searchParams.get('email');
        
        // 테스트용 이메일 설정
        const usedEmails = ['existing@example.com', 'taken@example.com'];
        const isAvailable = !usedEmails.includes(email || '');
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ available: isAvailable })
        });
      });
    }
  }
  
  /**
   * 정리
   */
  async cleanup(): Promise<void> {
    // 스크린샷 (실패시)
    if (this.parameters?.screenshot === 'only-on-failure' && this.attach) {
      const screenshot = await this.page.screenshot({ fullPage: true });
      await this.attach(screenshot, 'image/png');
    }
    
    // 트레이스 저장
    if (this.parameters?.trace === 'retain-on-failure') {
      await this.context.tracing.stop({ 
        path: `tests/e2e/traces/trace-${Date.now()}.zip` 
      });
    }
    
    // 브라우저 정리
    await this.page?.close();
    await this.context?.close();
    await this.browser?.close();
  }
  
  /**
   * 테스트 데이터 저장
   */
  setTestData(key: string, value: any): void {
    this.testData.set(key, value);
  }
  
  /**
   * 테스트 데이터 가져오기
   */
  getTestData(key: string): any {
    return this.testData.get(key);
  }
  
  /**
   * 랜덤 이메일 생성
   */
  generateRandomEmail(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `test_${timestamp}_${random}@example.com`;
  }
  
  /**
   * 랜덤 비밀번호 생성
   */
  generateRandomPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
  
  /**
   * API 호출 헬퍼
   */
  async callAPI(endpoint: string, options?: RequestInit): Promise<any> {
    const response = await this.page.evaluate(async ({ url, opts }) => {
      const res = await fetch(url, opts);
      return {
        status: res.status,
        body: await res.json()
      };
    }, { url: `${this.apiURL}${endpoint}`, opts: options });
    
    return response;
  }
  
  /**
   * 로그인 상태 설정 (테스트용)
   */
  async setAuthToken(token: string): Promise<void> {
    await this.page.evaluate((t) => {
      localStorage.setItem('auth_token', t);
    }, token);
  }
  
  /**
   * 쿠키 설정
   */
  async setCookies(cookies: Array<{ name: string; value: string; domain?: string; path?: string }>): Promise<void> {
    await this.context.addCookies(cookies);
  }
  
  /**
   * 대기 헬퍼
   */
  async wait(ms: number): Promise<void> {
    await this.page.waitForTimeout(ms);
  }
  
  /**
   * 네트워크 대기
   */
  async waitForNetwork(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }
}

// Cucumber에 World 등록
setWorldConstructor(TestWorld);
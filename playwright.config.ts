/**
 * Playwright E2E Test Configuration
 * 
 * 프로덕션 수준의 E2E 테스트를 위한 상세 설정
 */

import { defineConfig, devices } from '@playwright/test';

/**
 * 환경 변수에서 설정값 읽기
 */
const CI = process.env.CI === 'true';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:8080';

export default defineConfig({
  // 테스트 디렉토리
  testDir: './tests/e2e',
  
  // 테스트 매칭 패턴
  testMatch: /.*\.spec\.ts$/,
  
  // 타임아웃 설정
  timeout: 30 * 1000, // 각 테스트 30초
  expect: {
    timeout: 10 * 1000, // assertion 10초
  },
  
  // 병렬 실행 설정
  fullyParallel: true,
  workers: CI ? 2 : undefined, // CI에서는 2개, 로컬에서는 CPU 코어 수만큼
  
  // 실패 시 재시도
  retries: CI ? 2 : 1,
  
  // 리포터 설정
  reporter: [
    ['html', { outputFolder: 'tests/e2e/reports/html', open: !CI }],
    ['json', { outputFile: 'tests/e2e/reports/test-results.json' }],
    ['junit', { outputFile: 'tests/e2e/reports/junit.xml' }],
    ['list'],
    ...(CI ? [['github'] as any] : []),
  ],
  
  // 글로벌 설정
  use: {
    // 베이스 URL
    baseURL: BASE_URL,
    
    // 추적 설정 (디버깅용)
    trace: CI ? 'on-first-retry' : 'retain-on-failure',
    
    // 스크린샷
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true,
    },
    
    // 비디오 녹화
    video: CI ? 'retain-on-failure' : 'on',
    
    // 뷰포트 크기
    viewport: { width: 1280, height: 720 },
    
    // 액션 타임아웃
    actionTimeout: 15 * 1000,
    
    // 네비게이션 타임아웃
    navigationTimeout: 30 * 1000,
    
    // 권한 설정 (Chrome만 지원)
    // permissions: ['clipboard-read', 'clipboard-write'],
    
    // 로케일 설정
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
    
    // 추가 HTTP 헤더
    extraHTTPHeaders: {
      'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
    },
  },
  
  // 프로젝트별 브라우저 설정
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Chrome 특화 설정
        launchOptions: {
          args: ['--disable-blink-features=AutomationControlled'],
        },
      },
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        // Firefox 특화 설정
        launchOptions: {
          firefoxUserPrefs: {
            'dom.webnotifications.enabled': false,
          },
        },
      },
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        // Safari 특화 설정
      },
    },
    // 모바일 테스트
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5'],
        // 모바일 Chrome 설정
      },
    },
    {
      name: 'mobile-safari',
      use: { 
        ...devices['iPhone 13'],
        // 모바일 Safari 설정
      },
    },
  ],
  
  // 웹 서버 설정 (자동 시작)
  webServer: CI ? undefined : {
    command: 'npm start',
    port: 3000,
    reuseExistingServer: true,
    timeout: 120 * 1000,
    env: {
      BROWSER: 'none', // CRA가 브라우저를 열지 않도록
    },
  },
  
  // 글로벌 Setup/Teardown
  globalSetup: './tests/e2e/support/global-setup.ts',
  globalTeardown: './tests/e2e/support/global-teardown.ts',
  
  // 출력 폴더
  outputDir: 'tests/e2e/test-results',
  
  // 리포트 폴더 정리
  reportSlowTests: {
    max: 10,
    threshold: 15 * 1000, // 15초 이상 걸리는 테스트 리포트
  },
});
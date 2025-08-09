/**
 * Cucumber TypeScript Configuration
 * 
 * TypeScript로 작성된 Cucumber 설정
 */

export default {
  // Feature 파일 위치
  paths: ['tests/e2e/features/**/*.feature'],
  
  // Step definitions 위치
  import: [
    'tests/e2e/steps/**/*.ts',
    'tests/e2e/support/**/*.ts'
  ],
  
  // 포맷터 설정
  format: [
    'progress-bar',
    'html:tests/e2e/reports/cucumber-report.html',
    'json:tests/e2e/reports/cucumber-report.json'
  ],
  
  // 병렬 실행
  parallel: 2,
  
  // 실패 시 빠른 종료
  failFast: false,
  
  // 재시도
  retry: 1,
  
  // 타임아웃 (밀리초)
  timeout: 60000,
  
  // Dry run (실제 실행 없이 검증만)
  dryRun: false,
  
  // Strict 모드 (undefined steps 실패 처리)
  strict: true,
  
  // World 파라미터
  worldParameters: {
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    apiUrl: process.env.API_URL || 'http://localhost:8080',
    slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0,
    headless: process.env.HEADLESS !== 'false',
    screenshot: process.env.SCREENSHOT || 'on-failure',
    video: process.env.VIDEO || 'on-failure'
  }
};
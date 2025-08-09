/**
 * Cucumber Configuration
 * 
 * BDD 스타일 테스트를 위한 Cucumber 설정
 */

module.exports = {
  default: {
    // TypeScript 실행 설정
    requireModule: ['@babel/register'],
    
    // Feature 파일 위치
    paths: ['tests/e2e/features/**/*.feature'],
    
    // Step definitions 위치
    require: [
      'tests/e2e/steps/**/*.ts',
      'tests/e2e/support/**/*.ts'
    ],
    
    // 포맷터 설정
    format: [
      'progress-bar',
      'html:tests/e2e/reports/cucumber-report.html',
      'json:tests/e2e/reports/cucumber-report.json',
      '@cucumber/pretty-formatter'
    ],
    
    // 언어 설정
    language: 'ko',
    
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
    
    // 태그 필터링
    tags: process.env.CUCUMBER_TAGS || '',
    
    // 프로필별 설정
    formatOptions: {
      snippetInterface: 'async-await',
      snippetSyntax: 'tests/e2e/support/custom-snippet-syntax.ts'
    },
    
    // World 파라미터
    worldParameters: {
      baseUrl: process.env.BASE_URL || 'http://localhost:3000',
      apiUrl: process.env.API_URL || 'http://localhost:8080',
      slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0,
      headless: process.env.HEADLESS !== 'false',
      screenshot: process.env.SCREENSHOT || 'on-failure',
      video: process.env.VIDEO || 'on-failure'
    }
  },
  
  // CI 환경 프로필
  ci: {
    paths: ['tests/e2e/features/**/*.feature'],
    require: ['tests/e2e/steps/**/*.ts', 'tests/e2e/support/**/*.ts'],
    format: [
      'json:tests/e2e/reports/cucumber-report.json',
      'junit:tests/e2e/reports/cucumber-junit.xml'
    ],
    parallel: 4,
    retry: 2,
    failFast: false
  },
  
  // 스모크 테스트 프로필
  smoke: {
    paths: ['tests/e2e/features/**/*.feature'],
    require: ['tests/e2e/steps/**/*.ts', 'tests/e2e/support/**/*.ts'],
    tags: '@smoke',
    failFast: true,
    retry: 0
  },
  
  // 회귀 테스트 프로필
  regression: {
    paths: ['tests/e2e/features/**/*.feature'],
    require: ['tests/e2e/steps/**/*.ts', 'tests/e2e/support/**/*.ts'],
    tags: '@regression and not @wip',
    parallel: 4,
    retry: 1
  }
};
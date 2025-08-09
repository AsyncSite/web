/**
 * Cucumber Hooks
 * 
 * 테스트 실행 전/후 처리
 */

import { Before, After, BeforeAll, AfterAll, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { TestWorld } from './world';
import * as fs from 'fs';
import * as path from 'path';

// 기본 타임아웃 설정 (60초)
setDefaultTimeout(60 * 1000);

/**
 * 전체 테스트 실행 전
 */
BeforeAll(async function() {
  console.log('🚀 E2E 테스트 시작');
  console.log(`📍 Base URL: ${process.env.BASE_URL || 'http://localhost:3000'}`);
  console.log(`🔧 API URL: ${process.env.API_URL || 'http://localhost:8080'}`);
  console.log(`🌐 Browser: ${process.env.BROWSER || 'chromium'}`);
  
  // 리포트 디렉토리 생성
  const dirs = [
    'tests/e2e/reports',
    'tests/e2e/screenshots',
    'tests/e2e/videos',
    'tests/e2e/traces'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  // 이전 리포트 정리 (옵션)
  if (process.env.CLEAN_REPORTS === 'true') {
    console.log('🧹 이전 리포트 정리 중...');
    dirs.forEach(dir => {
      fs.readdirSync(dir).forEach(file => {
        fs.unlinkSync(path.join(dir, file));
      });
    });
  }
});

/**
 * 전체 테스트 실행 후
 */
AfterAll(async function() {
  console.log('✅ E2E 테스트 완료');
  
  // 리포트 생성 알림
  console.log('📊 리포트 위치:');
  console.log('   - HTML: tests/e2e/reports/cucumber-report.html');
  console.log('   - JSON: tests/e2e/reports/cucumber-report.json');
  
  // 테스트 통계 출력
  if (fs.existsSync('tests/e2e/reports/cucumber-report.json')) {
    try {
      const report = JSON.parse(fs.readFileSync('tests/e2e/reports/cucumber-report.json', 'utf8'));
      const scenarios = report.flatMap((f: any) => f.elements || []);
      const passed = scenarios.filter((s: any) => s.steps?.every((st: any) => st.result?.status === 'passed')).length;
      const failed = scenarios.filter((s: any) => s.steps?.some((st: any) => st.result?.status === 'failed')).length;
      
      console.log(`\n📈 테스트 결과:`);
      console.log(`   ✅ 성공: ${passed}`);
      console.log(`   ❌ 실패: ${failed}`);
      console.log(`   📊 성공률: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
    } catch (e) {
      // JSON 파싱 실패 무시
    }
  }
});

/**
 * 각 시나리오 실행 전
 */
Before(async function(this: TestWorld, { pickle }) {
  console.log(`\n🎬 시나리오 시작: ${pickle.name}`);
  console.log(`   태그: ${pickle.tags.map((t: any) => t.name).join(', ')}`);
  
  // 브라우저 초기화
  await this.init();
  
  // 트레이싱 시작 (디버깅용)
  if (process.env.TRACE === 'true' || pickle.tags.some((t: any) => t.name === '@trace')) {
    await this.context.tracing.start({
      screenshots: true,
      snapshots: true,
      sources: true
    });
  }
  
  // 느린 모드 (디버깅용)
  if (pickle.tags.some((t: any) => t.name === '@slow')) {
    this.page.setDefaultTimeout(120000);
    await this.page.setViewportSize({ width: 1920, height: 1080 });
  }
  
  // 모바일 테스트
  if (pickle.tags.some((t: any) => t.name === '@mobile')) {
    await this.page.setViewportSize({ width: 375, height: 812 });
  }
  
  // API 모킹 활성화
  if (pickle.tags.some((t: any) => t.name === '@mock')) {
    process.env.MOCK_API = 'true';
  }
});

/**
 * 각 시나리오 실행 후
 */
After(async function(this: TestWorld, { pickle, result }) {
  const status = result?.status;
  console.log(`   결과: ${status === Status.PASSED ? '✅ 성공' : '❌ 실패'}`);
  
  // 실패 시 스크린샷
  if (status === Status.FAILED) {
    console.log(`   📸 스크린샷 촬영 중...`);
    
    // 스크린샷 저장
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotName = `${pickle.name.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.png`;
    const screenshotPath = `tests/e2e/screenshots/${screenshotName}`;
    
    const screenshot = await this.page.screenshot({ 
      fullPage: true,
      path: screenshotPath
    });
    
    // Cucumber 리포트에 첨부
    if (this.attach) {
      await this.attach(screenshot, 'image/png');
    }
    
    console.log(`   💾 스크린샷 저장: ${screenshotPath}`);
    
    // 콘솔 로그 수집
    const consoleLogs = await this.page.evaluate(() => {
      return (window as any).__consoleLogs || [];
    });
    
    if (consoleLogs.length > 0 && this.attach) {
      await this.attach(JSON.stringify(consoleLogs, null, 2), 'application/json');
    }
    
    // HTML 소스 저장 (디버깅용)
    if (process.env.SAVE_HTML === 'true') {
      const html = await this.page.content();
      const htmlPath = `tests/e2e/reports/${screenshotName.replace('.png', '.html')}`;
      fs.writeFileSync(htmlPath, html);
      console.log(`   📄 HTML 저장: ${htmlPath}`);
    }
  }
  
  // 트레이싱 저장
  if (process.env.TRACE === 'true' || pickle.tags.some((t: any) => t.name === '@trace')) {
    const tracePath = `tests/e2e/traces/${pickle.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.zip`;
    await this.context.tracing.stop({ path: tracePath });
    console.log(`   🔍 트레이스 저장: ${tracePath}`);
  }
  
  // 비디오 저장
  if (this.page.video()) {
    const videoPath = await this.page.video()!.path();
    console.log(`   🎥 비디오 저장: ${videoPath}`);
  }
  
  // 정리
  await this.cleanup();
  
  // 메모리 정리
  if (global.gc) {
    global.gc();
  }
});

/**
 * 특정 태그에 대한 Before Hook
 */
Before({ tags: '@auth' }, async function(this: TestWorld) {
  console.log('   🔐 인증 관련 테스트 설정');
  // 인증 관련 초기 설정
});

Before({ tags: '@performance' }, async function(this: TestWorld) {
  console.log('   ⚡ 성능 테스트 설정');
  // 성능 메트릭 수집 시작
  await this.page.evaluate(() => {
    performance.mark('test-start');
  });
});

/**
 * 특정 태그에 대한 After Hook
 */
After({ tags: '@performance' }, async function(this: TestWorld) {
  // 성능 메트릭 수집
  const metrics = await this.page.evaluate(() => {
    performance.mark('test-end');
    performance.measure('test-duration', 'test-start', 'test-end');
    
    const measure = performance.getEntriesByName('test-duration')[0];
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      testDuration: measure?.duration,
      pageLoadTime: navigation?.loadEventEnd - navigation?.fetchStart,
      domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
      firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
      firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime
    };
  });
  
  console.log('   📊 성능 메트릭:', JSON.stringify(metrics, null, 2));
  
  if (this.attach) {
    await this.attach(JSON.stringify(metrics, null, 2), 'application/json');
  }
});

After({ tags: '@accessibility' }, async function(this: TestWorld) {
  console.log('   ♿ 접근성 체크 실행');
  // axe-core 등을 사용한 접근성 체크
});
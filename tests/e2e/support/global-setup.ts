/**
 * Global Setup
 * 
 * 모든 테스트 실행 전 한 번 실행되는 설정
 */

import { chromium, FullConfig } from '@playwright/test';
import * as dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config({ path: '.env.test' });

async function globalSetup(config: FullConfig) {
  console.log('\n🌍 Global Setup 시작...\n');
  
  const startTime = Date.now();
  
  // 환경 변수 검증
  const requiredEnvVars = ['BASE_URL'];
  const missingVars = requiredEnvVars.filter(v => !process.env[v]);
  
  if (missingVars.length > 0) {
    console.warn(`⚠️  환경 변수 누락: ${missingVars.join(', ')}`);
    console.warn('   기본값을 사용합니다.\n');
  }
  
  // 서버 헬스 체크
  const baseURL = process.env.BASE_URL || 'http://localhost:3000';
  const apiURL = process.env.API_URL || 'http://localhost:8080';
  
  console.log('🔍 서버 상태 확인 중...');
  console.log(`   Frontend: ${baseURL}`);
  console.log(`   Backend: ${apiURL}`);
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();
  
  try {
    // Frontend 헬스 체크
    console.log('\n   Frontend 체크...');
    const frontendResponse = await page.goto(baseURL, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    if (frontendResponse?.status() === 200) {
      console.log('   ✅ Frontend 서버 정상');
    } else {
      console.warn(`   ⚠️  Frontend 응답 코드: ${frontendResponse?.status()}`);
    }
    
    // Backend 헬스 체크
    console.log('\n   Backend 체크...');
    try {
      const apiResponse = await page.evaluate(async (url) => {
        try {
          const response = await fetch(`${url}/api/health`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });
          return { 
            status: response.status, 
            ok: response.ok,
            statusText: response.statusText
          };
        } catch (error) {
          return { error: error instanceof Error ? error.message : 'Unknown error' };
        }
      }, apiURL);
      
      if ('error' in apiResponse) {
        console.warn(`   ⚠️  Backend 연결 실패: ${apiResponse.error}`);
        console.warn('   테스트가 실패할 수 있습니다.');
      } else if (apiResponse.ok) {
        console.log('   ✅ Backend 서버 정상');
      } else {
        console.warn(`   ⚠️  Backend 응답: ${apiResponse.status} ${apiResponse.statusText}`);
      }
    } catch (error) {
      console.warn(`   ⚠️  Backend 체크 실패: ${error}`);
    }
    
    // 테스트 데이터 초기화 (옵션)
    if (process.env.RESET_TEST_DATA === 'true') {
      console.log('\n🗑️  테스트 데이터 초기화 중...');
      
      try {
        // 테스트 계정 삭제 등
        await page.evaluate(async (url) => {
          const testEmails = [
            'test@example.com',
            'e2e@example.com',
            'automation@example.com'
          ];
          
          for (const email of testEmails) {
            try {
              await fetch(`${url}/api/test/cleanup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
              });
            } catch {
              // 실패 무시
            }
          }
        }, apiURL);
        
        console.log('   ✅ 테스트 데이터 초기화 완료');
      } catch (error) {
        console.warn('   ⚠️  테스트 데이터 초기화 실패 (무시)');
      }
    }
    
    // 브라우저 정보
    console.log('\n🌐 브라우저 정보:');
    const browserVersion = browser.version();
    console.log(`   버전: ${browserVersion}`);
    
    // 시스템 정보
    console.log('\n💻 시스템 정보:');
    console.log(`   Platform: ${process.platform}`);
    console.log(`   Node: ${process.version}`);
    console.log(`   CPU: ${process.arch}`);
    
  } catch (error) {
    console.error('\n❌ Global Setup 실패:', error);
    throw error;
  } finally {
    await page.close();
    await context.close();
    await browser.close();
  }
  
  const duration = Date.now() - startTime;
  console.log(`\n✅ Global Setup 완료 (${duration}ms)\n`);
  console.log('═'.repeat(50));
}

export default globalSetup;
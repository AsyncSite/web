/**
 * Global Teardown
 * 
 * 모든 테스트 실행 후 한 번 실행되는 정리 작업
 */

import { FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

async function globalTeardown(config: FullConfig) {
  console.log('\n═'.repeat(50));
  console.log('\n🧹 Global Teardown 시작...\n');
  
  const startTime = Date.now();
  
  try {
    // 리포트 파일 확인
    console.log('📊 테스트 리포트 확인 중...');
    
    const reportFiles = [
      'tests/e2e/reports/cucumber-report.html',
      'tests/e2e/reports/cucumber-report.json',
      'tests/e2e/reports/html/index.html'
    ];
    
    reportFiles.forEach(file => {
      if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        const size = (stats.size / 1024).toFixed(2);
        console.log(`   ✅ ${path.basename(file)} (${size} KB)`);
      }
    });
    
    // 스크린샷 정리
    const screenshotDir = 'tests/e2e/screenshots';
    if (fs.existsSync(screenshotDir)) {
      const screenshots = fs.readdirSync(screenshotDir);
      if (screenshots.length > 0) {
        console.log(`\n📸 스크린샷: ${screenshots.length}개`);
        
        // 오래된 스크린샷 정리 (7일 이상)
        if (process.env.CLEANUP_OLD_FILES === 'true') {
          const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
          let cleaned = 0;
          
          screenshots.forEach(file => {
            const filePath = path.join(screenshotDir, file);
            const stats = fs.statSync(filePath);
            
            if (stats.mtimeMs < oneWeekAgo) {
              fs.unlinkSync(filePath);
              cleaned++;
            }
          });
          
          if (cleaned > 0) {
            console.log(`   🗑️  오래된 스크린샷 ${cleaned}개 삭제`);
          }
        }
      }
    }
    
    // 비디오 파일 확인
    const videoDir = 'tests/e2e/videos';
    if (fs.existsSync(videoDir)) {
      const videos = fs.readdirSync(videoDir);
      if (videos.length > 0) {
        console.log(`\n🎥 비디오: ${videos.length}개`);
        
        // 비디오 파일 크기 계산
        let totalSize = 0;
        videos.forEach(file => {
          const filePath = path.join(videoDir, file);
          const stats = fs.statSync(filePath);
          totalSize += stats.size;
        });
        
        console.log(`   총 크기: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
        
        // 크기가 너무 크면 경고
        if (totalSize > 100 * 1024 * 1024) {
          console.warn('   ⚠️  비디오 파일 크기가 100MB를 초과합니다.');
          console.warn('   정리를 고려하세요: rm -rf tests/e2e/videos/*');
        }
      }
    }
    
    // 트레이스 파일 확인
    const traceDir = 'tests/e2e/traces';
    if (fs.existsSync(traceDir)) {
      const traces = fs.readdirSync(traceDir);
      if (traces.length > 0) {
        console.log(`\n🔍 트레이스: ${traces.length}개`);
      }
    }
    
    // 테스트 결과 요약 생성
    if (fs.existsSync('tests/e2e/reports/cucumber-report.json')) {
      try {
        const reportData = JSON.parse(
          fs.readFileSync('tests/e2e/reports/cucumber-report.json', 'utf8')
        );
        
        // 통계 계산
        let totalScenarios = 0;
        let passedScenarios = 0;
        let failedScenarios = 0;
        let totalSteps = 0;
        let passedSteps = 0;
        let failedSteps = 0;
        let totalDuration = 0;
        
        reportData.forEach((feature: any) => {
          (feature.elements || []).forEach((scenario: any) => {
            totalScenarios++;
            
            let scenarioPassed = true;
            (scenario.steps || []).forEach((step: any) => {
              totalSteps++;
              
              if (step.result) {
                totalDuration += step.result.duration || 0;
                
                if (step.result.status === 'passed') {
                  passedSteps++;
                } else if (step.result.status === 'failed') {
                  failedSteps++;
                  scenarioPassed = false;
                }
              }
            });
            
            if (scenarioPassed) {
              passedScenarios++;
            } else {
              failedScenarios++;
            }
          });
        });
        
        // 결과 출력
        console.log('\n📈 테스트 결과 요약:');
        console.log('   ' + '─'.repeat(40));
        console.log(`   시나리오: ${passedScenarios}/${totalScenarios} 성공 (${((passedScenarios/totalScenarios)*100).toFixed(1)}%)`);
        console.log(`   스텝: ${passedSteps}/${totalSteps} 성공 (${((passedSteps/totalSteps)*100).toFixed(1)}%)`);
        console.log(`   실행 시간: ${(totalDuration / 1000000000).toFixed(2)}초`);
        console.log('   ' + '─'.repeat(40));
        
        // 실패한 시나리오 목록
        if (failedScenarios > 0) {
          console.log('\n❌ 실패한 시나리오:');
          reportData.forEach((feature: any) => {
            (feature.elements || []).forEach((scenario: any) => {
              const failed = (scenario.steps || []).some((step: any) => 
                step.result?.status === 'failed'
              );
              
              if (failed) {
                console.log(`   - ${scenario.name}`);
                const failedStep = (scenario.steps || []).find((step: any) => 
                  step.result?.status === 'failed'
                );
                if (failedStep) {
                  console.log(`     실패 스텝: ${failedStep.name}`);
                  if (failedStep.result?.error_message) {
                    console.log(`     에러: ${failedStep.result.error_message.split('\n')[0]}`);
                  }
                }
              }
            });
          });
        }
        
        // 요약 파일 생성
        const summary = {
          timestamp: new Date().toISOString(),
          scenarios: {
            total: totalScenarios,
            passed: passedScenarios,
            failed: failedScenarios,
            passRate: ((passedScenarios/totalScenarios)*100).toFixed(1) + '%'
          },
          steps: {
            total: totalSteps,
            passed: passedSteps,
            failed: failedSteps,
            passRate: ((passedSteps/totalSteps)*100).toFixed(1) + '%'
          },
          duration: (totalDuration / 1000000000).toFixed(2) + 's'
        };
        
        fs.writeFileSync(
          'tests/e2e/reports/summary.json',
          JSON.stringify(summary, null, 2)
        );
        
      } catch (error) {
        console.warn('   ⚠️  리포트 분석 실패:', error);
      }
    }
    
    // 환경 변수 정리
    delete process.env.MOCK_API;
    delete process.env.TRACE;
    
  } catch (error) {
    console.error('❌ Global Teardown 에러:', error);
  }
  
  const duration = Date.now() - startTime;
  console.log(`\n✅ Global Teardown 완료 (${duration}ms)\n`);
  
  // 다음 단계 안내
  console.log('💡 다음 명령어:');
  console.log('   리포트 보기: npm run playwright:report');
  console.log('   스크린샷 보기: open tests/e2e/screenshots');
  console.log('   비디오 보기: open tests/e2e/videos');
  console.log('   트레이스 보기: npx playwright show-trace tests/e2e/traces/*.zip');
  console.log('\n' + '═'.repeat(50) + '\n');
}

export default globalTeardown;
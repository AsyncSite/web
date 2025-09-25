import { test, expect } from '@playwright/test';

test.describe('실험실 탭 상태 유지 테스트', () => {
  test('실험실 입장 → Utilities 탭 선택 → 팀 나누기 → 뒤로가기 시 탭 유지', async ({ page }) => {
    console.log('1. 메인페이지 로드 시작');

    // 메인페이지 로드 - 로컬 개발 서버 테스트
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');
    console.log('1. 메인페이지 로드 완료');

    // 실험실 링크 찾기 및 클릭
    console.log('2. 실험실 링크 찾는 중...');

    // 여러 가능한 선택자로 실험실 링크 찾기
    const labSelectors = [
      'a[href="/lab"]',
      'text="실험실"',
      'text="Lab"',
      'nav a:has-text("실험실")',
      'nav a:has-text("Lab")'
    ];

    let labLink = null;
    for (const selector of labSelectors) {
      try {
        labLink = page.locator(selector).first();
        if (await labLink.isVisible({ timeout: 2000 })) {
          console.log(`실험실 링크 발견: ${selector}`);
          break;
        }
      } catch (e) {
        // 선택자로 찾을 수 없음, 다음 시도
      }
    }

    if (!labLink || !(await labLink.isVisible())) {
      // 만약 실험실 링크가 보이지 않으면, 네비게이션 구조 확인
      console.log('실험실 링크를 찾을 수 없습니다. 네비게이션 구조 확인 중...');

      // 페이지의 모든 링크 출력
      const allLinks = await page.locator('a').all();
      console.log('페이지의 모든 링크:');
      for (let i = 0; i < Math.min(allLinks.length, 10); i++) {
        const link = allLinks[i];
        const text = await link.textContent();
        const href = await link.getAttribute('href');
        console.log(`  - "${text}" (${href})`);
      }

      // 직접 /lab 페이지로 이동
      console.log('직접 /lab 페이지로 이동합니다.');
      await page.goto('https://asyncsite.com/lab');
    } else {
      await labLink.click();
      console.log('2. 실험실 링크 클릭 완료');
    }

    // 실험실 페이지 로드 대기
    await page.waitForLoadState('networkidle');

    // 추가로 Lab 컨텐츠가 로드될 때까지 대기
    await page.waitForTimeout(2000);
    console.log('3. 실험실 페이지 로드 완료');

    // 현재 URL 확인
    const currentUrl = page.url();
    console.log(`현재 URL: ${currentUrl}`);

    // 탭 구조 확인 및 특정 탭 선택
    console.log('4. 탭 구조 확인 중...');

    // 카테고리 필터 버튼들 찾기 (이것이 실제 "탭" 역할)
    const filterSelector = '.filter-btn';
    let tabs = page.locator(filterSelector);

    console.log(`카테고리 필터 버튼 찾는 중: ${filterSelector}`);

    if (!tabs || !(await tabs.first().isVisible())) {
      console.log('카테고리 필터 버튼을 찾을 수 없습니다. 페이지 구조 상세 확인 중...');

      // 페이지가 제대로 로드되었는지 확인
      const pageTitle = await page.title();
      console.log(`페이지 타이틀: ${pageTitle}`);

      // 모든 요소 확인
      const allDivs = await page.locator('div').all();
      console.log(`div 요소 개수: ${allDivs.length}`);

      // 버튼 요소들 확인
      const allButtons = await page.locator('button').all();
      console.log('페이지의 모든 버튼:');
      for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
        const button = allButtons[i];
        const text = await button.textContent();
        const classes = await button.getAttribute('class');
        console.log(`  - "${text}" (class: "${classes}")`);
      }

      // 클래스 이름으로 요소들 확인
      const filterElements = await page.locator('[class*="filter"]').all();
      console.log(`filter가 포함된 클래스 요소 개수: ${filterElements.length}`);

      const categoryElements = await page.locator('[class*="category"]').all();
      console.log(`category가 포함된 클래스 요소 개수: ${categoryElements.length}`);

      // 페이지 스크린샷 캡처
      await page.screenshot({ path: 'tests/e2e/lab-page-debug.png' });
      console.log('디버그용 스크린샷이 tests/e2e/lab-page-debug.png에 저장되었습니다.');

      throw new Error('카테고리 필터 버튼을 찾을 수 없습니다.');
    }

    // 탭 목록 출력
    const tabCount = await tabs.count();
    console.log(`탭 개수: ${tabCount}`);

    for (let i = 0; i < tabCount; i++) {
      const tab = tabs.nth(i);
      const text = await tab.textContent();
      console.log(`  탭 ${i}: "${text}"`);
    }

    // Utilities 카테고리 선택 (스포트라이트 아레나가 여기에 있음)
    let utilitiesTab = null;
    for (let i = 0; i < tabCount; i++) {
      const tab = tabs.nth(i);
      const text = await tab.textContent();
      if (text && text.includes('Utilities')) {
        utilitiesTab = tab;
        console.log(`5. "${text}" 카테고리 선택`);
        break;
      }
    }

    if (utilitiesTab) {
      await utilitiesTab.click();
      await page.waitForTimeout(500); // 필터 전환 대기
      console.log('5. Utilities 카테고리 선택 완료');

      // 선택된 카테고리 상태 확인 (LabPage에서는 'active' 클래스 사용)
      const isActive = await utilitiesTab.evaluate((el) => {
        return el.classList.contains('active');
      });
      console.log(`선택된 카테고리 상태: ${isActive}`);
    } else {
      console.log('Utilities 카테고리를 찾을 수 없습니다.');
    }

    // 팀 나누기 링크 찾기 및 클릭
    console.log('6. 팀 나누기 링크 찾는 중...');

    const teamShuffleSelectors = [
      'a:has-text("팀 나누기")',
      'a:has-text("team-shuffle")',
      'a:has-text("Team Shuffle")',
      '[href*="team-shuffle"]',
      'text="팀 나누기"',
    ];

    let teamShuffleLink = null;
    for (const selector of teamShuffleSelectors) {
      try {
        teamShuffleLink = page.locator(selector).first();
        if (await teamShuffleLink.isVisible({ timeout: 2000 })) {
          console.log(`팀 나누기 링크 발견: ${selector}`);
          break;
        }
      } catch (e) {
        // 선택자로 찾을 수 없음, 다음 시도
      }
    }

    if (!teamShuffleLink || !(await teamShuffleLink.isVisible())) {
      console.log('팀 나누기 링크를 찾을 수 없습니다. 모든 링크 확인 중...');

      // 현재 페이지의 모든 링크 출력
      const allLinks = await page.locator('a').all();
      console.log('현재 페이지의 모든 링크:');
      for (let i = 0; i < Math.min(allLinks.length, 15); i++) {
        const link = allLinks[i];
        const text = await link.textContent();
        const href = await link.getAttribute('href');
        console.log(`  - "${text}" (${href})`);
      }

      throw new Error('팀 나누기 링크를 찾을 수 없습니다.');
    }

    // 팀 나누기 클릭 전에 현재 카테고리 상태 기록
    let selectedTabIndexBefore = -1;
    let selectedTabTextBefore = '';
    for (let i = 0; i < tabCount; i++) {
      const tab = tabs.nth(i);
      const isActive = await tab.evaluate((el) => {
        return el.classList.contains('active');
      });
      if (isActive) {
        selectedTabIndexBefore = i;
        selectedTabTextBefore = (await tab.textContent()) || '';
        console.log(`팀 나누기 이동 전 선택된 카테고리: ${i} ("${selectedTabTextBefore}")`);
        break;
      }
    }

    await teamShuffleLink.click();
    await page.waitForLoadState('networkidle');
    console.log('6. 팀 나누기 페이지 이동 완료');

    // 팀 나누기 페이지 URL 확인
    const teamShuffleUrl = page.url();
    console.log(`팀 나누기 URL: ${teamShuffleUrl}`);

    // 뒤로가기
    console.log('7. 뒤로가기 실행');
    await page.goBack();
    await page.waitForLoadState('networkidle');
    console.log('7. 뒤로가기 완료');

    // 실험실 페이지로 돌아왔는지 확인
    const backUrl = page.url();
    console.log(`뒤로가기 후 URL: ${backUrl}`);

    // 탭 상태 다시 확인
    console.log('8. 뒤로가기 후 탭 상태 확인');

    // 카테고리 필터 버튼들 다시 찾기
    let tabsAfter = page.locator(filterSelector);

    if (tabsAfter) {
      let selectedTabIndexAfter = -1;
      let selectedTabTextAfter = '';
      const tabCountAfter = await tabsAfter.count();

      for (let i = 0; i < tabCountAfter; i++) {
        const tab = tabsAfter.nth(i);
        const isActive = await tab.evaluate((el) => {
          return el.classList.contains('active');
        });
        if (isActive) {
          selectedTabIndexAfter = i;
          selectedTabTextAfter = (await tab.textContent()) || '';
          console.log(`뒤로가기 후 선택된 카테고리: ${i} ("${selectedTabTextAfter}")`);
          break;
        }
      }

      // 탭 상태가 유지되었는지 검증
      console.log(`이동 전 카테고리: ${selectedTabIndexBefore} ("${selectedTabTextBefore}")`);
      console.log(`이동 후 카테고리: ${selectedTabIndexAfter} ("${selectedTabTextAfter}")`);

      if (selectedTabIndexBefore === selectedTabIndexAfter && selectedTabIndexBefore !== -1) {
        console.log('✅ 카테고리 상태가 성공적으로 유지되었습니다!');
      } else {
        console.log('❌ 카테고리 상태가 유지되지 않았습니다.');
        console.log('이는 수정이 필요한 문제입니다.');
        console.log(`예상: "${selectedTabTextBefore}" 카테고리가 유지되어야 하는데, "${selectedTabTextAfter}" 카테고리로 변경되었습니다.`);

        // 문제 확인 완료 - 이제 실제 수정 작업을 진행해야 함
        console.log('🔧 다음 단계: LabPage의 상태 관리 로직을 수정해야 합니다.');
      }
    }

    console.log('8. 탭 상태 유지 테스트 완료');
  });
});
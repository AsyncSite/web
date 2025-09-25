import { test, expect, Page } from '@playwright/test';

test.describe('Study Proposal Page Issues Testing', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    // 페이지 접속
    await page.goto('http://localhost:3000/study/propose');
    // 페이지가 로드될 때까지 대기 (로그인 체크 완료될 때까지)
    await page.waitForTimeout(2000);
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('초기 페이지 로드 상태 확인', async () => {
    // 스크린샷 촬영 - 초기 로드 상태
    await page.screenshot({
      path: 'tests/e2e/study-proposal-initial-state.png',
      fullPage: true
    });

    // 페이지 제목 확인
    await expect(page.getByText('스터디 제안하기')).toBeVisible();

    // 첫 번째 단계(기본 정보)가 활성화되어 있는지 확인
    const activeStep = page.locator('.step-item.active');
    await expect(activeStep).toContainText('기본 정보');
  });

  test('스터디 유형 드롭다운 텍스트 확인', async () => {
    // 스터디 유형 드롭다운 찾기
    const studyTypeSelect = page.locator('select').filter({ hasText: 'PARTICIPATORY' }).or(page.locator('select[value="PARTICIPATORY"]'));

    // 드롭다운 옵션들의 텍스트 확인
    const options = await studyTypeSelect.locator('option').allTextContents();
    console.log('Study type options:', options);

    // 영어 텍스트가 포함되어 있는지 확인
    const hasEnglishText = options.some(option =>
      option.includes('PARTICIPATORY') || option.includes('EDUCATIONAL')
    );

    // 스크린샷 촬영 - 스터디 유형 부분
    await page.screenshot({
      path: 'tests/e2e/study-type-dropdown.png',
      fullPage: true
    });

    console.log('Has English text in study type options:', hasEnglishText);

    // 실제 드롭다운에서 선택해서 값 확인
    await studyTypeSelect.selectOption('EDUCATIONAL');
    const selectedValue = await studyTypeSelect.inputValue();
    console.log('Selected study type value:', selectedValue);
  });

  test('한줄 소개 필드 maxLength 확인', async () => {
    // 한줄 소개 입력 필드 찾기
    const taglineInput = page.locator('input[placeholder*="스터디를 한 문장으로"]');

    // maxLength 속성 확인
    const maxLength = await taglineInput.getAttribute('maxLength');
    console.log('Tagline maxLength:', maxLength);

    // 긴 텍스트 입력해서 제한 확인
    const longText = 'A'.repeat(600); // 600자 입력 시도
    await taglineInput.fill(longText);

    const actualValue = await taglineInput.inputValue();
    console.log('Actual input length after 600 chars:', actualValue.length);

    // 스크린샷 촬영 - 한줄 소개 입력 후
    await page.screenshot({
      path: 'tests/e2e/tagline-maxlength-test.png',
      fullPage: true
    });
  });

  test('모집인원 숫자 삭제 현상 확인', async () => {
    // 모집 정보 단계로 이동 (3단계)
    // 1. 기본 정보 입력
    await page.locator('input[placeholder*="React 심화 스터디"]').fill('테스트 스터디');
    await page.locator('textarea[placeholder*="환영 메시지"]').fill('테스트 환영 메시지입니다');

    // 다음 단계로
    await page.locator('button:has-text("다음")').click();

    // 2. 일정 설정 - ONE_TIME으로 설정하여 간단히 진행
    await page.locator('select[value="WEEKLY"]').selectOption('ONE_TIME');
    await page.locator('input[type="date"]').fill('2024-12-31');
    await page.locator('input[placeholder*="시작 시간"]').fill('14:00');
    await page.locator('input[placeholder*="종료 시간"]').fill('16:00');

    // 다음 단계로
    await page.locator('button:has-text("다음")').click();

    // 3. 섹션 정보 - 필수 섹션 최소 입력
    // 리더 소개 섹션 작성
    await page.locator('button:has-text("➕ 작성")').first().click();
    await page.waitForTimeout(1000);

    // 모달이 열렸는지 확인하고 입력
    const nameInput = page.locator('input[placeholder*="이름"]').or(page.locator('input').first());
    await nameInput.fill('테스트 리더');

    // 소개 입력 (textarea 또는 div contenteditable)
    const introInput = page.locator('textarea').or(page.locator('[contenteditable]')).first();
    await introInput.fill('테스트 리더 소개입니다.');

    // 저장 버튼 클릭
    await page.locator('button:has-text("저장")').click();
    await page.waitForTimeout(1000);

    // 스터디 규칙 섹션도 작성
    await page.locator('button:has-text("➕ 작성")').last().click();
    await page.waitForTimeout(1000);

    // 미팅 개요 입력
    const overviewInput = page.locator('input[placeholder*="개요"]').or(page.locator('input').first());
    await overviewInput.fill('테스트 미팅 개요');

    // 저장
    await page.locator('button:has-text("저장")').click();
    await page.waitForTimeout(1000);

    // 다음 단계로 (모집 정보)
    await page.locator('button:has-text("다음")').click();

    // 모집인원 필드 찾기
    const capacityInput = page.locator('input[type="number"]').or(page.locator('input').filter({ hasText: /^\d+$/ }));

    // 초기 상태 스크린샷
    await page.screenshot({
      path: 'tests/e2e/capacity-initial-state.png',
      fullPage: true
    });

    // 숫자 입력
    await capacityInput.fill('25');
    const valueAfterInput = await capacityInput.inputValue();
    console.log('Value after input "25":', valueAfterInput);

    // 입력 후 스크린샷
    await page.screenshot({
      path: 'tests/e2e/capacity-after-input.png',
      fullPage: true
    });

    // 백스페이스 키로 삭제 시도
    await capacityInput.focus();
    await page.keyboard.press('End'); // 커서를 끝으로
    await page.keyboard.press('Backspace');

    const valueAfterBackspace = await capacityInput.inputValue();
    console.log('Value after backspace:', valueAfterBackspace);

    // 백스페이스 후 스크린샷
    await page.screenshot({
      path: 'tests/e2e/capacity-after-backspace.png',
      fullPage: true
    });

    // Delete 키로 삭제 시도
    await capacityInput.focus();
    await page.keyboard.press('Home'); // 커서를 처음으로
    await page.keyboard.press('Delete');

    const valueAfterDelete = await capacityInput.inputValue();
    console.log('Value after delete key:', valueAfterDelete);

    // Delete 후 스크린샷
    await page.screenshot({
      path: 'tests/e2e/capacity-after-delete.png',
      fullPage: true
    });

    // 전체 선택 후 삭제
    await capacityInput.focus();
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Delete');

    const valueAfterSelectAll = await capacityInput.inputValue();
    console.log('Value after select all + delete:', valueAfterSelectAll);

    // 전체 삭제 후 스크린샷
    await page.screenshot({
      path: 'tests/e2e/capacity-after-select-all-delete.png',
      fullPage: true
    });
  });

  test('브라우저 콘솔 에러 확인', async () => {
    const consoleLogs: string[] = [];
    const consoleErrors: string[] = [];

    // 콘솔 메시지 수집
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      } else {
        consoleLogs.push(`${msg.type()}: ${msg.text()}`);
      }
    });

    // 페이지 새로고침하여 처음부터 콘솔 로그 수집
    await page.reload();
    await page.waitForTimeout(3000);

    // 각 입력 필드들과 상호작용하여 에러 발생 여부 확인
    await page.locator('input[placeholder*="React 심화 스터디"]').fill('테스트');
    await page.locator('input[placeholder*="스터디를 한 문장으로"]').fill('테스트 태그라인');
    await page.locator('select[value="PARTICIPATORY"]').selectOption('EDUCATIONAL');

    await page.waitForTimeout(2000);

    console.log('Console Logs:', consoleLogs);
    console.log('Console Errors:', consoleErrors);

    // 최종 스크린샷
    await page.screenshot({
      path: 'tests/e2e/final-state-with-console-check.png',
      fullPage: true
    });

    // 에러가 있다면 테스트 실패로 처리하지 않고 정보만 출력
    if (consoleErrors.length > 0) {
      console.log('❌ Console errors found:', consoleErrors);
    } else {
      console.log('✅ No console errors detected');
    }
  });
});
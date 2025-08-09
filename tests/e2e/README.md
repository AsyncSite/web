# Playwright E2E 테스트 가이드

## 📝 개요

이 문서는 AsyncSite 프로젝트의 E2E(End-to-End) 테스트 실행 및 관리 방법을 설명합니다.
특히 비밀번호 재설정 기능에 대한 테스트가 구현되어 있습니다.

## 🚀 빠른 시작

### 설치
```bash
# Playwright 설치 (이미 설치되어 있음)
npm install --save-dev @playwright/test

# 브라우저 설치
npx playwright install
```

### 테스트 실행
```bash
# 모든 테스트 실행
npx playwright test

# 특정 테스트 파일 실행
npx playwright test tests/e2e/password-reset-final.spec.ts

# Chrome만으로 실행
npx playwright test --project=chromium

# 디버그 모드로 실행 (브라우저 보이기)
npx playwright test --headed

# 특정 테스트만 실행
npx playwright test -g "비밀번호 재설정 이메일 요청"
```

### 리포트 보기
```bash
# HTML 리포트 열기
npx playwright show-report

# 스크린샷 보기
open tests/e2e/screenshots

# 비디오 보기
open tests/e2e/videos

# 트레이스 파일 보기
npx playwright show-trace tests/e2e/traces/*.zip
```

## 📋 테스트 현황

### ✅ 통과하는 테스트 (5개)

1. **비밀번호 재설정 이메일 요청**
   - 사용자가 이메일을 입력하고 재설정 링크 요청
   - API 모킹으로 백엔드 의존성 제거

2. **새 비밀번호 설정 성공**
   - 토큰과 함께 페이지 방문
   - 새 비밀번호 입력 및 변경 완료

3. **새 비밀번호 설정 페이지 로드**
   - 토큰 검증 및 페이지 표시 확인

4. **유효하지 않은 토큰 처리**
   - 잘못된 토큰으로 접근 시 에러 메시지 표시

5. **전체 플로우 통합 테스트**
   - 로그인 → 비밀번호 재설정 요청 → 새 비밀번호 설정 전체 과정

### ⚠️ 불안정한 테스트 (4개)

다음 테스트들은 타이밍 이슈로 간헐적으로 실패할 수 있습니다:

1. **로그인 페이지에서 비밀번호 재설정 페이지로 이동**
   - 문제: "비밀번호 재설정" 텍스트가 여러 요소에 있어 충돌
   - 해결: 더 구체적인 셀렉터 사용 필요

2. **잘못된 이메일 형식 검증**
   - 문제: 에러 메시지 표시 타이밍
   - 해결: 대기 시간 증가 필요

3. **비밀번호 불일치 검증**
   - 문제: 폼 로딩 시간
   - 해결: 명시적 대기 추가

4. **짧은 비밀번호 검증**
   - 문제: 검증 메시지 표시 지연
   - 해결: 타임아웃 값 조정

## 🔧 환경 설정

### 환경 변수 (.env.test)
```bash
BASE_URL=http://localhost:3000
API_URL=http://localhost:8080
RESET_TEST_DATA=false
CI=false
```

### 개발 서버 실행
```bash
# 프론트엔드 서버 (별도 터미널)
npm start

# 백엔드 서버 (별도 터미널, 옵션)
# 테스트는 API를 모킹하므로 백엔드 없이도 실행 가능
```

## 📁 파일 구조

```
tests/e2e/
├── README.md                      # 이 문서
├── password-reset-final.spec.ts   # 핵심 테스트 (권장)
├── password-reset-simple.spec.ts  # 단순 페이지 로드 테스트
├── password-reset-debug.spec.ts   # 디버깅용 테스트
├── support/
│   ├── global-setup.ts           # 전역 설정
│   ├── global-teardown.ts        # 정리 작업
│   └── hooks.ts                  # 테스트 훅
├── screenshots/                   # 스크린샷 저장
├── videos/                        # 비디오 녹화
├── test-results/                  # 테스트 결과
└── reports/                       # HTML 리포트
```

## 🎯 베스트 프랙티스

### 1. 셀렉터 전략
```typescript
// ❌ 나쁜 예 - 너무 일반적
await page.click('.button');

// ✅ 좋은 예 - 구체적이고 안정적
await page.getByRole('button', { name: '제출' }).click();
await page.locator('input[name="email"]').fill('test@example.com');
```

### 2. 대기 전략
```typescript
// ❌ 나쁜 예 - 고정 시간 대기
await page.waitForTimeout(3000);

// ✅ 좋은 예 - 조건 대기
await page.waitForSelector('.success-message');
await expect(page.getByText('성공')).toBeVisible({ timeout: 10000 });
```

### 3. API 모킹
```typescript
// 테스트 독립성을 위해 API 응답 모킹
await page.route('**/api/auth/**', route => {
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ success: true })
  });
});
```

## 🐛 문제 해결

### 테스트가 타임아웃되는 경우
1. 개발 서버가 실행 중인지 확인
2. 페이지 로딩이 완료되었는지 확인
3. 타임아웃 값 증가 고려

### 셀렉터를 찾을 수 없는 경우
1. 페이지 구조 변경 확인
2. 디버그 모드로 실제 DOM 확인
3. 더 구체적인 셀렉터 사용

### API 모킹이 작동하지 않는 경우
1. Route 패턴이 정확한지 확인
2. 모킹이 네트워크 요청보다 먼저 설정되는지 확인
3. 응답 형식이 백엔드와 일치하는지 확인

## 📊 CI/CD 통합

### GitHub Actions 설정
```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: tests/e2e/reports/
```

## 🔄 지속적 개선

### 앞으로 추가할 테스트
- [ ] 로그인 플로우
- [ ] 회원가입 플로우
- [ ] OAuth 로그인
- [ ] 프로필 수정
- [ ] 접근성 테스트
- [ ] 성능 테스트

### 개선 사항
- [ ] 테스트 데이터 자동 생성
- [ ] 병렬 실행 최적화
- [ ] 크로스 브라우저 테스트 확대
- [ ] 비주얼 회귀 테스트 추가

## 💡 팁

1. **로컬 개발 시**: `--headed` 옵션으로 브라우저를 보면서 디버깅
2. **CI 환경**: 헤드리스 모드와 병렬 실행으로 속도 최적화
3. **실패 분석**: trace 파일과 비디오로 실패 원인 파악
4. **정기 실행**: cron job으로 야간 테스트 실행 고려

## 📚 참고 자료

- [Playwright 공식 문서](https://playwright.dev/docs/intro)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [디버깅 가이드](https://playwright.dev/docs/debug)

---

**작성일**: 2024년 12월
**마지막 업데이트**: 2024년 12월
**담당자**: AsyncSite 개발팀
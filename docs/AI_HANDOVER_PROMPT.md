# AI 작업 인수인계 프롬프트

## 🎯 작업 목표
AsyncSite 프로젝트의 백엔드 비밀번호 검증 시스템 고도화에 따른 프론트엔드 동기화 구현

## 📁 프로젝트 구조
- **백엔드**: `/Users/rene/asyncsite/user-service` (Kotlin, Spring Boot)
- **프론트엔드**: `/Users/rene/asyncsite/web` (React, TypeScript)

## ✅ 완료된 작업 (백엔드)

### 1. 검증 서비스 구현 완료
**위치**: `/Users/rene/asyncsite/user-service/src/main/kotlin/com/asyncsite/userservice/user/application/validation/`

- **EmailValidationService.kt**
  - RFC 5322 이메일 형식 검증
  - 일회용 이메일 도메인 24개 차단
  - XSS/Path Traversal 패턴 차단
  - 길이 검증 (3-254자)

- **PasswordValidationService.kt**
  - 엔트로피 기반 강도 측정 (최소 30)
  - 연속/반복 문자 검증
  - 개인정보 포함 검증
  - 문자 종류 3개 이상 필수
  - 공통 비밀번호 차단

- **NameValidationService.kt**
  - XSS/SQL Injection 방지
  - 제어문자/이모지 차단
  - 길이 검증 (2-50자)

- **EnhancedRegistrationValidationService.kt**
  - 통합 검증 서비스
  - 실시간 검증 API 엔드포인트 제공

### 2. 테스트 커버리지 100% 달성
**위치**: `/Users/rene/asyncsite/user-service/src/test/kotlin/`
- 모든 검증 로직에 대한 단위 테스트 작성 완료

## ❌ 실패한 작업 (프론트엔드)

### 1. Enhanced 페이지 구현 (CSS 문제로 롤백)
- `SignupPageEnhanced.tsx` - CSS 깨짐으로 사용 불가
- `LoginPageEnhanced.tsx` - CSS 깨짐으로 사용 불가
- `PasswordChangeModalEnhanced.tsx` - 구현했으나 통합 안됨

### 2. 클라이언트 검증 유틸리티 (미통합)
**위치**: `/Users/rene/asyncsite/web/src/utils/clientAuthValidation/`
- 백엔드와 동일한 검증 로직 구현했으나 페이지에 통합 실패

### 3. E2E 테스트 프레임워크 (실행 실패)
**위치**: `/Users/rene/asyncsite/web/tests/e2e/`
- Playwright + Cucumber 설정은 완료
- 테스트 시나리오 작성 완료
- 실제 실행 시 버튼 선택자 문제로 실패

## 📝 해야 할 작업

### 1. 프론트엔드 검증 동기화 구현
**참고 문서**: 
- `/Users/rene/asyncsite/web/docs/VALIDATION_SYNC_PLAN.md`
- `/Users/rene/asyncsite/web/docs/IMPLEMENTATION_TASKS.md`

**작업 내용**:
1. 기존 페이지들을 수정하여 백엔드 검증 규칙과 동기화
   - `src/pages/auth/SignupPage.tsx` - 실시간 검증 추가
   - `src/pages/auth/LoginPage.tsx` - 이메일 검증 강화
   - `src/components/auth/PasswordChangeModal.tsx` - 엔트로피 기반 강도 측정

2. 검증 유틸리티 통합
   - `src/utils/clientAuthValidation/` 코드를 실제 페이지에 적용
   - 실시간 피드백 컴포넌트 구현
   - 비밀번호 강도 측정기 UI 개선

3. 사용자 경험 개선
   - 디바운싱 (300ms) 적용
   - 구체적인 에러 메시지 표시
   - 시각적 피드백 (색상, 아이콘)

### 2. 테스트 작성 및 실행
- 단위 테스트 작성
- 통합 테스트 작성
- E2E 테스트 수정 및 실행 확인

## ⚠️ 주의사항

1. **CSS 깨짐 방지**: 기존 스타일을 유지하면서 기능만 추가
2. **점진적 적용**: 한 번에 모든 걸 바꾸지 말고 단계적으로
3. **백엔드 API 호환**: 기존 API와 호환성 유지
4. **성능 고려**: 실시간 검증 시 디바운싱 필수

## 🔧 개발 환경 설정

```bash
# 프론트엔드 개발 서버 실행
cd /Users/rene/asyncsite/web
npm start

# 백엔드 서버 실행 (Docker)
cd /Users/rene/asyncsite/user-service
docker-compose up -d

# E2E 테스트 실행
cd /Users/rene/asyncsite/web
npx playwright test
```

## 📌 검증 규칙 요약

### 이메일
- RFC 5322 형식
- 3-254자
- 일회용 도메인 차단
- XSS 패턴 차단

### 비밀번호
- 8-128자
- 3종류 이상 문자 (대문자/소문자/숫자/특수문자)
- 엔트로피 30 이상
- 연속/반복 문자 금지
- 개인정보 포함 금지

### 이름
- 2-50자
- 한글/영문/숫자/일부 특수문자만 허용
- XSS/SQL Injection 차단

## 🚀 작업 우선순위

1. **긴급**: SignupPage 검증 동기화 (사용자가 가장 먼저 만나는 페이지)
2. **높음**: PasswordChangeModal 개선 (보안 관련)
3. **중간**: LoginPage 검증 강화
4. **낮음**: E2E 테스트 수정

## 💡 추천 접근 방법

1. 먼저 `VALIDATION_SYNC_PLAN.md`와 `IMPLEMENTATION_TASKS.md` 문서를 정독
2. 백엔드 검증 서비스 코드 분석하여 규칙 파악
3. 기존 프론트엔드 코드를 보존하면서 점진적으로 개선
4. 각 단계마다 테스트하여 CSS 깨짐이나 기능 오류 방지

---

**작업 시작 명령어 예시**:
```
"AsyncSite 프로젝트의 프론트엔드 검증 시스템을 백엔드와 동기화해줘. 
/Users/rene/asyncsite/web/docs/VALIDATION_SYNC_PLAN.md와 
/Users/rene/asyncsite/web/docs/IMPLEMENTATION_TASKS.md 문서를 참고해서 
기존 페이지들의 CSS를 깨뜨리지 않으면서 검증 로직만 개선해줘. 
백엔드 검증 규칙은 /Users/rene/asyncsite/user-service/src/main/kotlin/com/asyncsite/userservice/user/application/validation/ 
폴더에 있는 서비스들을 참고하면 돼."
```
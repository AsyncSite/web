# WebAuthn/Passkey 구현 문서

## 개요
AsyncSite 프로젝트에 WebAuthn/FIDO2 기반 패스키(Passkey) 인증 시스템을 구현했습니다. 사용자는 비밀번호 없이 생체인증(지문, 얼굴인식) 또는 디바이스 PIN을 통해 안전하고 빠르게 로그인할 수 있습니다.

## 구현된 기능

### 1. 패스키 로그인 개선
**문제점**: 패스키 미등록 사용자가 "Passkey로 로그인" 버튼 클릭 시 혼란스러운 에러 메시지 표시

**해결책**:
- 친근한 에러 메시지와 함께 회원가입 링크 제공
- 패스키가 없는 경우 명확한 안내 문구 표시

**구현 파일**: `/src/pages/auth/LoginPage.tsx`

```typescript
// 패스키 에러 처리 로직
if (error?.name === 'NotAllowedError') {
  setPasskeyError(
    <span>
      아직 패스키가 등록되지 않았습니다. 
      <Link to="/signup"> 회원가입</Link> 후 패스키를 등록하거나, 
      이메일/비밀번호로 로그인하세요.
    </span>
  );
}
```

### 2. 로그인 후 패스키 등록 유도
**기능**: 패스키 미등록 사용자가 일반 로그인 성공 시 패스키 등록 모달 표시

**구현 내용**:
- 로그인 성공 후 자동으로 패스키 등록 제안
- 7일간 "나중에 하기" 선택 시 모달 표시 안함
- 패스키의 장점을 시각적으로 표현

**구현 파일**: 
- `/src/components/auth/PasskeyPromptModal.tsx` (모달 컴포넌트)
- `/src/pages/auth/LoginPage.tsx` (통합)

### 3. Chrome Conditional UI 지원
**기능**: 이메일 입력란 클릭 시 저장된 패스키 자동 제안

**구현 내용**:
- WebAuthn의 `mediation: 'conditional'` 옵션 활용
- 브라우저가 Conditional UI를 지원하는 경우에만 활성화
- 사용자가 이메일 필드에 포커스하면 자동으로 패스키 목록 표시

**구현 파일**: `/src/pages/auth/LoginPage.tsx`

```typescript
// Conditional UI 초기화
useEffect(() => {
  if (conditionalUISupported && !conditionalUIAbortController.current) {
    initializeConditionalUI();
  }
}, [conditionalUISupported]);
```

### 4. 회원가입 후 패스키 등록
**기능**: 회원가입 완료 직후 패스키 등록 권유

**구현 내용**:
- 회원가입 성공 시 패스키 등록 모달 자동 표시
- WebAuthn 미지원 브라우저는 바로 프로필 페이지로 이동
- 사용자가 선택할 때까지 리다이렉트 지연

**구현 파일**: `/src/pages/auth/SignupPage.tsx`

```typescript
// 회원가입 성공 후 처리
if (webauthnSupported) {
  setShowPasskeyPrompt(true);
  setIsSubmitting(false);
} else {
  setShouldRedirect(true);
}
```

## 보안 검증 개선

### SQL Injection 검증 완화
**문제점**: 프로필 이름 검증 시 정규표현식 오류 발생

**해결책**:
- 정규표현식 대신 직접 문자열 비교 사용
- 실제 위험한 SQL 패턴만 필터링

**구현 파일**: `/src/utils/clientAuthValidation/validators/ProfileNameInputValidator.ts`

### 비밀번호 검증 최적화
**문제점**: 너무 많은 경고 메시지로 인한 UX 저하

**해결책**:
- 중복 팁 제거
- 최대 2개의 개선 제안만 표시
- 우선순위에 따른 팁 표시

**구현 파일**: `/src/utils/clientAuthValidation/validators/SecurePasswordInputValidator.ts`

## 기술 스택
- **Frontend**: React, TypeScript
- **WebAuthn API**: 브라우저 네이티브 API
- **Backend Integration**: Spring Boot WebAuthn 엔드포인트
- **Storage**: Redis (challenge 저장), PostgreSQL (credential 저장)

## API 엔드포인트
- `POST /api/webauthn/register/options` - 등록 옵션 생성
- `POST /api/webauthn/register/verify` - 등록 검증
- `POST /api/webauthn/authenticate/options` - 인증 옵션 생성
- `POST /api/webauthn/authenticate/verify` - 인증 검증

## 브라우저 호환성
- Chrome 67+ (Conditional UI는 Chrome 108+)
- Safari 14+
- Firefox 60+
- Edge 18+

## 향후 개선 사항
1. 다중 패스키 관리 UI
2. 패스키 백업 및 복구 기능
3. Cross-device 패스키 동기화
4. 패스키 사용 통계 및 분석

## 트러블슈팅
### rpId/origin 불일치
- 개발: `localhost`
- 프로덕션: `asyncsite.com`
- CORS 및 WebAuthn 설정 동기화 필요

### Conditional UI 미작동
- Chrome 버전 확인 (108+ 필요)
- HTTPS 연결 확인
- PublicKeyCredential.isConditionalMediationAvailable() 지원 확인

## 참고 문서
- [WebAuthn Operations Guide](/user-service/docs/ops/WEBAUTHN_OPERATIONS.md)
- [W3C WebAuthn Specification](https://www.w3.org/TR/webauthn/)
- [FIDO Alliance](https://fidoalliance.org/)
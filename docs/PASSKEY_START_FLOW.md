# Passkey "Start" Unified Flow – Frontend Guide

## 목표 UX
- Primary CTA: "🔐 패스키로 시작하기"
- 이메일 입력 후 버튼 1개로 시작 → 서버가 자동 분기(인증 또는 등록)
- 신규/무패스키 사용자에게만 OTP(이메일 소유 검증) → 등록 → 완료
- "다른 방법"은 접힘(비밀번호/Google)

## 화면 와이어(요약)
```
시작하기
비밀번호 없이 더 안전하게

[이메일 입력]
[🔐 패스키로 시작하기]
(힌트) 환경/상태 안내

──────────────  또는  ──────────────

다른 방법 ▾
  [이메일+비밀번호로 계속하기]
  [Google로 계속하기]

푸터: 비밀번호를 잊으셨나요? / 도메인: asyncsite.com
```

## 상태머신
- idle → starting → (authenticating | awaitingOtp) → (registering | finishing) → success

## API 호출 흐름
- 클릭 → POST /api/webauthn/start
  - data.mode === 'authenticate' → authOptions → navigator.credentials.get() → POST /api/webauthn/finish(mode=authenticate)
  - data.mode === 'verifyEmailRequired' → OTP UI로 전환
- OTP 확인 → POST /api/webauthn/otp/verify
  - 성공 → registerOptions → navigator.credentials.create() → POST /api/webauthn/finish(mode=register)

## 에러/예외 UX
- 미지원 브라우저: Primary 비활성 + 안내
- 도메인/오리진 불일치: 도메인 안내
- 취소: 부드러운 메시지 + 재시도
- OTP 만료/오류/레이트리밋: 인라인 문구

## 접근성/카피
- 환경 감지 시 버튼 라벨 변형(Face ID/지문/이 기기에서 시작하기)
- 도메인 표기(작게)

## 계측 이벤트
- start_click, start_mode(authenticate/verifyEmailRequired)
- otp_sent, otp_verified
- passkey_register_success, passkey_auth_success
- fallback_used(password/google)
- error_codes

## 체크리스트
- [ ] 패스키 버튼 비활성 조건: 브라우저 미지원 또는 이메일 무효
- [ ] OTP 재전송 쿨타임/레이트리밋 안내
- [ ] 전역 401 핸들링: 핵심 엔드포인트만 전역 로그아웃
- [ ] rpId/origin 고정

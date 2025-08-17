# OAuth 에러 처리 개선 필요

## 현재 문제점

### 상황
- user-service가 죽어있을 때 Google OAuth 로그인 시도
- 프론트엔드에서 `window.location.href`로 백엔드 OAuth 엔드포인트로 직접 이동

### 발생하는 문제
```json
{
  "timestamp": "2025-08-17T08:04:23.002084599Z",
  "status": 500,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred. Please try again later.",
  "path": "/api/auth/oauth/google/login",
  "correlationId": "a3dd3e56-d580-43b4-90c0-d094115798b7",
  "requestId": "42cb00bf-bbd8-46a1-9c86-4009b27b5b87"
}
```
- 사용자가 브라우저에서 JSON 에러를 직접 보게 됨
- 보안 정보(correlationId, requestId) 노출
- 사용자가 복구할 방법 없음

### 문제 코드 위치
- `web/src/pages/auth/LoginPage.tsx:464`
- `web/src/pages/auth/SignupPage.tsx:473`

```typescript
// 현재 코드
<button onClick={() => window.location.href = `${env.apiBaseUrl}/api/auth/oauth/google/login`}>
```

## 근본 원인

1. **OAuth 플로우의 특성**
   - 일반 API: JavaScript가 호출 → 에러 처리 가능
   - OAuth: 브라우저가 직접 이동 → JavaScript 제어 불가

2. **서비스 다운 시 응답**
   - user-service가 죽으면 API Gateway/프록시가 JSON 에러 반환
   - 브라우저는 이를 HTML로 기대했지만 JSON을 받음

## 해결 방안

### 옵션 1: 백엔드에서 에러 시 프론트로 리다이렉트 (권장)

**백엔드 수정**
```java
// API Gateway 또는 OAuth 엔드포인트
@ExceptionHandler
public ResponseEntity<?> handleOAuthError(Exception e, HttpServletRequest request) {
    // OAuth 경로인 경우 프론트엔드로 리다이렉트
    if (request.getRequestURI().contains("/oauth/")) {
        return ResponseEntity.status(302)
            .location(URI.create("https://asyncsite.com/login?error=service_unavailable"))
            .build();
    }
    // 일반 API는 JSON 에러 반환
    return ResponseEntity.status(500).body(errorJson);
}
```

**프론트엔드 수정**
```typescript
// LoginPage.tsx
useEffect(() => {
  const error = searchParams.get('error');
  if (error === 'service_unavailable') {
    setErrors({ general: '로그인 서비스를 일시적으로 사용할 수 없습니다.' });
  }
}, [searchParams]);
```

### 옵션 2: API Gateway/Nginx에서 OAuth 경로 특별 처리

**Nginx 설정**
```nginx
location /api/auth/oauth/ {
    proxy_pass http://user-service;
    
    # 서비스 다운 시 프론트엔드로 리다이렉트
    error_page 502 503 504 @oauth_error;
}

location @oauth_error {
    return 302 https://asyncsite.com/login?error=service_unavailable;
}
```

### 옵션 3: 팝업 창 사용 (대안)

**프론트엔드만 수정**
```typescript
const handleGoogleLogin = () => {
  const popup = window.open(
    `${env.apiBaseUrl}/api/auth/oauth/google/login`,
    'google-login',
    'width=500,height=600'
  );
  
  // 팝업 상태 모니터링
  const timer = setInterval(() => {
    if (popup?.closed) {
      clearInterval(timer);
      // 팝업이 닫혔는데 로그인 안됨 → 에러 처리
      if (!isAuthenticated) {
        setErrors({ general: '로그인이 취소되었거나 실패했습니다.' });
      }
    }
  }, 500);
};
```

## 권장 사항

1. **단기 해결**: 옵션 1 (백엔드에서 에러 시 리다이렉트)
   - 가장 간단하고 깔끔한 해결책
   - 사용자 경험 최적

2. **장기 해결**: OAuth 전용 에러 페이지 구현
   - 백엔드에서 OAuth 에러 시 전용 HTML 페이지 반환
   - 재시도 버튼, 홈으로 이동 등 옵션 제공

## 작업 필요 사항

### 백엔드 (user-service 또는 API Gateway)
- [ ] OAuth 엔드포인트 에러 핸들링 수정
- [ ] 브라우저 요청 감지 로직 추가
- [ ] 에러 시 프론트엔드로 리다이렉트

### 프론트엔드
- [ ] LoginPage.tsx: 에러 쿼리 파라미터 처리
- [ ] SignupPage.tsx: 에러 쿼리 파라미터 처리
- [ ] 사용자 친화적인 에러 메시지 표시

## 참고 사항

- Google, Facebook, GitHub 등 주요 서비스들도 OAuth 에러 시 HTML 페이지나 리다이렉트로 처리
- JSON 에러를 브라우저에 직접 노출하는 것은 보안 및 UX 관점에서 지양해야 함
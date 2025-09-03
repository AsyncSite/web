# OAuth Return URL Pattern

## 문제 상황
OAuth 로그인(Google, GitHub 등) 후 사용자가 원래 있던 페이지로 돌아가지 못하고 항상 `/users/me`로 리다이렉트되는 문제

## 해결 방법
백엔드 수정 없이 프론트엔드에서 localStorage를 활용한 리턴 URL 처리

### 구현 패턴

#### 1. 로그인 페이지에서 OAuth 버튼 클릭 시
```typescript
// LoginPage.tsx
const handleOAuthLogin = (provider: string) => {
  // 현재 from 파라미터(원래 가려던 페이지) 저장
  const from = location.state?.from || searchParams.get('from');
  
  if (from && from !== '/users/me') {
    localStorage.setItem('oauth_return_url', from);
  }
  
  // OAuth 로그인 페이지로 이동
  window.location.href = `${API_BASE_URL}/api/auth/oauth/${provider}/login`;
};
```

#### 2. OAuth 콜백 페이지에서 리다이렉트
```typescript
// OAuthCallbackPage.tsx
useEffect(() => {
  const processCallback = async () => {
    try {
      // OAuth 처리
      await handleOAuthCallback();
      
      // 저장된 리턴 URL 확인
      const oauthReturnUrl = localStorage.getItem('oauth_return_url');
      
      if (oauthReturnUrl) {
        // 사용 후 즉시 삭제
        localStorage.removeItem('oauth_return_url');
        navigate(oauthReturnUrl);
      } else {
        navigate('/users/me'); // 기본값
      }
    } catch (error) {
      navigate('/login');
    }
  };
  
  processCallback();
}, []);
```

#### 3. 특정 서비스에서 사용 예시
```typescript
// DocuMentor.tsx
useEffect(() => {
  if (!isAuthenticated) {
    // 로그인 필요 시 현재 페이지 저장
    sessionStorage.setItem('documentor_return_url', '/lab/documentor');
  }
}, [isAuthenticated]);
```

## localStorage vs sessionStorage 선택 기준

### localStorage 사용
- **OAuth 리턴 URL**: 브라우저 탭을 닫았다 열어도 유지되어야 함
- OAuth 과정 중 새 탭이 열릴 수 있음
- 예: `oauth_return_url`

### sessionStorage 사용
- **서비스별 임시 상태**: 현재 세션에서만 유효
- 새 탭에서는 초기화되어야 함
- 예: `documentor_return_url`, `form_draft_data`

## 주의사항

1. **보안**: 민감한 URL 파라미터가 있는 경우 주의
2. **정리**: 사용 후 즉시 `removeItem()` 호출
3. **충돌 방지**: 키 이름에 서비스명 포함 (예: `documento_trial_emails`)
4. **폴백**: 항상 기본 리다이렉트 경로 준비

## 관련 파일
- `/src/pages/auth/LoginPage.tsx`
- `/src/pages/auth/OAuthCallbackPage.tsx`
- `/src/components/lab/ai-studio/documentor/DocuMentor.tsx`
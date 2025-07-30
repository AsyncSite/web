# OAuth Integration Test Checklist

## 사전 확인사항
- [ ] Eureka Server 실행 중 (http://localhost:8761)
- [ ] API Gateway 실행 중 (http://localhost:8080)
- [ ] User Service 실행 중 (http://localhost:8081) - OAuth 환경변수 포함
- [ ] Web App 실행 중 (http://localhost:3000)

## OAuth 플로우 테스트

### 1. 로그인 페이지 확인
- [ ] http://localhost:3000/login 접속
- [ ] "Google로 로그인" 버튼 표시 확인
- [ ] 버튼 스타일링 정상 (Google 로고 포함)

### 2. OAuth 시작
- [ ] "Google로 로그인" 버튼 클릭
- [ ] Google OAuth 페이지로 리다이렉트 확인
- [ ] URL에 client_id 포함 확인: `459007323144-j8d8tkf9np12fg2rgolh4a9qld1hq9ui`

### 3. Google 인증
- [ ] Google 계정 선택/로그인
- [ ] AsyncSite 권한 승인 페이지 표시
- [ ] "계속" 버튼 클릭

### 4. Callback 처리
- [ ] http://localhost:3000/auth/callback로 리다이렉트
- [ ] URL에 token과 refreshToken 파라미터 확인
- [ ] "로그인 중..." 메시지 표시

### 5. 인증 완료
- [ ] 자동으로 /users/me (프로필 페이지)로 이동
- [ ] 사용자 정보 표시 확인
- [ ] localStorage에 authToken, refreshToken 저장 확인

## 에러 시나리오 테스트

### OAuth 취소
- [ ] Google 인증 페이지에서 취소
- [ ] /auth/callback?error=... 로 리다이렉트
- [ ] 에러 메시지 표시
- [ ] "로그인 페이지로 돌아가기" 버튼 작동

### 토큰 검증 실패
- [ ] 잘못된 토큰으로 /auth/callback 접근
- [ ] 에러 처리 및 메시지 표시

## 디버깅 명령어

### 로그 확인
```bash
# User Service 로그
docker logs -f asyncsite-user-service

# OAuth 관련 로그만 필터링
docker logs asyncsite-user-service 2>&1 | grep -i oauth
```

### OAuth URL 테스트
```bash
# OAuth 시작 URL 확인
curl -I http://localhost:8080/api/auth/oauth/google/login
```

### localStorage 확인 (브라우저 콘솔)
```javascript
localStorage.getItem('authToken')
localStorage.getItem('refreshToken')
localStorage.getItem('user')
```
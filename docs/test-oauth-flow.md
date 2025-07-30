# OAuth Flow Test Guide

## 1. 서비스 상태 확인
- Gateway: http://localhost:8080/actuator/health
- User Service: http://localhost:8081/actuator/health  
- Web App: http://localhost:3000

## 2. OAuth 플로우 테스트

### 방법 1: Web UI 사용
1. http://localhost:3000/login 접속
2. "Google로 로그인" 버튼 클릭
3. Google 계정으로 로그인
4. 권한 승인
5. 자동으로 프로필 페이지로 리다이렉트

### 방법 2: 직접 URL 접속
1. http://localhost:8080/api/auth/oauth/google/login
2. Google 로그인 진행
3. http://localhost:3000/auth/callback로 리다이렉트됨
4. 토큰이 자동으로 저장되고 프로필로 이동

## 3. 예상 플로우
```
사용자 → [Google로 로그인] 클릭
      ↓
Web App → http://localhost:8080/api/auth/oauth/google/login
      ↓
Gateway → User Service로 전달
      ↓
User Service → Google OAuth 페이지로 리다이렉트
      ↓
Google → 인증 후 http://localhost:8081/api/auth/oauth/google/callback
      ↓
User Service → JWT 생성 후 http://localhost:3000/auth/callback?token=xxx&refreshToken=xxx
      ↓
Web App → 토큰 저장 및 /users/me로 이동
```

## 4. 확인사항
- [ ] Google OAuth 페이지로 정상 리다이렉트
- [ ] Google 로그인 성공
- [ ] Callback URL로 정상 리턴
- [ ] JWT 토큰이 URL 파라미터로 전달
- [ ] Web App에서 토큰 저장
- [ ] 프로필 페이지 접근 가능
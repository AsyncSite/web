# 비밀번호 재설정 기능 구현 완료

## 구현 완료 사항

### 1. user-service (백엔드)
✅ **도메인 모델**
- `PasswordResetToken`: 비밀번호 재설정 토큰 도메인 엔티티
- `Password`: 비밀번호 검증 값 객체

✅ **API 엔드포인트**
- `POST /api/auth/password-reset/reset-request`: 비밀번호 재설정 요청
- `GET /api/auth/password-reset/verify-token`: 토큰 유효성 검증
- `POST /api/auth/password-reset/reset`: 새 비밀번호 설정

✅ **보안 기능**
- Rate limiting: 시간당 3회 요청 제한
- 토큰 유효기간: 24시간
- 토큰 일회성 사용
- 암호화된 토큰 생성 (Base64 URL-safe)

### 2. web (프론트엔드)
✅ **페이지 구현**
- `/forgot-password`: 비밀번호 재설정 요청 페이지
- `/reset-password`: 새 비밀번호 설정 페이지

✅ **기능**
- 이메일 유효성 검증
- 비밀번호 강도 검증 (8자 이상, 대소문자, 숫자 포함)
- 토큰 자동 검증
- 남은 시간 표시
- 성공/실패 상태 처리

### 3. 라우팅 연결
✅ 로그인 페이지에 "비밀번호를 잊으셨나요?" 링크 추가
✅ React Router에 새 라우트 추가

## noti-service 필요 작업

noti-service 담당자께서는 다음 작업을 진행해주세요:

### 1. EventType 추가
```java
public enum EventType {
    STUDY,
    NOTI,
    LOG,
    ACTION,
    PASSWORD_RESET  // 추가 필요
}
```

### 2. 이메일 템플릿 생성
`resources/templates/email/password-reset.html` 파일 생성:
```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>비밀번호 재설정</title>
</head>
<body>
    <h2>비밀번호 재설정 요청</h2>
    <p th:text="${userName}">사용자</p>님, 안녕하세요.
    <p>비밀번호 재설정을 요청하셨습니다.</p>
    <p>아래 링크를 클릭하여 새 비밀번호를 설정해주세요:</p>
    <a th:href="${resetLink}" th:text="${resetLink}">재설정 링크</a>
    <p>이 링크는 24시간 동안 유효합니다.</p>
    <p>만약 비밀번호 재설정을 요청하지 않으셨다면, 이 메일을 무시해주세요.</p>
</body>
</html>
```

### 3. EmailNotificationSender 수정
`PASSWORD_RESET` 이벤트 타입 처리 추가:
```java
case PASSWORD_RESET:
    subject = "AsyncSite 비밀번호 재설정";
    templateName = "email/password-reset";
    break;
```

### 4. 테스트
user-service에서 보내는 요청 형식:
```json
POST /noti-service/send
{
    "userId": "user@example.com",
    "notificationMethod": "EMAIL",
    "eventType": "PASSWORD_RESET",
    "payload": {
        "userName": "홍길동",
        "resetLink": "https://asyncsite.com/reset-password?token=abc123"
    }
}
```

## 테스트 시나리오

### 1. 비밀번호 재설정 요청
1. 로그인 페이지에서 "비밀번호를 잊으셨나요?" 클릭
2. 이메일 입력 후 "재설정 링크 전송" 클릭
3. 성공 메시지 확인

### 2. 비밀번호 재설정
1. 이메일로 받은 링크 클릭
2. 새 비밀번호 입력 (8자 이상, 대소문자, 숫자 포함)
3. 비밀번호 확인 입력
4. "비밀번호 변경" 클릭
5. 성공 후 로그인 페이지로 이동

### 3. 오류 케이스
- 만료된 토큰 사용 시도
- 이미 사용된 토큰 재사용 시도
- 잘못된 토큰으로 접근
- Rate limit 초과

## 주의사항

1. **보안**: 이메일이 존재하지 않아도 성공 응답을 반환 (정보 유출 방지)
2. **토큰 관리**: 새 토큰 생성 시 기존 토큰 모두 무효화
3. **Rate Limiting**: Redis 기반 rate limiting 구현
4. **이메일 전송 실패**: 실패해도 사용자에게는 성공으로 표시

## 배포 전 체크리스트

- [ ] noti-service EventType 추가 및 배포
- [ ] noti-service 이메일 템플릿 추가
- [ ] user-service 배포
- [ ] web 프론트엔드 배포
- [ ] Redis 연결 확인
- [ ] 이메일 발송 테스트
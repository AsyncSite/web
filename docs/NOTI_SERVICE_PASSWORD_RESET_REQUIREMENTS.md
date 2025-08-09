# Noti-Service 비밀번호 재설정 기능 요구사항

## 📋 개요
User-Service에서 비밀번호 재설정 기능을 구현하기 위해 Noti-Service에서 필요한 작업을 정리합니다.

## 🔧 필요한 작업 목록

### 1. EventType Enum 수정
**파일**: `/noti-service/src/main/java/com/asyncsite/notiservice/domain/model/vo/EventType.java`

```java
public enum EventType {
    STUDY,
    NOTI,
    LOG,
    ACTION,
    PASSWORD_RESET  // 추가 필요
}
```

### 2. 비밀번호 재설정 이메일 템플릿 생성
**파일**: `/noti-service/src/main/resources/templates/password-reset.html` (새 파일)

```html
<!DOCTYPE html>
<html lang="ko" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AsyncSite - 비밀번호 재설정</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4;">
        <tr>
            <td align="center">
                <table width="600" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">AsyncSite</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">비밀번호 재설정</h2>
                            
                            <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                안녕하세요, <strong th:text="${userName}">사용자</strong>님
                            </p>
                            
                            <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                비밀번호 재설정을 요청하셨습니다. 아래 버튼을 클릭하여 새 비밀번호를 설정해주세요.
                            </p>
                            
                            <!-- CTA Button -->
                            <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                                <tr>
                                    <td align="center" style="border-radius: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                                        <a th:href="${resetLink}" style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 8px;">
                                            비밀번호 재설정하기
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 30px 0 20px 0; color: #999999; font-size: 14px; line-height: 1.6;">
                                또는 아래 링크를 복사하여 브라우저에 붙여넣으세요:
                            </p>
                            
                            <div style="padding: 12px; background-color: #f8f9fa; border-radius: 6px; word-break: break-all;">
                                <code style="color: #666666; font-size: 12px;" th:text="${resetLink}">https://asyncsite.com/reset-password?token=...</code>
                            </div>
                            
                            <!-- Warning Box -->
                            <div style="margin: 30px 0; padding: 16px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                                <p style="margin: 0 0 8px 0; color: #856404; font-size: 14px;">
                                    <strong>⚠️ 주의사항</strong>
                                </p>
                                <ul style="margin: 0; padding-left: 20px; color: #856404; font-size: 14px; line-height: 1.6;">
                                    <li>이 링크는 <strong>24시간</strong> 동안만 유효합니다.</li>
                                    <li>비밀번호 재설정을 요청하지 않으셨다면 이 이메일을 무시하세요.</li>
                                    <li>계정 보안을 위해 링크를 다른 사람과 공유하지 마세요.</li>
                                </ul>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px; background-color: #f8f9fa; border-radius: 0 0 12px 12px; text-align: center;">
                            <p style="margin: 0 0 10px 0; color: #999999; font-size: 12px;">
                                이 이메일은 자동으로 발송되었습니다. 회신하지 마세요.
                            </p>
                            <p style="margin: 0; color: #999999; font-size: 12px;">
                                © 2024 AsyncSite. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```

### 3. EmailNotificationSender 수정
**파일**: `/noti-service/src/main/java/com/asyncsite/notiservice/adapter/out/notification/EmailNotificationSender.java`

수정 필요 사항:
- PASSWORD_RESET 이벤트 타입 처리 추가
- password-reset.html 템플릿 사용하도록 분기 처리

```java
// renderContent 메서드 내부에 추가
if (notification.getEventType() == EventType.PASSWORD_RESET) {
    // password-reset 템플릿 사용
    Context context = new Context();
    context.setVariable("userName", metadata.get("userName"));
    context.setVariable("resetLink", metadata.get("resetLink"));
    
    String html = templateEngine.process("password-reset", context);
    // ... 이메일 발송 로직
}
```

### 4. 데이터베이스 템플릿 추가 (선택사항)
NotificationTemplate 테이블에 PASSWORD_RESET 템플릿 추가:

```sql
INSERT INTO notification_templates (
    template_id,
    channel_type,
    event_type,
    title_template,
    content_template,
    active,
    version,
    created_at
) VALUES (
    UUID(),
    'EMAIL',
    'PASSWORD_RESET',
    '[AsyncSite] 비밀번호 재설정 요청',
    '비밀번호 재설정 링크: {resetLink}',
    true,
    1,
    NOW()
);
```

## 📌 User-Service에서 호출할 API

### 비밀번호 재설정 이메일 발송 요청
```http
POST http://localhost:8089/api/noti
Content-Type: application/json

{
    "userId": "user-id-here",
    "channelType": "EMAIL",
    "eventType": "PASSWORD_RESET",
    "recipientContact": "user@example.com",
    "metadata": {
        "userName": "홍길동",
        "resetLink": "https://asyncsite.com/reset-password?token=abc123def456..."
    }
}
```

## 🔍 테스트 시나리오

1. **정상 케이스**
   - 유효한 이메일 주소로 비밀번호 재설정 요청
   - 이메일 수신 확인
   - 링크 클릭 가능 여부 확인

2. **예외 케이스**
   - 잘못된 이메일 형식
   - 메타데이터 누락 (userName, resetLink)
   - 이메일 서버 연결 실패

## 📝 환경 변수 확인

현재 설정되어 있어야 하는 환경 변수:
```bash
MAIL_USERNAME=asyncsite@gmail.com  # Gmail 계정
MAIL_PASSWORD=app-specific-password  # Gmail 앱 비밀번호
```

## ⚡ 작업 우선순위

1. **필수 (Critical)**
   - EventType enum에 PASSWORD_RESET 추가
   - password-reset.html 템플릿 생성

2. **중요 (Important)**
   - EmailNotificationSender에서 PASSWORD_RESET 처리 로직 추가

3. **선택 (Optional)**
   - 데이터베이스에 템플릿 레코드 추가
   - 템플릿 변수 검증 로직 추가

## 🤝 협업 포인트

- User-Service는 `/api/noti` POST 엔드포인트를 호출하여 이메일 발송 요청
- 이메일 발송 성공/실패는 HTTP 상태 코드로 판단
- 비동기 처리이므로 즉시 응답 반환

## 📅 예상 작업 시간
- EventType 수정: 5분
- 템플릿 생성: 30분
- EmailNotificationSender 수정: 30분
- 테스트: 30분
- **총 예상 시간: 1.5시간**

---

이 문서를 noti-service 담당자에게 전달해주세요.
문의사항이 있으면 언제든 연락주세요.
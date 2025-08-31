# Documento 인증 전략

## 개요
프로토타입 단계에서 사용자 진입 장벽을 낮추면서도 서비스 품질을 유지하기 위한 인증 전략

## 구현 상태 (2025-08-31 업데이트)

### ✅ 프론트엔드 구현 완료
- **DocuMentorForm**: 이메일 필드 추가 및 조건부 렌더링
- **인증 상태별 UI 분기**: 비로그인/Trial 사용/로그인 상태별 다른 UI
- **LocalStorage 기반 Trial 추적**: `documento_trial_emails` 키로 이메일 저장
- **서비스 레이어**: `documentorService.submitTrialUrl()` 메소드 추가

### 📝 백엔드 요청 중
- **문서 위치**: `documento-content-service/docs/trial-endpoint-requirements.md`
- **요청 내용**: Trial 엔드포인트 및 Redis 기반 추적 구현
- **Gateway 설정**: `/api/documento/contents/trial/**` 인증 bypass 필요

## 제안: 하이브리드 접근법

### 3단계 점진적 접근

#### 1단계: 초기 체험 (이메일만)
- 1회 무료 체험
- 이메일 수집 → 결과 이메일 발송
- 세션 기반 추적

#### 2단계: 추가 사용 유도
- "더 사용하려면 로그인" CTA
- 소셜 로그인 옵션 제공
- 간단한 회원가입 프로세스

#### 3단계: 프리미엄 기능
- 로그인 사용자 전용
- 히스토리 저장
- 템플릿 관리
- 상세 분석 리포트

## 기술 구현 방안

### 클라이언트 기반 추적
```javascript
// localStorage/sessionStorage 활용
const hasUsedTrial = sessionStorage.getItem('documentor_trial_used');
if (hasUsedTrial) {
  // "로그인해서 더 사용하기" 표시
}

// 이메일 해시 기반 추적
const emailHash = btoa(email);
localStorage.setItem(`trial_${emailHash}`, Date.now());
```

### 서버 엔드포인트 구조

#### 옵션 1: 단일 엔드포인트 + 조건 분기
```java
@PostMapping("/api/documento/submit")
public ResponseEntity<?> submitDocument(@RequestBody SubmitRequest request) {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    
    if (auth == null || !auth.isAuthenticated()) {
        // 비로그인 유저 처리
        if (request.getEmail() == null) {
            return ResponseEntity.badRequest().body("이메일 필요");
        }
        // Redis에서 이메일 사용 여부 체크
        if (redisTemplate.hasKey("trial:" + request.getEmail())) {
            return ResponseEntity.status(403).body("무료 체험 이미 사용");
        }
        redisTemplate.opsForValue().set("trial:" + request.getEmail(), "used", 24, TimeUnit.HOURS);
    } else {
        // 로그인 유저 - 일일 제한 체크
        String userId = auth.getName();
        Integer count = redisTemplate.opsForValue().get("daily:" + userId);
        if (count >= 5) {
            return ResponseEntity.status(429).body("일일 한도 초과");
        }
        redisTemplate.opsForValue().increment("daily:" + userId);
    }
    
    return processDocument(request);
}
```

#### 옵션 2: 별도 엔드포인트 (권장)
```java
// 무료 체험용
@PostMapping("/api/documento/trial")
public ResponseEntity<?> trialSubmit(@RequestBody TrialRequest request) {
    // 이메일 필수
    // Redis 체크
    // 1회 제한
}

// 로그인 유저용
@PostMapping("/api/documento/submit")
@PreAuthorize("isAuthenticated()")
public ResponseEntity<?> submitDocument(@RequestBody SubmitRequest request) {
    // 인증 필수
    // 일일 5회 제한
}
```

## Redis 키 구조
```
trial:user@email.com -> "used" (TTL: 24시간)
daily:userId:2024-01-31 -> 3 (TTL: 당일 끝)
```

## 실제 프론트엔드 구현 (2025-08-31)

### DocuMentorForm.tsx - UI 조건부 렌더링
```typescript
// 타이틀 조건부 렌더링
<h2 className={styles.formTitle}>
  {!isAuthenticated && !hasUsedTrial ? (
    <>✨ 1회 무료 AI 리뷰 체험!</>
  ) : hasUsedTrial ? (
    <>🎯 회원가입하고 매일 5회 사용하세요!</>
  ) : (
    <>🔗 리뷰 받고 싶은 글 링크를 알려주세요</>
  )}
</h2>

// 이메일 필드 (비로그인 & Trial 미사용)
{!isAuthenticated && !hasUsedTrial && (
  <div className={styles.inputGroup}>
    <label className={styles.inputLabel}>📧 결과를 받아보실 이메일</label>
    <input type="email" ... />
  </div>
)}

// Trial 사용 완료 시 CTA
{hasUsedTrial ? (
  <div className={styles.trialUsedContainer}>
    <button className={styles.signupButton}>🚀 회원가입하기</button>
    <button className={styles.loginButton}>로그인</button>
  </div>
) : (
  <button className={styles.submitButton}>
    {!isAuthenticated ? <>✨ 무료 체험하기</> : <>🚀 AI 리뷰 받기</>}
  </button>
)}
```

### DocuMentor.tsx - Trial 추적 로직
```typescript
// Trial 사용 체크
const [hasUsedTrial, setHasUsedTrial] = useState(false);

useEffect(() => {
  const trialEmails = localStorage.getItem('documento_trial_emails');
  if (trialEmails) {
    setHasUsedTrial(true);
  }
}, []);

// 제출 핸들러
const handleSubmit = async (url: string, email?: string, ...) => {
  if (!isAuthenticated) {
    // Trial 이메일 중복 체크
    const trialEmails = JSON.parse(localStorage.getItem('documento_trial_emails') || '[]');
    if (trialEmails.includes(email)) {
      setHasUsedTrial(true);
      setError('이미 무료 체험을 사용하셨습니다.');
      return;
    }
    
    // Trial 이메일 저장
    trialEmails.push(email);
    localStorage.setItem('documento_trial_emails', JSON.stringify(trialEmails));
  }
  // ...
};
```

### documentorService.ts - API 분기
```typescript
class DocumentorService {
  // Trial 제출 (비인증)
  async submitTrialUrl(email: string, url: string): Promise<DocuMentorContent> {
    const response = await axios.post(
      `${DOCUMENTOR_API_URL}/contents/trial`,
      { email, url }
      // No auth headers for trial
    );
    return response.data;
  }
  
  // 정식 제출 (인증 필수)
  async submitUrl(request: DocuMentorSubmitRequest): Promise<DocuMentorContent> {
    const response = await axios.post(
      `${DOCUMENTOR_API_URL}/contents`,
      request,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }
}
```

## 장점
- 프로토타입 피드백 수집 용이
- 점진적 사용자 전환
- 이메일 리스트 구축
- 스팸 방지 (세션당 1회)

## 고려사항
- 쿠키 삭제, 시크릿 모드로 우회 가능 (프로토타입 단계에서는 허용)
- IP 기반 제한 추가 고려
- 향후 정식 서비스 전환 시 마이그레이션 계획 필요
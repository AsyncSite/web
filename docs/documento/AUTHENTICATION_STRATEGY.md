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

---

## 로그인 플로우 개선 계획 (2025-09-01)

### 🎯 현재 문제점

1. **리다이렉션 단절**
   - DocuMentorForm에서 `window.location.href = '/login'` 사용
   - state 전달 불가로 로그인 후 원래 페이지로 복귀 안됨
   - 사용자가 수동으로 `/studio/documentor` 재접속 필요

2. **테마 불일치**
   - Documento: 보라색 테마, 친근한 느낌
   - AsyncSite 로그인: 검정색 우주 테마
   - 갑작스러운 브랜드 전환으로 사용자 혼란

3. **SessionStorage 미활용**
   - `documentor_return_url` 저장하지만 사용 안됨
   - LoginPage는 `location.state`만 확인

### ✅ 해결 방안: 기존 페이지 재사용 + State 전달

#### 구현 계획

##### 1단계: DocuMentorForm.tsx 수정
```typescript
// 변경 전 (문제)
onClick={() => window.location.href = '/login'}
onClick={() => window.location.href = '/register'}

// 변경 후 (해결)
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();

// 로그인 버튼
onClick={() => {
  navigate('/login', { 
    state: { 
      from: '/studio/documentor',
      service: 'documento',
      branding: {
        title: '도큐멘토 ✏️',
        subtitle: '계속하려면 로그인이 필요해요'
      }
    }
  });
}}

// 회원가입 버튼
onClick={() => {
  navigate('/signup', {
    state: {
      from: '/studio/documentor',
      service: 'documento',
      branding: {
        title: '도큐멘토 ✏️',
        subtitle: 'AI 글쓰기 친구와 함께하세요'
      }
    }
  });
}}
```

##### 2단계: LoginPage.tsx 수정
```typescript
// 서비스 감지
const service = location.state?.service;

// 클래스 적용 (최소한의 테마)
<div className={`login-page ${service ? `login-page--${service}` : ''}`}>
  {/* 서비스 브랜딩 표시 */}
  {service && location.state?.branding && (
    <div className="service-branding">
      <h2>{location.state.branding.title}</h2>
      <p>{location.state.branding.subtitle}</p>
    </div>
  )}
  
  {/* 기존 로그인 폼 */}
</div>

// 로그인 성공 후 리다이렉트
const from = location.state?.from?.pathname || location.state?.from || '/users/me';
navigate(from, { replace: true });
```

##### 3단계: CSS 최소 커스터마이징
```css
/* LoginPage.css에 추가 */
.login-page--documento .login-brand {
  color: #6366f1;
}

.login-page--documento h1::after {
  content: ' - 도큐멘토';
  font-size: 0.7em;
  color: #6366f1;
  opacity: 0.8;
}

.service-branding {
  text-align: center;
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(99, 102, 241, 0.05);
  border-radius: 8px;
}

.service-branding h2 {
  margin: 0;
  font-size: 1.5em;
  color: #6366f1;
}

.service-branding p {
  margin: 5px 0 0 0;
  color: #64748b;
  font-size: 0.9em;
}
```

### 📊 영향 범위 분석

#### 수정 필요 파일
1. **DocuMentorForm.tsx** - 버튼 2개 수정 (5분)
2. **LoginPage.tsx** - 3-5줄 추가 (10분)
3. **SignupPage.tsx** - 동일 패턴 적용 (10분)
4. **LoginPage.css** - 선택적 테마 추가 (5분)

#### 영향 없는 부분
- 다른 컴포넌트의 로그인 플로우 (이미 올바르게 구현됨)
- 백엔드 API
- 인증 로직
- 기존 AsyncSite 사용자

### 🚀 구현 순서

1. **문서 작성** ✅ (현재 파일)
2. **DocuMentorForm.tsx 수정** - navigate 사용
3. **LoginPage.tsx 수정** - service 파라미터 처리
4. **테스트**
   - Documento에서 로그인 → `/studio/documentor` 복귀 확인
   - 일반 로그인 → `/users/me` 이동 확인
   - 게임에서 로그인 → 게임으로 복귀 확인
5. **SignupPage.tsx 동일 적용** (선택)

### 🎨 향후 개선 (Phase 2)

1. **동적 테마 시스템**
   - 서비스별 완전한 테마 변경
   - StarBackground 조건부 렌더링
   - 색상 변수 동적 적용

2. **임베디드 모달** (장기)
   - 간단한 로그인 모달 구현
   - 복잡한 인증은 페이지로 이동

3. **프로그레시브 인증**
   - 이메일 → 임시토큰 → 정식계정 전환

### ✨ 예상 결과

- **즉시 해결**: 로그인 후 자동으로 Documento 복귀
- **최소 작업**: 30분 내 구현 완료
- **낮은 위험**: 기존 시스템 영향 없음
- **점진적 개선 가능**: 나중에 테마 강화 가능
# Documento 인증 전략

## 개요
프로토타입 단계에서 사용자 진입 장벽을 낮추면서도 서비스 품질을 유지하기 위한 인증 전략

## 현재 구현 상태

### 로그인 필수 방식
- **장점**
  - 사용자 컨텍스트 완전 파악
  - 일일 제한 (5회) 정확한 추적
  - 사용자별 히스토리 관리 가능
  
- **단점**
  - 진입 장벽 높음
  - 빠른 피드백 수집 어려움
  - 초기 사용자 이탈 가능성

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

## 프론트엔드 구현
```typescript
const submitDocument = async (data) => {
    const isLoggedIn = !!user;
    
    if (!isLoggedIn) {
        // 무료 체험 API
        return await fetch('/api/documento/trial', {
            body: JSON.stringify({
                ...data,
                email: userEmail
            })
        });
    } else {
        // 정식 API
        return await fetch('/api/documento/submit', {
            headers: { 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data)
        });
    }
};
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
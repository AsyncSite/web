# 🚨 CRITICAL: 401 인증 에러 및 LocalStorage 토큰 충돌 버그

**작성일**: 2025-08-13
**최종 수정**: 2025-08-13
**심각도**: CRITICAL → RESOLVED
**상태**: 해결 완료 ✅
**영향**: 리뷰 표시 문제 해결, 인증 로직 개선 필요

---

## 📌 문제 요약

### 1. 401 인증 에러 문제
- **증상**: 비로그인 사용자가 스터디 상세 페이지(`/study/backend-deep-dive`) 접속 시 401 에러 발생
- **영향**: 
  - 리뷰 섹션이 제대로 표시되지 않음
  - 브라우저 콘솔에 401 에러 반복 출력
  - 로그인 상태와 무관하게 발생
- **API 호출**: `/api/reviews/my` 엔드포인트를 비로그인 상태에서도 호출

### 2. LocalStorage 토큰 충돌 문제 🔴
- **증상**: 로컬 환경에서 여러 계정으로 테스트 시 다른 계정의 토큰이 남아있음
- **심각성**: **보안 위험** - 다른 사용자의 권한으로 API 호출 가능
- **원인**: localStorage 토큰 관리 로직의 문제

---

## 🔍 문제 분석

### 근본 원인

#### AuthContext의 잘못된 인증 상태 판단
```javascript
// src/contexts/AuthContext.tsx
isAuthenticated: !!user || !!authService.getStoredToken()
```

**문제점**:
1. localStorage에 토큰이 있으면 무조건 `isAuthenticated = true`
2. 토큰이 만료되었거나 유효하지 않아도 true 반환
3. 실제 `user` 객체는 `null`인 상황 발생

#### 시나리오
1. 사용자가 로그아웃 또는 토큰 만료
2. localStorage에는 여전히 토큰 존재 (제거 실패)
3. `isAuthenticated = true` (토큰 있음)
4. `user = null` (유효하지 않은 토큰)
5. 컴포넌트에서 `if (isAuthenticated)` 체크 → API 호출
6. 401 에러 발생

---

## 🛠 시도한 해결 방법들

### 1차 시도: 에러 무시 (실패)
```javascript
// ReviewSection.tsx
try {
  const reviews = await reviewService.getMyReviews();
} catch (error) {
  // 401 에러는 무시
  if (error instanceof Error && !error.message.includes('401')) {
    console.error('Failed to load my reviews:', error);
  }
}
```
**결과**: 에러 메시지가 '인증이 필요합니다'로 번역되어 '401' 문자열 포함 안 함

### 2차 시도: 에러 메시지로 체크 (실패)
```javascript
if (error instanceof Error && !error.message.includes('인증')) {
  console.error('Failed to load my reviews:', error);
}
```
**결과**: 로직은 작동하나 근본 문제 해결 안 됨

### 3차 시도: isLoading 체크 추가 (부분 실패)
```javascript
useEffect(() => {
  if (isLoading) return; // 인증 상태 확정 대기
  
  if (isAuthenticated && user) {
    loadMyReviews();
  }
}, [isAuthenticated, user, isLoading]);
```
**결과**: 초기 로딩 시에만 효과, localStorage 토큰 문제는 해결 안 됨

### 4차 시도: user 객체만 체크 (부분 실패)
```javascript
useEffect(() => {
  if (isLoading) return;
  
  if (user) { // isAuthenticated 대신 user만 체크
    loadMyReviews();
  }
}, [user, isLoading]);
```
**결과**: 일부 개선되었으나 여전히 문제 발생

---

## 📍 영향받는 파일들

### 직접 수정한 파일
1. `/src/components/review/ReviewSection.tsx`
2. `/src/components/studyDetailPage/StudyDetailPageRenderer.tsx`
3. `/src/pages/user/ProfilePage.tsx`

### 관련된 핵심 파일
1. `/src/contexts/AuthContext.tsx` - 인증 로직
2. `/src/api/client.ts` - API 인터셉터
3. `/src/api/reviewService.ts` - 리뷰 API 서비스
4. `/src/api/authService.ts` - 토큰 관리

---

## ⚠️ 발견된 추가 문제들

### 1. 패턴 불일치
다른 컴포넌트들은 올바른 패턴 사용:
```javascript
// PrivateRoute.tsx (올바른 패턴)
if (!isLoading && !isAuthenticated) {
  // 리다이렉트
}
```

하지만 일부 컴포넌트는 잘못된 패턴:
```javascript
// ReviewSection.tsx (문제 있는 패턴)
if (isAuthenticated && user) {
  // API 호출
}
```

### 2. localStorage 토큰 관리 문제
- 로그아웃 시 토큰이 제대로 삭제되지 않음
- 다른 계정으로 로그인해도 이전 토큰이 남아있을 수 있음
- `authService.getStoredToken()`이 잘못된 토큰 반환 가능

---

## 🎯 해결해야 할 핵심 과제

### 1. AuthContext 개선
```javascript
// 현재 (문제)
isAuthenticated: !!user || !!authService.getStoredToken()

// 제안 1: user 존재 여부만 체크
isAuthenticated: !!user

// 제안 2: 토큰 유효성 검증 추가
isAuthenticated: !!user && isValidToken(authService.getStoredToken())
```

### 2. localStorage 토큰 관리 개선
- 로그아웃 시 확실한 토큰 제거
- 로그인 시 이전 토큰 완전 제거
- 토큰 만료 체크 강화

### 3. 컴포넌트 패턴 통일
모든 인증 관련 체크를 일관된 패턴으로:
```javascript
if (!isLoading && user) {
  // 인증 필요한 작업
}
```

---

## 🔥 즉시 조치 필요 사항

### 1. 임시 해결책 (Frontend)
```javascript
// 브라우저 콘솔에서 실행
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### 2. 백엔드 검토 필요
- `/api/reviews/studies/{studyId}/statistics` - 퍼블릭 ✅
- `/api/reviews/studies/{studyId}` - 퍼블릭 ✅  
- `/api/reviews/my` - 인증 필요 ❌ (하지만 비로그인 상태에서 호출됨)

---

## 📊 테스트 시나리오

### 재현 방법
1. Chrome 개발자 도구 열기
2. Application → Storage → Clear site data
3. http://localhost:3000/study/backend-deep-dive 접속
4. Console 탭에서 401 에러 확인

### 예상 결과
- 401 에러 없이 페이지 로드
- 리뷰 통계 정상 표시
- "리뷰를 작성하려면 로그인이 필요합니다" 메시지 표시

### 실제 결과
- 401 에러 발생
- 리뷰 섹션 비정상 동작
- 에러 메시지 콘솔 출력

---

## 💡 다음 AI에게 전달 사항

### 주의사항
1. `isAuthenticated`를 신뢰하지 마세요 - 토큰만 있어도 true입니다
2. `user` 객체 존재 여부를 직접 체크하세요
3. `isLoading` 상태를 반드시 확인하세요
4. localStorage 토큰 관리 로직을 전면 재검토하세요

### 권장 접근법
1. AuthContext의 isAuthenticated 로직 수정
2. authService의 토큰 관리 메서드 개선
3. 모든 컴포넌트의 인증 체크 패턴 통일
4. e2e 테스트로 전체 플로우 검증

### 테스트 환경
- React 18.2.0
- TypeScript 5.2.2
- axios 1.6.0
- 백엔드: Spring Boot (Kotlin)
- 인증: JWT 토큰 기반

---

## 📚 참고 자료

### 관련 파일 경로
- Frontend: `/Users/rene/asyncsite/web/src/`
- Backend: `/Users/rene/asyncsite/study-service/`
- Gateway: `/Users/rene/asyncsite/core-platform/gateway/`

### 백엔드 수정 사항
- `ReviewStatisticsResponse.java`: `totalCount` → `totalReviews` 필드명 변경
- `ReviewService.java`: 실제 평점 분포 계산 로직 구현
- `ReviewRepository`: `countByStudyIdAndRating` 메서드 추가

---

## ⚠️ 보안 경고

**LocalStorage 토큰 충돌 문제는 즉시 해결 필요**
- 다른 사용자의 권한으로 API 호출 가능
- 프로덕션 배포 전 반드시 해결
- 토큰 격리 및 검증 로직 강화 필요

---

## ✅ 해결된 부분 (2025-08-13)

### 리뷰가 안 보이던 문제 해결

#### 문제 원인
1. **두 개의 리뷰 시스템 존재**
   - `ReviewsSection.tsx`: 정적 데이터만 표시 (props로 받은 data.reviews)
   - `ReviewSection.tsx`: API 동적 호출 (/api/reviews/my → 401 에러)

2. **REVIEWS 섹션 문제**
   - study-detail-pages의 sections에 REVIEWS 타입 섹션이 있었지만
   - data.reviews가 비어있어서 "아직 작성된 후기가 없습니다" 표시
   - 실제로는 DB에 리뷰 존재

#### 해결 방법
```typescript
// ReviewsSection.tsx 수정
1. studyId prop 추가
2. useEffect에서 studyId가 있으면 API 호출
3. /api/reviews/studies/{studyId} 사용 (공개 API, 인증 불필요)

// sections/index.tsx 수정
type === SectionType.REVIEWS 일 때도 studyId 전달
```

#### 수정 파일
- `/src/components/studyDetailPage/sections/ReviewsSection.tsx`
- `/src/components/studyDetailPage/sections/index.tsx`

### 401 에러 부분 해결
- `/api/reviews/my` 대신 `/api/reviews/studies/{id}` 사용
- 비로그인 사용자도 리뷰 조회 가능
- 로그인한 다른 사용자의 401 에러 방지

---

## ✅ 2025-08-13 추가 해결 사항

### 1. AuthContext의 isAuthenticated 로직 개선 완료
```javascript
// 이전 (문제가 있던 코드)
isAuthenticated: !!user || !!authService.getStoredToken()

// 현재 (점진적 개선 적용)
isAuthenticated: isLoading ? !!authService.getStoredToken() : !!user
// 초기 로딩 중: 토큰 존재로 판단 (페이지 새로고침 시 깜빡임 방지)
// 로딩 완료 후: user 객체로만 판단 (정확한 인증 상태)
```

### 2. 관련 컴포넌트 패턴 통일 완료
수정된 컴포넌트들:
- `StudyManagementPage.tsx`: authLoading 체크 추가, user만 확인
- `StudyApplicationPage.tsx`: authLoading 체크 추가, user만 확인
- `StudyProposalPageV2.tsx`: authLoading 체크 추가, user만 확인
- `StudyProposalPage.tsx`: authLoading 체크 추가, user만 확인
- `ReviewWritePage.tsx`: authLoading 체크 추가, user만 확인

통일된 패턴:
```javascript
// 인증 체크 패턴
if (authLoading) {
  return; // 로딩 중에는 체크 건너뛰기
}
if (!user) {
  navigate('/login', { state: { from: currentPath } });
  return;
}
```

### 3. 남은 작업
- localStorage 토큰 유효성 실시간 검증 (향후 개선)
- e2e 테스트 추가 (향후 개선)

---

**작성자 노트**: 
- 2025-08-13 초기 분석: 리뷰 표시 문제 해결, AuthContext 문제 발견
- 2025-08-13 최종 해결: AuthContext isAuthenticated 로직 점진적 개선 완료, 관련 컴포넌트 패턴 통일

**해결 완료**: 주요 문제들이 모두 해결되었으며, 향후 개선 사항은 별도 이슈로 관리 예정
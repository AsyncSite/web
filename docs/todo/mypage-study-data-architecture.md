# 마이페이지 스터디 데이터 아키텍처 개선

## 배경 및 맥락

### 현재 시스템 구조
AsyncSite는 스터디 관리 플랫폼으로, 사용자들이 스터디를 제안하고, 신청하고, 참여할 수 있는 시스템입니다.

#### 스터디 생명주기
1. **제안(Proposal)**: 사용자가 새 스터디 제안 → status: `PENDING`
2. **승인(Approval)**: 관리자가 제안 검토 후 승인 → status: `APPROVED`
3. **모집(Recruitment)**: 승인된 스터디가 참가자 모집
4. **신청(Application)**: 사용자가 스터디 참가 신청 → application status: `PENDING`
5. **참여(Participation)**: 호스트가 신청 승인 → member role: `MEMBER`/`OWNER`
6. **진행(In Progress)**: 스터디 시작 → status: `IN_PROGRESS`
7. **완료(Completed)**: 스터디 종료 → status: `COMPLETED`

#### 사용자와 스터디의 관계
한 사용자는 여러 스터디와 다양한 관계를 가질 수 있습니다:
- **제안자(Proposer)**: 스터디를 제안한 사람
- **리더(Owner)**: 승인된 스터디의 관리자 (보통 제안자가 됨)
- **멤버(Member)**: 스터디에 참여 중인 사람
- **신청자(Applicant)**: 스터디에 신청한 사람

## 현재 문제

### 1. API 설계의 불일치
현재 API 구조는 각 관계를 별도로 조회해야 합니다:

```
/api/studies              → 공개 스터디 (APPROVED만)
/api/studies/my/studies   → 내가 멤버인 스터디
/api/studies/my/applications → 내가 신청한 스터디
/api/studies/my/proposed  → ❌ 없음 (내가 제안한 스터디)
```

### 2. 데이터 필터링 문제
`getAllStudies()`는 공개용 API로 APPROVED 상태만 반환합니다:
```typescript
// studyService.ts
return studies
  .filter(study => study.status === 'APPROVED' && !study.deleted)
  .map(transformStudy);
```

이로 인해 마이페이지에서 PENDING 상태의 제안한 스터디를 볼 수 없습니다.

### 3. 프론트엔드 복잡성
현재 프론트엔드는 여러 API를 호출하고 클라이언트에서 데이터를 조합합니다:
```typescript
// ProfilePageNew.tsx
const [studiesData, applicationsData, allStudiesData, reviewsData] = await Promise.all([
  studyService.getMyStudies(),
  studyService.getMyApplications(),
  studyService.getAllStudies(),  // PENDING 스터디 누락!
  reviewService.getMyReviews()
]);
```

### 4. 용어 혼란
- "대기중"이 두 가지 의미로 사용됨:
  - 내가 제안한 스터디의 관리자 승인 대기 (study status: PENDING)
  - 내가 신청한 스터디의 호스트 승인 대기 (application status: PENDING)

## 현재 상황

### 데이터베이스 상태
```sql
-- 예시: asyncsite@gmail.com 사용자
-- 제안한 스터디 (승인 대기)
studies 테이블: proposer_id='asyncsite@gmail.com', status='PENDING'

-- 멤버로 참여 중인 스터디
member 테이블: user_id='asyncsite@gmail.com', role='OWNER'/'MEMBER', status='ACTIVE'

-- 신청한 스터디
application 테이블: applicant_id='asyncsite@gmail.com', status='PENDING'/'ACCEPTED'/'REJECTED'
```

### 마이페이지 요구사항
마이페이지에서 보여줘야 하는 섹션들:

1. **제안한 스터디** (승인 대기중)
   - 내가 제안했지만 아직 관리자 승인 대기 중
   - study status: `PENDING`
   - proposer_id = 현재 사용자

2. **신청 대기중**
   - 내가 다른 스터디에 신청했지만 호스트 승인 대기 중
   - application status: `PENDING`
   - applicant_id = 현재 사용자

3. **참여중**
   - 현재 활발히 참여 중인 스터디
   - member status: `ACTIVE`
   - role: `MEMBER`

4. **리드중**
   - 내가 리더로 관리하는 스터디
   - member status: `ACTIVE`
   - role: `OWNER`

5. **완료됨**
   - 종료된 스터디들
   - study status: `COMPLETED` or `TERMINATED`

## 근본적 해결 방안

### 1. 백엔드 API 재설계

#### Option A: 통합 API (권장)
```
GET /api/studies/my/dashboard
```

응답 구조:
```json
{
  "proposed": [      // 내가 제안한 스터디들
    {
      "id": "...",
      "title": "...",
      "status": "PENDING",  // or REJECTED
      "createdAt": "...",
      "rejectionReason": "..."  // if rejected
    }
  ],
  "applications": [  // 내가 신청한 스터디들
    {
      "applicationId": "...",
      "studyId": "...",
      "studyTitle": "...",
      "status": "PENDING",  // or ACCEPTED, REJECTED
      "appliedAt": "..."
    }
  ],
  "participating": [ // 내가 참여중인 스터디들
    {
      "memberId": "...",
      "studyId": "...",
      "studyTitle": "...",
      "role": "MEMBER",
      "joinedAt": "...",
      "attendanceRate": 95
    }
  ],
  "leading": [       // 내가 리드하는 스터디들
    {
      "memberId": "...",
      "studyId": "...",
      "studyTitle": "...",
      "role": "OWNER",
      "memberCount": 12,
      "nextSession": "..."
    }
  ],
  "completed": [     // 완료된 스터디들
    {
      "studyId": "...",
      "studyTitle": "...",
      "completedAt": "...",
      "hasReview": false
    }
  ]
}
```

#### Option B: 쿼리 파라미터 지원
```
GET /api/studies/my?include=proposed,applications,members&status=ALL
```

### 2. 프론트엔드 단순화

```typescript
// 하나의 API 호출로 모든 데이터 가져오기
const dashboardData = await studyService.getMyDashboard();

// 바로 렌더링 가능한 구조
setProposedStudies(dashboardData.proposed);
setApplications(dashboardData.applications);
setParticipating(dashboardData.participating);
// ...
```

### 3. 데이터베이스 쿼리 최적화

백엔드에서 한 번의 쿼리로 모든 관계 조회:
```sql
-- 예시 쿼리 (실제는 JPA/QueryDSL 사용)
SELECT * FROM (
  -- 제안한 스터디
  SELECT 'proposed' as category, s.* 
  FROM studies s 
  WHERE proposer_id = :userId AND status IN ('PENDING', 'REJECTED')
  
  UNION ALL
  
  -- 멤버인 스터디
  SELECT 'member' as category, s.* 
  FROM studies s 
  JOIN member m ON s.id = m.study_id 
  WHERE m.user_id = :userId
  
  UNION ALL
  
  -- 신청한 스터디
  SELECT 'application' as category, s.* 
  FROM studies s 
  JOIN application a ON s.id = a.study_id 
  WHERE a.applicant_id = :userId
) AS user_studies
ORDER BY created_at DESC;
```

## 구현 단계

### Phase 1: 백엔드 API 추가 (우선순위: 높음)
1. `StudyController`에 `/api/studies/my/dashboard` 엔드포인트 추가
2. `StudyService`에 통합 조회 메서드 구현
3. 권한 체크 로직 추가 (본인 데이터만 조회 가능)
4. 테스트 작성

### Phase 2: 프론트엔드 리팩토링
1. `studyService.ts`에 `getMyDashboard()` 메서드 추가
2. `ProfilePageNew.tsx` 단순화
3. 불필요한 클라이언트 사이드 필터링 제거
4. 로딩 상태 개선

### Phase 3: UI/UX 개선
1. 섹션 명칭 명확화:
   - "제안한 스터디" → 관리자 승인 대기
   - "신청 대기중" → 호스트 승인 대기
   - "참여중" → 현재 활동 중
2. 각 섹션별 적절한 액션 버튼 추가
3. 상태별 시각적 구분 강화

## 테스트 시나리오

1. **제안한 스터디 표시**
   - 사용자가 스터디 제안
   - 마이페이지에서 "제안한 스터디" 섹션 확인
   - PENDING 상태 표시 확인

2. **신청한 스터디 표시**
   - 다른 스터디에 참가 신청
   - 마이페이지에서 "신청 대기중" 섹션 확인
   - 신청 상태별 표시 확인

3. **권한 체크**
   - 다른 사용자의 데이터 접근 시도
   - 403 Forbidden 응답 확인

## 관련 파일

### 백엔드
- `/study-service/src/main/kotlin/com/asyncsite/study/adapter/in/web/StudyController.kt`
- `/study-service/src/main/kotlin/com/asyncsite/study/application/service/StudyService.kt`
- `/study-service/src/main/kotlin/com/asyncsite/study/adapter/out/persistence/StudyRepository.kt`

### 프론트엔드
- `/web/src/api/studyService.ts`
- `/web/src/pages/user/ProfilePageNew.tsx`
- `/web/src/utils/studyStatusUtils.ts`

## 현재 임시 해결책

프론트엔드에서 PENDING 스터디를 가져오기 위해 `getAllStudies()`를 수정하거나 별도 메서드를 추가할 수 있지만, 이는 보안상 문제가 있습니다 (다른 사용자의 PENDING 스터디도 볼 수 있음).

따라서 백엔드 API 개선이 필수적입니다.

## 참고사항

- 현재 `member` 테이블에 스터디 제안자를 OWNER로 자동 추가하는 로직이 없어서 수동으로 INSERT 필요
- `application` 테이블과 `member` 테이블의 관계 정리 필요
- 스터디 상태 전환 시 관련 테이블 동기화 로직 검증 필요
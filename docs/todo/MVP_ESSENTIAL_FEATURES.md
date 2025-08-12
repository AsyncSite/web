# MVP Essential Features - Implementation TODO

## Overview
스터디 플랫폼의 MVP 필수 기능 구현을 위한 작업 목록입니다.
유저 플로우 완성과 서비스 운영을 위한 최소 필수 기능에 집중합니다.

## Priority Levels
- 🔴 **P0 (Critical)**: 서비스 운영 불가능 - 즉시 구현 필요
- 🟠 **P1 (High)**: UX 핵심 - 빠른 시일 내 구현 필요  
- 🟡 **P2 (Medium)**: 개선사항 - 차후 구현 가능

## Phase 1: Review System Integration 🔴

### 1.1 API Service Layer
**File**: `src/api/reviewService.ts`

- [ ] Create reviewService.ts file
- [ ] Implement API methods:
  - [ ] `createReview(studyId, data)` - 리뷰 작성
  - [ ] `getReviews(studyId, params)` - 리뷰 목록 조회
  - [ ] `getReviewStatistics(studyId)` - 리뷰 통계
  - [ ] `updateReview(reviewId, data)` - 리뷰 수정
  - [ ] `deleteReview(reviewId)` - 리뷰 삭제
  - [ ] `likeReview(reviewId)` - 좋아요
  - [ ] `unlikeReview(reviewId)` - 좋아요 취소
  - [ ] `getMyReviews()` - 내 리뷰 목록

### 1.2 Review Components
**Location**: `src/components/review/`

- [ ] Create review components structure:
  ```
  components/review/
  ├── ReviewList.tsx         # 리뷰 목록 컴포넌트
  ├── ReviewItem.tsx         # 개별 리뷰 아이템
  ├── ReviewForm.tsx         # 리뷰 작성/수정 폼
  ├── ReviewStatistics.tsx  # 리뷰 통계 표시
  ├── ReviewSection.tsx      # 전체 리뷰 섹션
  └── Review.css            # 스타일시트
  ```

### 1.3 Integration Points
- [ ] **StudyDetailPageRenderer.tsx**:
  - [ ] Add ReviewSection after FAQ section
  - [ ] Show only for COMPLETED studies
  - [ ] Check membership status for write permission

- [ ] **ProfilePage.tsx**:
  - [ ] Add "리뷰 쓰기" button for COMPLETED studies
  - [ ] Add "내 리뷰" section
  - [ ] Link to study detail page review section

- [ ] **StudyManagementPage.tsx**:
  - [ ] Add "리뷰 관리" tab
  - [ ] Show review statistics
  - [ ] List all reviews with moderation options

### 1.4 UI/UX Requirements
- [ ] Rating stars (1-5)
- [ ] Review types (OVERALL, CONTENT, OPERATION)
- [ ] Like/Unlike functionality
- [ ] Edit/Delete for own reviews
- [ ] Pagination for review list
- [ ] Sort options (latest, highest rated, most liked)

## Phase 2: ProfilePage Simplification 🔴

### 2.1 Current Issues
- Information duplication (approved applications = participating studies)
- Complex UI with 3 different sections
- No action buttons based on study status

### 2.2 New Structure
**File**: `src/pages/user/ProfilePage.tsx`

- [ ] Redesign data structure:
  ```typescript
  interface StudyActivity {
    studyId: string;
    studyTitle: string;
    category: 'active' | 'pending' | 'completed' | 'leading';
    status: StudyStatus;
    role: MemberRole;
    joinedAt?: string;
    completedAt?: string;
    hasReview?: boolean;
  }
  ```

- [ ] Simplify UI sections:
  ```
  나의 스터디 활동
  ├── 🟢 진행 중 (IN_PROGRESS)
  │   └── 현재 참여 중인 스터디 목록
  ├── 🟡 대기 중 (PENDING applications)
  │   └── 승인 대기 중인 신청
  ├── ✅ 완료됨 (COMPLETED)
  │   └── 리뷰 작성 가능한 스터디
  └── 👑 리드 중 (OWNER role)
      └── 관리 페이지 바로가기
  ```

### 2.3 Action Buttons
- [ ] Status-based actions:
  - [ ] IN_PROGRESS → "스터디 페이지"
  - [ ] PENDING → "신청 취소"
  - [ ] COMPLETED + !hasReview → "리뷰 작성"
  - [ ] COMPLETED + hasReview → "리뷰 보기"
  - [ ] OWNER → "관리 페이지"

### 2.4 Visual Improvements
- [ ] Use consistent card design
- [ ] Add status badges with colors
- [ ] Reduce visual clutter
- [ ] Mobile-responsive grid layout

## Phase 3: Study Status-based UI 🟠

### 3.1 StudyDetailPageRenderer Enhancements
**File**: `src/components/studyDetailPage/StudyDetailPageRenderer.tsx`

- [ ] Add status-aware rendering:
  ```typescript
  // Recruitment phase (APPROVED, before start)
  if (isRecruiting) {
    // Show: Apply button, capacity info, deadline
    // Hide: Member-only content, reviews
  }
  
  // Active phase (IN_PROGRESS)
  if (isActive && isMember) {
    // Show: Member-only sections, resources
    // Hide: Apply button
  }
  
  // Completed phase (COMPLETED)
  if (isCompleted) {
    // Show: Review section prominently
    // Show: "Write review" CTA if member
    // Hide: Apply button
  }
  ```

### 3.2 Member-only Features
- [ ] Create MemberOnlySection component:
  - [ ] Announcements display
  - [ ] Study materials/resources
  - [ ] Session schedule
  - [ ] Member list with attendance

### 3.3 Dynamic Member Data
- [ ] Fix hardcoded members in StudyDetailPageRenderer
- [ ] Fetch actual member data from API
- [ ] Show real attendance rates
- [ ] Display member join dates

## Phase 4: Component Implementation Details 🟡

### 4.1 ReviewForm Component Specification
```typescript
interface ReviewFormProps {
  studyId: string;
  existingReview?: Review;
  onSubmit: (review: Review) => void;
  onCancel: () => void;
}

// Form fields:
- type: ReviewType (dropdown)
- title: string (required, max 100)
- content: string (required, max 1000)
- rating: number (1-5 stars)
- tags: string[] (optional, chips)
```

### 4.2 ReviewItem Component Specification
```typescript
interface ReviewItemProps {
  review: Review;
  currentUserId?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onLike?: () => void;
}

// Display elements:
- Author info (name, avatar)
- Rating stars
- Review content
- Tags
- Like count & button
- Edit/Delete if owner
- Created/Updated date
```

## Testing Checklist

### API Integration Tests
- [ ] Review CRUD operations
- [ ] Like/Unlike functionality
- [ ] Permission checks (member-only)
- [ ] Error handling

### UI/UX Tests
- [ ] Form validation
- [ ] Loading states
- [ ] Error messages
- [ ] Mobile responsiveness
- [ ] Accessibility (ARIA labels)

### User Flow Tests
- [ ] Complete study → Write review flow
- [ ] View reviews → Like review flow
- [ ] Profile → Completed studies → Review flow

## Success Metrics
- [ ] All COMPLETED studies have review section
- [ ] Members can write one review per study
- [ ] Reviews are displayed with proper formatting
- [ ] ProfilePage shows clear study categories
- [ ] Status-based UI changes work correctly

## Notes
- Priority on functionality over aesthetics initially
- Reuse existing components where possible
- Follow existing code patterns in the repository
- Test with actual API data, not mocks

## Implementation Order
1. **Day 1**: Review API service + basic components
2. **Day 2**: Review integration in StudyDetailPageRenderer
3. **Day 3**: ProfilePage redesign
4. **Day 4**: Status-based UI differentiation
5. **Day 5**: Testing and refinements

---
Last Updated: 2025-08-12
Status: In Progress
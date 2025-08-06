# Editor Integration 구현 계획

## 전체 일정
- **예상 기간**: 4주 (2025년 1월 2주 ~ 2월 1주)
- **투입 인원**: Frontend 1명, Backend 2명

## Phase 1: 기반 구축 (1주차)

### Frontend 작업
#### 1.1 Editor 컴포넌트 라이브러리 구축
```typescript
// 구현할 컴포넌트 구조
src/components/editor/
├── EditorProvider.tsx       // 전역 에디터 설정 관리
├── RichTextEditor.tsx       // 메인 에디터 컴포넌트
├── ReadOnlyViewer.tsx       // 읽기 전용 뷰어
├── EditorToolbar.tsx        // 툴바 컴포넌트
├── plugins/                 // 커스텀 플러그인
│   ├── ImageUploadPlugin.tsx
│   ├── CodeBlockPlugin.tsx
│   └── TablePlugin.tsx
├── utils/
│   ├── serializer.ts       // 콘텐츠 직렬화
│   ├── sanitizer.ts        // XSS 방지
│   └── validator.ts        // 콘텐츠 검증
└── styles/
    └── editor.css          // 에디터 스타일
```

#### 1.2 Editor.js 초기 설정
```bash
npm install @editorjs/editorjs @editorjs/header @editorjs/list @editorjs/image @editorjs/code
```

### Backend 작업

#### 1.3 User Service 스키마 변경
```sql
-- User 프로필 확장
ALTER TABLE users ADD COLUMN bio TEXT;
ALTER TABLE users ADD COLUMN bio_format VARCHAR(20) DEFAULT 'plain';
ALTER TABLE users ADD COLUMN bio_updated_at TIMESTAMP;

-- 프로필 이미지 저장
CREATE TABLE user_profile_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_email) REFERENCES users(email)
);
```

#### 1.4 Study Service 스키마 변경
```sql
-- Study 상세 정보 확장
ALTER TABLE studies ADD COLUMN details TEXT;
ALTER TABLE studies ADD COLUMN details_format VARCHAR(20) DEFAULT 'plain';
ALTER TABLE studies ADD COLUMN curriculum TEXT;
ALTER TABLE studies ADD COLUMN curriculum_format VARCHAR(20) DEFAULT 'plain';

-- 스터디 리소스 테이블
CREATE TABLE study_resources (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_id BIGINT NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_url VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (study_id) REFERENCES studies(id)
);
```

## Phase 2: Who We Are 프로필 구현 (2주차)

### Frontend 작업

#### 2.1 프로필 편집 페이지 개발
```typescript
// src/pages/user/ProfileEditPage.tsx 수정
interface ProfileEditForm {
  name: string;
  email: string;
  bio: EditorJSData; // Editor.js 데이터 형식
  profileImage: string;
}
```

#### 2.2 프로필 뷰 페이지 개발
```typescript
// src/components/whoweare/MemberProfileCard.tsx
interface MemberProfileProps {
  member: WhoWeAreMemberData;
  bio: EditorJSData;
  onEdit?: () => void;
}
```

### Backend 작업

#### 2.3 User Service API 개발
```java
// UserController.java
@PutMapping("/api/users/me/profile")
public ResponseEntity<UserProfileResponse> updateProfile(
    @RequestBody UpdateProfileRequest request,
    @AuthenticationPrincipal UserPrincipal principal
) {
    // 프로필 업데이트 로직
}

@GetMapping("/api/users/{userId}/profile")
public ResponseEntity<UserProfileResponse> getProfile(
    @PathVariable Long userId
) {
    // 프로필 조회 로직
}
```

#### 2.4 이미지 업로드 API
```java
@PostMapping("/api/users/me/profile-image")
public ResponseEntity<ImageUploadResponse> uploadProfileImage(
    @RequestParam("file") MultipartFile file,
    @AuthenticationPrincipal UserPrincipal principal
) {
    // S3 업로드 로직
}
```

### 통합 테스트
- [ ] 프로필 작성 및 저장
- [ ] 이미지 업로드
- [ ] XSS 방지 테스트
- [ ] 모바일 반응형 테스트

## Phase 3: Study Service 구현 (3주차)

### Frontend 작업

#### 3.1 스터디 생성/편집 폼
```typescript
// src/pages/study/StudyCreatePage.tsx
interface StudyCreateForm {
  title: string;
  category: string;
  details: TipTapContent; // TipTap으로 전환
  curriculum: TipTapContent;
  maxMembers: number;
  duration: StudyDuration;
}
```

#### 3.2 TipTap 마이그레이션
```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-table @tiptap/extension-image
```

### Backend 작업

#### 3.3 Study Service API 개발
```java
// StudyController.java
@PostMapping("/api/studies/v1/studies")
public ResponseEntity<StudyResponse> createStudy(
    @RequestBody CreateStudyRequest request,
    @AuthenticationPrincipal UserPrincipal principal
) {
    // 스터디 생성 로직
}

@PutMapping("/api/studies/v1/studies/{studyId}")
public ResponseEntity<StudyResponse> updateStudy(
    @PathVariable Long studyId,
    @RequestBody UpdateStudyRequest request,
    @AuthenticationPrincipal UserPrincipal principal
) {
    // 스터디 업데이트 로직
}
```

#### 3.4 콘텐츠 검증 서비스
```java
@Service
public class ContentValidationService {
    public void validateContent(String content, ContentFormat format) {
        // 콘텐츠 길이 검증
        // 허용된 태그만 포함되었는지 검증
        // 악성 스크립트 검증
    }
}
```

### 통합 테스트
- [ ] 스터디 생성 플로우
- [ ] 테이블 삽입 및 편집
- [ ] 체크리스트 기능
- [ ] 콘텐츠 길이 제한

## Phase 4: 백오피스 통합 (4주차)

### 백오피스 작업

#### 4.1 관리자 에디터 뷰
```typescript
// study-platform-backoffice/src/components/study/StudyDetailModal.tsx
interface StudyDetailModalProps {
  study: Study;
  onApprove: () => void;
  onReject: () => void;
  readOnly: boolean;
}
```

#### 4.2 콘텐츠 모더레이션
- 부적절한 콘텐츠 필터링
- 관리자 검토 대시보드
- 콘텐츠 승인/거절 플로우

### 마이그레이션

#### 4.3 기존 데이터 마이그레이션
```sql
-- 기존 plain text를 Editor 형식으로 변환
UPDATE users 
SET bio = JSON_OBJECT('blocks', JSON_ARRAY(
    JSON_OBJECT('type', 'paragraph', 'data', JSON_OBJECT('text', bio))
)),
bio_format = 'editorjs'
WHERE bio_format = 'plain';
```

### 최종 테스트 및 배포

#### 4.4 E2E 테스트
- [ ] 전체 사용자 플로우 테스트
- [ ] 성능 테스트 (대용량 콘텐츠)
- [ ] 브라우저 호환성 테스트
- [ ] 접근성 테스트

#### 4.5 배포 계획
1. **Stage 1**: 개발 환경 배포 및 내부 테스트
2. **Stage 2**: 스테이징 환경 배포 및 QA
3. **Stage 3**: 프로덕션 배포 (Feature Flag 사용)
4. **Stage 4**: 점진적 롤아웃 (10% → 50% → 100%)

## 리스크 관리

### 기술적 리스크
| 리스크 | 영향도 | 대응 방안 |
|--------|--------|-----------|
| 에디터 라이브러리 버그 | 높음 | 두 개 라이브러리 병행 사용 |
| XSS 보안 취약점 | 매우 높음 | DOMPurify 적용, 보안 감사 |
| 대용량 콘텐츠 성능 이슈 | 중간 | 페이지네이션, 지연 로딩 |
| 모바일 호환성 | 중간 | 반응형 디자인, 터치 최적화 |

### 일정 리스크
- **버퍼 기간**: 각 Phase 마다 2일 버퍼 확보
- **우선순위**: Who We Are 먼저 완료 후 Study Service 진행
- **MVP 범위**: 핵심 기능만 먼저 구현, 고급 기능은 2차 개발

## 성공 지표

### 정량적 지표
- 에디터 로딩 시간: < 2초
- 콘텐츠 저장 시간: < 1초
- 에러율: < 0.1%
- 모바일 사용률: > 30%

### 정성적 지표
- 사용자 만족도 설문 (5점 만점 4점 이상)
- 콘텐츠 작성 완료율 향상
- 지원 티켓 감소

## 팀 구성

### Frontend
- **담당자**: TBD
- **역할**: 에디터 컴포넌트 개발, UI/UX 구현

### Backend - User Service
- **담당자**: TBD
- **역할**: 프로필 API 개발, 이미지 업로드

### Backend - Study Service
- **담당자**: TBD
- **역할**: 스터디 콘텐츠 API, 검증 로직

### QA
- **담당자**: TBD
- **역할**: 테스트 계획 수립, E2E 테스트

## 다음 단계
1. 팀 구성 확정
2. 상세 기술 스펙 작성
3. 개발 환경 구축
4. Phase 1 착수

*최종 업데이트: 2025년 1월 6일*
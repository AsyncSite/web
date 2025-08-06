# Editor Integration 마이그레이션 가이드 (구현 완료)

## 1. 개요

이 문서는 AsyncSite 플랫폼에 TipTap 리치 텍스트 에디터를 통합하는 과정에서 수행된 실제 마이그레이션 작업을 기록합니다.

## 2. 실제 구현된 마이그레이션

### 2.1 User Service (✅ 완료)
- **추가된 필드:**
  - `users.role` - 사용자 역할/직책 (VARCHAR 100)
  - `users.quote` - 사용자 인용구/좌우명 (VARCHAR 255)
  - `users.bio` - 사용자 자기소개 (TEXT, HTML 형식)
- **마이그레이션 방식:** Flyway 마이그레이션 스크립트 사용
- **영향받은 기능:** ProfileEditPage, WhoWeArePage

### 2.2 Study Service (예정)
- `studies.details` - 스터디 상세 설명 (TEXT, HTML 형식 예정)
- `studies.curriculum` - 스터디 커리큘럼 (TEXT, HTML 형식 예정)
- 예상 레코드 수: ~500개

## 3. 실제 적용된 마이그레이션 전략

### 3.1 직접 스키마 확장 방식
```
1. Flyway 마이그레이션으로 새 필드 추가
   ↓
2. 도메인 엔티티 및 JPA 엔티티 업데이트
   ↓
3. API 엔드포인트 구현
   ↓
4. Frontend 컴포넌트 통합
   ↓
5. 테스트 및 버그 수정
```

**선택 이유:**
- 기존 데이터가 없어 복잡한 마이그레이션 불필요
- HTML 형식으로 직접 저장하여 변환 과정 단순화
- DOMPurify를 통한 XSS 방지로 보안 확보

## 4. 실제 구현 내용

### 4.1 데이터베이스 마이그레이션 (✅ 완료)

#### V1__Add_role_and_bio_fields.sql
```sql
-- 2025년 8월 6일 실행
ALTER TABLE users
ADD COLUMN role VARCHAR(100) NULL COMMENT '사용자 역할/직책' AFTER name,
ADD COLUMN bio TEXT NULL COMMENT '사용자 자기소개 (HTML 형식)' AFTER role;
```

#### V2__Add_quote_field.sql
```sql
-- 2025년 8월 6일 실행
ALTER TABLE users
ADD COLUMN quote VARCHAR(255) NULL COMMENT '사용자 인용구/좌우명' AFTER role;
```

**실행 결과:**
- ✅ 모든 마이그레이션 성공적으로 적용
- ✅ 기존 데이터 손실 없음
- ✅ 다운타임 없이 적용

### 4.2 Backend 구현 (✅ 완료)

#### Kotlin Domain Entity
```kotlin
// UserProfile.kt
data class UserProfile(
    val email: String,
    val name: String,
    val role: String? = null,    // 역할/직책
    val quote: String? = null,   // 인용구/좌우명
    val bio: String? = null,      // HTML 형식 자기소개
    val profileImage: String? = null,
    // ...
)
```

#### JPA Entity
```kotlin
// UserJpaEntity.kt
@Entity
@Table(name = "users")
class UserJpaEntity {
    @Column(name = "role", length = 100)
    var role: String? = null
    
    @Column(name = "quote", length = 255)
    var quote: String? = null
    
    @Column(name = "bio", columnDefinition = "TEXT")
    var bio: String? = null
    // ...
}
```

### 4.3 Frontend 구현 (✅ 완료)

#### TipTap Editor 컴포넌트
```typescript
// RichTextEditor.tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CharacterCount from '@tiptap/extension-character-count';
import DOMPurify from 'dompurify';

function RichTextEditor({
  value,
  onChange,
  maxLength = 2000,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      CharacterCount.configure({ limit: maxLength }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });
  
  // Value prop 변경 시 에디터 업데이트
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);
  
  return <EditorContent editor={editor} />;
}
```

#### 안전한 HTML 렌더링
```typescript
// RichTextDisplay.tsx
import DOMPurify from 'dompurify';

function RichTextDisplay({ content }: { content: string }) {
  const sanitizedHTML = DOMPurify.sanitize(content);
  
  return (
    <div 
      className="rich-text-display"
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  );
}
```

### 4.4 API 구현 (✅ 완료)

#### 프로필 조회 API
```kotlin
// UserProfileController.kt
@GetMapping("/api/users/me")
fun getCurrentUser(@AuthenticationPrincipal userDetails: CustomUserDetails): ResponseEntity<UserProfileResponse> {
    val profile = getUserProfileUseCase.execute(GetUserProfileCommand(userDetails.username))
    return ResponseEntity.ok(UserProfileResponse.from(profile))
}
```

#### 프로필 업데이트 API
```kotlin
@PutMapping("/api/users/me")
fun updateProfile(
    @RequestBody request: UserUpdateRequest,
    @AuthenticationPrincipal userDetails: CustomUserDetails
): ResponseEntity<UserProfileResponse> {
    val command = UpdateUserProfileCommand(
        email = userDetails.username,
        name = request.name,
        role = request.role,      // 새로운 필드
        quote = request.quote,    // 새로운 필드
        bio = request.bio,        // HTML 형식
        profileImage = request.profileImage
    )
    val updated = updateUserProfileUseCase.execute(command)
    return ResponseEntity.ok(UserProfileResponse.from(updated))
}
```

#### Public API (WhoWeAre)
```kotlin
@GetMapping("/api/public/users/whoweare-members")
fun getWhoWeAreMembers(): ResponseEntity<List<PublicTeamMemberResponse>> {
    val members = userRepository.findBySystemRole("ROLE_ADMIN")
    return ResponseEntity.ok(members.map { PublicTeamMemberResponse.from(it) })
}
```

## 5. 실제 통합 과정

### 5.1 ProfileEditPage 통합 (✅ 완료)
```typescript
// ProfileEditPage.tsx
interface ProfileFormData {
  name: string;
  role: string;       // 일반 텍스트 입력
  quote: string;      // 일반 텍스트 입력 (255자 제한)
  bio: string;        // HTML 리치 텍스트
  profileImage: string;
}

function ProfileEditPage() {
  const [formData, setFormData] = useState<ProfileFormData>({
    name: user?.name || '',
    role: user?.role || '',
    quote: user?.quote || '',
    bio: user?.bio || '',
    profileImage: user?.profileImage || ''
  });
  
  return (
    <>
      <input 
        value={formData.role}
        onChange={(e) => setFormData({...formData, role: e.target.value})}
        maxLength={100}
        placeholder="예: Frontend Developer"
      />
      
      <input
        value={formData.quote}
        onChange={(e) => setFormData({...formData, quote: e.target.value})}
        maxLength={255}
        placeholder="좌우명을 입력하세요"
      />
      
      <RichTextEditor
        value={formData.bio}
        onChange={(bio) => setFormData({...formData, bio})}
        maxLength={2000}
      />
    </>
  );
}
```

### 5.2 WhoWeAre 페이지 통합 (✅ 완료)
```typescript
// WhoWeArePage.tsx
const [adminMembers, setAdminMembers] = useState<PublicTeamMember[]>([]);

useEffect(() => {
  fetchWhoWeAreMembers().then(members => {
    setAdminMembers(members);
  });
}, []);

// 백엔드 멤버와 하드코딩된 멤버 결합
const allMembers = [
  ...whoweareTeamMembers.map((member, index) => ({
    ...member,
    // 백엔드 데이터가 있으면 사용, 없으면 하드코딩 데이터 사용
    quote: adminMembers[index]?.quote || member.quote,
    story: adminMembers[index]?.bio 
      ? DOMPurify.sanitize(adminMembers[index].bio)
      : member.story
  })),
  ...adminMembers.slice(whoweareTeamMembers.length)
];
```

## 6. 해결한 주요 문제들

### 6.1 Three.js 리렌더링 문제 (✅ 해결)
**문제:** WhoWeAre 페이지에서 백엔드 데이터 로드 시 Three.js 씬이 업데이트되지 않음 (6개 행성만 표시)

**해결:** 
```typescript
// ThreeSceneFloatingStory.tsx
useEffect(() => {
  let mounted = true;
  
  // 기존 캔버스 제거 및 애니메이션 취소
  const canvas = sceneRef.current?.querySelector('canvas');
  if (canvas) {
    canvas.remove();
  }
  if (animationIdRef.current) {
    cancelAnimationFrame(animationIdRef.current);
  }
  
  // 씬 재초기화
  initializeScene();
  
  return () => {
    mounted = false;
    // 클린업 로직
  };
}, [members]); // members 변경 시 재실행
```

### 6.2 RichTextEditor value prop 업데이트 문제 (✅ 해결)
**문제:** 프로필 편집 페이지 열 때 기존 데이터가 에디터에 로드되지 않음

**해결:**
```typescript
// RichTextEditor.tsx
useEffect(() => {
  if (editor && value !== editor.getHTML()) {
    editor.commands.setContent(value);
  }
}, [value, editor]);
```

### 6.3 API 응답 처리 불일치 (✅ 해결)
**문제:** updateProfile API가 response.data.data를 기대하지만 실제로는 response.data 반환

**해결:**
```typescript
// userService.ts
async updateProfile(data: UpdateProfileRequest): Promise<User> {
  const response = await apiClient.put<User>('/api/users/me', data);
  return response.data; // response.data.data가 아닌 response.data
}
```

### 6.4 XSS 보안 문제 (✅ 해결)
**문제:** 사용자가 입력한 HTML이 그대로 렌더링되면 XSS 공격 가능

**해결:** DOMPurify를 사용한 HTML sanitization
```typescript
import DOMPurify from 'dompurify';

const sanitizedHTML = DOMPurify.sanitize(bio);
<div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />
```

## 7. 테스트 및 검증 (✅ 완료)

### 7.1 수행된 테스트
1. **프로필 CRUD 테스트**
   - ✅ 프로필 생성 (role, quote, bio)
   - ✅ 프로필 조회
   - ✅ 프로필 수정
   - ✅ 필드별 글자 수 제한 검증

2. **WhoWeAre 통합 테스트**
   - ✅ 백엔드 관리자 프로필 로드
   - ✅ 하드코딩 멤버와 결합
   - ✅ Three.js 8개 행성 렌더링
   - ✅ 클릭 이벤트 동작

3. **보안 테스트**
   - ✅ XSS 스크립트 주입 차단
   - ✅ DOMPurify sanitization 검증

### 7.2 Docker 환경 테스트
```bash
# 실제 수행된 테스트 커맨드
cd core-platform
./docker-compose-oauth.sh

# 로그 확인
docker logs user-service
docker logs web

# 데이터베이스 확인
docker exec -it mysql-db mysql -u root -p
USE asyncsite;
SELECT email, role, quote, bio FROM users WHERE role IS NOT NULL;
```

## 8. 배포 및 롤백

### 8.1 배포 프로세스 (✅ 완료)
```bash
# 1. 백엔드 배포
cd user-service
git add .
git commit -m "feat: Add role, quote, bio fields for user profile"
git push origin main

# 2. 프론트엔드 배포
cd web
git add .
git commit -m "feat: Integrate TipTap editor for user profiles"
git push origin main

# 3. Docker 이미지 빌드 및 배포
./deploy.sh
```

### 8.2 롤백 계획 (필요시)
```sql
-- 필드 제거 (데이터 손실 주의)
ALTER TABLE users 
DROP COLUMN role,
DROP COLUMN quote,
DROP COLUMN bio;
```

## 9. 구현 체크리스트 (✅ 모두 완료)

### Backend
- ✅ Flyway 마이그레이션 스크립트 작성
- ✅ Domain Entity 업데이트 (UserProfile)
- ✅ JPA Entity 업데이트 (UserJpaEntity)
- ✅ API 엔드포인트 구현 (/api/users/me)
- ✅ Public API 구현 (/api/public/users/whoweare-members)
- ✅ 테스트 및 검증

### Frontend
- ✅ TipTap 패키지 설치
- ✅ RichTextEditor 컴포넌트 구현
- ✅ RichTextDisplay 컴포넌트 구현
- ✅ ProfileEditPage 통합
- ✅ WhoWeArePage 통합
- ✅ Three.js 씬 업데이트 문제 해결
- ✅ DOMPurify 보안 적용

### 문서화
- ✅ API_DESIGN.md 업데이트
- ✅ IMPLEMENTATION_PLAN.md 업데이트
- ✅ README.md 업데이트
- ✅ MIGRATION_GUIDE.md 업데이트

## 10. 주요 학습 사항

### 성공 요인
1. **단순한 접근**: 복잡한 JSON 형식 대신 HTML 직접 저장
2. **점진적 구현**: User Profile 먼저 구현 후 Study Service 확장 계획
3. **보안 우선**: DOMPurify를 통한 XSS 방지
4. **실시간 피드백**: 개발 중 지속적인 테스트와 수정

### 개선 사항 (향후)
1. 이미지 업로드 기능 추가
2. 더 많은 포맷팅 옵션 (테이블, 코드 블록 등)
3. 버전 관리 시스템 구현
4. 콘텐츠 히스토리 추적

## 11. 참고 자료

- [TipTap Documentation](https://tiptap.dev/)
- [DOMPurify Security](https://github.com/cure53/DOMPurify)
- [Flyway Migration Guide](https://flywaydb.org/documentation/)
- [Spring Boot JPA](https://spring.io/guides/gs/accessing-data-jpa/)

*최종 업데이트: 2025년 8월 6일*
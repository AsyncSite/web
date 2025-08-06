# Profile & WhoWeAre Data Structure Mapping (구현 완료)

## 실제 구현 데이터 구조 ✅

### ProfileEditPage Fields (User Profile - 구현됨)
```typescript
interface ProfileFormData {
  name: string;           // 이름 (예: "RENE CHOI")
  role: string;          // 역할/직책 (예: "Platform Architect")
  quote: string;         // 인용구/좌우명 (예: "함께 성장하는 커뮤니티를 만들어갑니다")
  bio: string;           // 스토리 (HTML 리치 텍스트)
  profileImage: string;  // 프로필 이미지 URL
}
```

### WhoWeAre Page Fields (Team Member - 통합됨)
```typescript
{
  name: string;          // 이름 - ✅ Maps to User.name
  role: string;          // 역할 - ✅ Maps to User.role  
  quote: string;         // 인용구 - ✅ Maps to User.quote
  story: string;         // 스토리 - ✅ Maps to User.bio
  profileImage: string;  // 이미지 - ✅ Maps to User.profileImage
  
  // WhoWeAre specific fields (hardcoded)
  color: string;         // 색상 - 하드코딩
  position: {...};       // 3D 위치 - 하드코딩
}
```

## 실제 구현 결과 ✅

현재 구현은 WhoWeAre 페이지 구조를 완벽하게 지원합니다:

1. **Role Field**: 역할/직책을 스토리와 분리 (100자 제한)
2. **Quote Field**: 새로 추가된 인용구 필드 (255자 제한)
3. **Bio/Story Field**: 리치 텍스트 에디터로 상세 스토리 작성 (2000자 제한)
4. **데이터 통합**: 
   - 백엔드 API를 통한 ADMIN 사용자 데이터 로드
   - 하드코딩된 팀 멤버와 동적 결합

## 실제 통합 방식 (구현됨) ✅

### 현재 구현: 직접 매핑 + 동적 결합

#### Backend API
```kotlin
// UserProfileController.kt
@GetMapping("/api/public/users/whoweare-members")
fun getWhoWeAreMembers(): List<PublicTeamMemberResponse> {
  return userRepository.findBySystemRole("ROLE_ADMIN")
    .map { PublicTeamMemberResponse.from(it) }
}
```

#### Frontend 통합
```typescript
// WhoWeArePage.tsx
const allMembers = [
  ...whoweareTeamMembers.map((member, index) => ({
    ...member,
    // 백엔드 데이터가 있으면 사용, 없으면 하드코딩 데이터 사용
    quote: adminMembers[index]?.quote || member.quote,
    story: adminMembers[index]?.bio 
      ? DOMPurify.sanitize(adminMembers[index].bio)
      : member.story
  })),
  ...adminMembers.slice(whoweareTeamMembers.length) // 추가 ADMIN 사용자
];
```

#### 매핑 규칙
- `User.name` → `WhoWeAreMember.name`
- `User.role` → `WhoWeAreMember.role`
- `User.quote` → `WhoWeAreMember.quote` ✅ NEW
- `User.bio` → `WhoWeAreMember.story`
- `User.profileImage` → `WhoWeAreMember.profileImage`

## Usage Example

### In ProfileEditPage
```tsx
// User edits their profile
<input name="role" placeholder="Product Architect" />
<RichTextEditor name="bio" placeholder="Your story..." />
```

### In WhoWeAre Page
```tsx
// Display user data in team showcase
<div className="member-role">{user.role}</div>
<div className="member-story">{user.bio}</div>
```

## Benefits of Current Structure

1. **Separation of Concerns**: Role and story are distinct
2. **Flexibility**: Role is plain text, story is rich text
3. **Compatibility**: Maps cleanly to WhoWeAre requirements
4. **Extensibility**: Easy to add more fields if needed

## 실제 마이그레이션 (완료) ✅

실제로 수행된 Flyway 마이그레이션:

### V1__Add_role_and_bio_fields.sql
```sql
ALTER TABLE users
ADD COLUMN role VARCHAR(100) NULL COMMENT '사용자 역할/직책' AFTER name,
ADD COLUMN bio TEXT NULL COMMENT '사용자 자기소개 (HTML 형식)' AFTER role;
```

### V2__Add_quote_field.sql
```sql
ALTER TABLE users
ADD COLUMN quote VARCHAR(255) NULL COMMENT '사용자 인용구/좌우명' AFTER role;
```

## 결론

구현이 성공적으로 완료되어 WhoWeAre 페이지 요구사항을 모두 충족했습니다:
- ✅ 별도의 `role` 필드로 직책 관리 (100자)
- ✅ 새로운 `quote` 필드로 인용구 관리 (255자)
- ✅ 리치 텍스트 `bio` 필드로 스토리 작성 (2000자)
- ✅ 하드코딩된 데이터와 백엔드 데이터의 원활한 통합
- ✅ Three.js 씬에 8개 행성으로 모든 멤버 표시
- ✅ DOMPurify를 통한 안전한 HTML 렌더링

*최종 업데이트: 2025년 8월 6일*
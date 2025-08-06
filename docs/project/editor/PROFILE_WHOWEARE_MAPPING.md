# Profile & WhoWeAre Data Structure Mapping

## Data Structure Comparison

### ProfileEditPage Fields (User Profile)
```typescript
{
  name: string;           // 이름 (예: "RENE CHOI")
  role: string;          // 역할/직책 (예: "Visionary Builder & Product Architect")
  bio: string;           // 스토리 (HTML 리치 텍스트)
  profileImage: string;  // 프로필 이미지 URL
}
```

### WhoWeAre Page Fields (Team Member)
```typescript
{
  name: string;          // 이름 - ✅ Maps to User.name
  role: string;          // 역할 - ✅ Maps to User.role  
  story: string;         // 스토리 - ✅ Maps to User.bio
  profileImage: string;  // 이미지 - ✅ Maps to User.profileImage
  
  // WhoWeAre specific fields (not in User profile)
  quote: string;         // 인용구 - ❌ Not in profile
  color: string;         // 색상 - ❌ Not in profile
  position: {...};       // 3D 위치 - ❌ Not in profile
}
```

## Compatibility Status ✅

The current implementation successfully supports the WhoWeAre page structure:

1. **Role Field**: Added to separate title/position from story
2. **Bio/Story Field**: Rich text editor for detailed personal narrative
3. **Field Naming**: 
   - Profile uses `bio` (more generic)
   - WhoWeAre uses `story` (more specific)
   - Both serve the same purpose

## Integration Approach

### Option 1: Direct Mapping (Current)
Profile fields directly map to WhoWeAre display:
- `User.name` → `WhoWeAreMember.name`
- `User.role` → `WhoWeAreMember.role`
- `User.bio` → `WhoWeAreMember.story`
- `User.profileImage` → `WhoWeAreMember.profileImage`

### Option 2: Enhanced Mapping (Future)
Add WhoWeAre-specific fields as optional profile extensions:
```typescript
interface UserProfile extends User {
  // Core fields (shared)
  name: string;
  role: string;
  bio: string;
  profileImage: string;
  
  // WhoWeAre extensions (optional)
  whoweareQuote?: string;
  whoweareColor?: string;
  whowearePosition?: { x: number; y: number; z: number };
}
```

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

## Migration Path

If existing users need migration:
```sql
-- Add role field to users table
ALTER TABLE users ADD COLUMN role VARCHAR(100);

-- Optionally extract role from bio if it was combined
UPDATE users 
SET role = SUBSTRING(bio FROM 1 FOR POSITION('\n' IN bio) - 1)
WHERE bio LIKE '%\n%';
```

## Conclusion

The implementation successfully accommodates the WhoWeAre page requirements with:
- ✅ Separate `role` field for titles/positions
- ✅ Rich text `bio` field for stories
- ✅ Consistent data structure across pages
- ✅ Future-proof for additional features
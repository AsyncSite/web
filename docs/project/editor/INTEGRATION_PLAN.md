# TipTap Editor Integration Plan for AsyncSite

## Executive Summary

This document outlines the integration strategy for implementing TipTap rich text editor into the existing AsyncSite platform, which consists of two separate React applications:
- **Web Frontend** (`/asyncsite/web`) - User-facing application
- **Study Platform Backoffice** (`/asyncsite/study-platform-backoffice`) - Admin interface

## Current State Analysis

### 1. Web Frontend - Profile Editing
- **Component**: `src/pages/user/ProfileEditPage.tsx`
- **Current Implementation**: 
  - Simple input fields for name and profileImage
  - NO bio/description field exists
- **Data Types**:
  ```typescript
  interface UpdateProfileRequest {
    name?: string;
    profileImage?: string;
    // bio field missing - needs to be added
  }
  ```

### 2. Backoffice - Study Management
- **Component**: `src/components/study/StudyCreateModal.tsx`
- **Current Implementation**:
  - Plain `<textarea>` for description (500 char limit)
  - Styled-components for styling
- **Data Types**:
  ```typescript
  interface StudyCreateRequest {
    title: string;
    description: string;  // Currently plain text
    proposerId: string;
  }
  ```

### 3. Technology Stack
- React 19.0.0
- TypeScript 5.8.3
- styled-components (backoffice)
- CSS modules (web frontend)
- No existing rich text editor

## Integration Points

### Phase 1: Backoffice Study Management (Priority: HIGH)
**Why First?** Already has description field, simpler to implement

1. **StudyCreateModal.tsx** - Replace textarea with TipTap
2. **StudyCreateModalEnhanced.tsx** - Replace textarea with TipTap  
3. **StudyDetailModal.tsx** - Add rich text rendering for display

### Phase 2: Web Frontend Profile Bio (Priority: MEDIUM)
**Requires Backend Changes**

1. **ProfileEditPage.tsx** - Add bio field with TipTap editor
2. **Backend API** - Add bio field to User model
3. **Profile Display Pages** - Add bio rendering

## Technical Requirements

### 1. Package Installation

#### Both Projects Need:
```json
{
  "dependencies": {
    "@tiptap/react": "^2.1.0",
    "@tiptap/starter-kit": "^2.1.0",
    "@tiptap/extension-placeholder": "^2.1.0",
    "@tiptap/extension-character-count": "^2.1.0",
    "@tiptap/extension-link": "^2.1.0",
    "@tiptap/extension-image": "^2.1.0"
  }
}
```

#### For HTML Sanitization:
```json
{
  "dependencies": {
    "dompurify": "^3.0.0",
    "@types/dompurify": "^3.0.0"
  }
}
```

### 2. Data Format Considerations

#### Current Format:
- Plain text strings
- No HTML or formatting

#### Target Format Options:

**Option A: HTML (Recommended for initial implementation)**
```typescript
interface StudyCreateRequest {
  description: string; // HTML string: "<p>Study description with <strong>formatting</strong></p>"
}
```

**Option B: JSON (Better for future extensibility)**
```typescript
interface StudyCreateRequest {
  description: {
    html: string;
    json?: any; // TipTap JSON format
    plainText: string; // For search/preview
  };
}
```

### 3. Backend Modifications Required

#### For Study Descriptions:
- Increase character limit (currently 500)
- Add HTML sanitization
- Support HTML content type

#### For User Profiles (New):
- Add `bio` field to User entity
- Add `bio` to UpdateProfileRequest DTO
- Create validation rules
- Add HTML sanitization

## Implementation Strategy

### Step 1: Create Shared TipTap Component
Create a reusable editor component that can be used in both projects:

```typescript
// shared/components/RichTextEditor.tsx
interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  maxLength?: number;
  minHeight?: string;
  readOnly?: boolean;
}
```

### Step 2: Backoffice Integration
1. Replace textarea in StudyCreateModal
2. Update state management to handle HTML
3. Add rich text display in StudyDetailModal
4. Test with existing backend (may need backend updates)

### Step 3: Web Frontend Integration
1. Add bio field to ProfileEditPage
2. Implement backend API changes
3. Add bio display to profile views
4. Update AuthContext and types

### Step 4: Data Migration
1. Existing plain text descriptions remain as-is
2. New content uses rich text
3. Optional: Batch convert old content to HTML

## Risk Assessment

### High Risk:
- **Backend Compatibility**: Current backend expects plain text
- **Data Migration**: Existing content needs handling
- **XSS Security**: HTML content needs sanitization

### Medium Risk:
- **Bundle Size**: TipTap adds ~100-200KB
- **Browser Compatibility**: Modern browsers only
- **Mobile Experience**: Touch interactions need testing

### Low Risk:
- **Learning Curve**: TipTap has good documentation
- **Styling Conflicts**: Isolated component styling

## Success Metrics

1. **Functionality**:
   - Users can format text (bold, italic, lists)
   - Content saves and displays correctly
   - No data loss during migration

2. **Performance**:
   - Editor loads in <500ms
   - No significant bundle size increase (<300KB)
   - Smooth typing experience

3. **User Experience**:
   - Intuitive formatting controls
   - Mobile-responsive
   - Accessibility compliant

## Timeline Estimate

### Week 1-2: Foundation
- Set up TipTap in both projects
- Create shared editor component
- Basic integration in StudyCreateModal

### Week 3-4: Backoffice Complete
- Full backoffice integration
- Rich text display components
- Testing and bug fixes

### Week 5-6: Frontend & Backend
- Backend API modifications
- ProfileEditPage integration
- Profile display updates

### Week 7-8: Polish & Deploy
- Data migration strategy
- Performance optimization
- Production deployment

## Next Steps

1. **Immediate Actions**:
   - Get stakeholder approval for HTML vs JSON format
   - Coordinate with backend team on API changes
   - Create proof-of-concept in StudyCreateModal

2. **Technical Decisions Needed**:
   - Content format (HTML vs JSON)
   - Character/size limits
   - Allowed formatting options
   - Image handling strategy

3. **Team Coordination**:
   - Backend team: API modifications
   - Design team: UI/UX for editor toolbar
   - QA team: Test plan creation
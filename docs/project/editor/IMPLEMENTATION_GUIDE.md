# TipTap Implementation Guide for AsyncSite

## Part 1: Backoffice Implementation

### 1.1 Install Dependencies

```bash
cd /Users/rene/asyncsite/study-platform-backoffice
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder @tiptap/extension-character-count @tiptap/extension-link dompurify
npm install --save-dev @types/dompurify
```

### 1.2 Create TipTap Editor Component

Create new file: `src/components/common/RichTextEditor.tsx`

```typescript
import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Link from '@tiptap/extension-link';
import styled from 'styled-components';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  maxLength?: number;
  minHeight?: string;
  disabled?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = '내용을 입력하세요...',
  maxLength = 5000,
  minHeight = '200px',
  disabled = false,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount.configure({
        limit: maxLength,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const characterCount = editor?.storage.characterCount.characters() || 0;
  const isMaxLength = characterCount >= maxLength;

  return (
    <EditorWrapper $minHeight={minHeight}>
      <Toolbar>
        <ToolbarGroup>
          <ToolbarButton
            type="button"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            $active={editor?.isActive('bold')}
            disabled={disabled}
          >
            <Bold>B</Bold>
          </ToolbarButton>
          <ToolbarButton
            type="button"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            $active={editor?.isActive('italic')}
            disabled={disabled}
          >
            <Italic>I</Italic>
          </ToolbarButton>
          <ToolbarButton
            type="button"
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            $active={editor?.isActive('strike')}
            disabled={disabled}
          >
            <Strike>S</Strike>
          </ToolbarButton>
        </ToolbarGroup>

        <ToolbarDivider />

        <ToolbarGroup>
          <ToolbarButton
            type="button"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            $active={editor?.isActive('heading', { level: 2 })}
            disabled={disabled}
          >
            H2
          </ToolbarButton>
          <ToolbarButton
            type="button"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
            $active={editor?.isActive('heading', { level: 3 })}
            disabled={disabled}
          >
            H3
          </ToolbarButton>
        </ToolbarGroup>

        <ToolbarDivider />

        <ToolbarGroup>
          <ToolbarButton
            type="button"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            $active={editor?.isActive('bulletList')}
            disabled={disabled}
          >
            • 목록
          </ToolbarButton>
          <ToolbarButton
            type="button"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            $active={editor?.isActive('orderedList')}
            disabled={disabled}
          >
            1. 목록
          </ToolbarButton>
        </ToolbarGroup>
      </Toolbar>

      <EditorContentWrapper>
        <StyledEditorContent editor={editor} />
      </EditorContentWrapper>

      <EditorFooter>
        <CharacterCountWrapper $isMax={isMaxLength}>
          {characterCount}/{maxLength}
        </CharacterCountWrapper>
      </EditorFooter>
    </EditorWrapper>
  );
};

// Styled Components
const EditorWrapper = styled.div<{ $minHeight: string }>`
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 8px;
  overflow: hidden;
  transition: ${({ theme }) => theme.transitions.fast};
  
  &:focus-within {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
`;

const Toolbar = styled.div`
  display: flex;
  gap: 8px;
  padding: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
  background: ${({ theme }) => theme.colors.gray[50]};
`;

const ToolbarGroup = styled.div`
  display: flex;
  gap: 4px;
`;

const ToolbarDivider = styled.div`
  width: 1px;
  background: ${({ theme }) => theme.colors.gray[300]};
  margin: 0 4px;
`;

const ToolbarButton = styled.button<{ $active?: boolean }>`
  padding: 6px 10px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : 'transparent'};
  color: ${({ $active, theme }) =>
    $active ? 'white' : theme.colors.text.primary};
  font-size: 14px;
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};
  
  &:hover:not(:disabled) {
    background: ${({ $active, theme }) =>
      $active ? theme.colors.primary : theme.colors.gray[100]};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Bold = styled.span`
  font-weight: bold;
`;

const Italic = styled.span`
  font-style: italic;
`;

const Strike = styled.span`
  text-decoration: line-through;
`;

const EditorContentWrapper = styled.div`
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
`;

const StyledEditorContent = styled(EditorContent)`
  padding: 12px 16px;
  
  .ProseMirror {
    min-height: 180px;
    outline: none;
    
    p {
      margin: 0 0 1em 0;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
    
    h2 {
      font-size: 1.5em;
      font-weight: bold;
      margin: 1em 0 0.5em 0;
    }
    
    h3 {
      font-size: 1.2em;
      font-weight: bold;
      margin: 1em 0 0.5em 0;
    }
    
    ul, ol {
      padding-left: 24px;
      margin: 0.5em 0;
    }
    
    li {
      margin: 0.25em 0;
    }
    
    p.is-editor-empty:first-child::before {
      content: attr(data-placeholder);
      color: ${({ theme }) => theme.colors.gray[400]};
      pointer-events: none;
      float: left;
      height: 0;
    }
  }
`;

const EditorFooter = styled.div`
  padding: 8px 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.gray[200]};
  background: ${({ theme }) => theme.colors.gray[50]};
  display: flex;
  justify-content: flex-end;
`;

const CharacterCountWrapper = styled.span<{ $isMax: boolean }>`
  font-size: 12px;
  color: ${({ $isMax, theme }) =>
    $isMax ? theme.colors.error : theme.colors.gray[500]};
`;

export default RichTextEditor;
```

### 1.3 Update StudyCreateModal.tsx

Modify the existing `StudyCreateModal.tsx` to use TipTap:

```typescript
import React, { useState } from 'react';
import styled from 'styled-components';
import Button, { ButtonVariant, ButtonSize } from '../common/Button';
import RichTextEditor from '../common/RichTextEditor'; // NEW
import type { StudyCreateRequest } from '../../types/api';

interface StudyCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: StudyCreateRequest) => Promise<void>;
  currentUserId: string;
}

const StudyCreateModal: React.FC<StudyCreateModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  currentUserId,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(''); // Still string, but now HTML
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Strip HTML tags for validation
    const plainTextDescription = description.replace(/<[^>]*>/g, '').trim();
    
    if (!title.trim() || !plainTextDescription) {
      setError('제목과 설명을 모두 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      await onCreate({
        title: title.trim(),
        description: description, // Send HTML content
        proposerId: currentUserId,
      });
      
      // Reset form and close modal
      setTitle('');
      setDescription('');
      onClose();
    } catch (err) {
      setError('스터디 생성에 실패했습니다. 다시 시도해주세요.');
      console.error('Failed to create study:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>새 스터디 추가</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="title">스터디 제목</Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 알고리즘 스터디"
              maxLength={100}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="description">스터디 설명</Label>
            {/* REPLACED Textarea with RichTextEditor */}
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="스터디에 대한 상세한 설명을 입력하세요"
              maxLength={5000} // Increased from 500
              disabled={loading}
            />
          </FormGroup>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <ButtonGroup>
            <Button
              type="button"
              variant={ButtonVariant.SECONDARY}
              size={ButtonSize.MEDIUM}
              onClick={onClose}
              disabled={loading}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant={ButtonVariant.PRIMARY}
              size={ButtonSize.MEDIUM}
              disabled={loading}
            >
              {loading ? '생성 중...' : '생성'}
            </Button>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
};

// ... (rest of styled components remain the same)

export default StudyCreateModal;
```

### 1.4 Create Rich Text Display Component

Create new file: `src/components/common/RichTextDisplay.tsx`

```typescript
import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import DOMPurify from 'dompurify';

interface RichTextDisplayProps {
  content: string;
  maxHeight?: string;
}

const RichTextDisplay: React.FC<RichTextDisplayProps> = ({ 
  content, 
  maxHeight 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Sanitize HTML to prevent XSS
      const sanitizedContent = DOMPurify.sanitize(content, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'h2', 'h3', 'ul', 'ol', 'li', 'a'],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
      });
      
      containerRef.current.innerHTML = sanitizedContent;
    }
  }, [content]);

  return (
    <DisplayContainer 
      ref={containerRef} 
      $maxHeight={maxHeight}
    />
  );
};

const DisplayContainer = styled.div<{ $maxHeight?: string }>`
  max-height: ${({ $maxHeight }) => $maxHeight || 'none'};
  overflow-y: ${({ $maxHeight }) => $maxHeight ? 'auto' : 'visible'};
  line-height: 1.6;
  
  p {
    margin: 0 0 1em 0;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  h2 {
    font-size: 1.5em;
    font-weight: bold;
    margin: 1em 0 0.5em 0;
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  h3 {
    font-size: 1.2em;
    font-weight: bold;
    margin: 1em 0 0.5em 0;
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  ul, ol {
    padding-left: 24px;
    margin: 0.5em 0;
  }
  
  li {
    margin: 0.25em 0;
  }
  
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: underline;
    
    &:hover {
      text-decoration: none;
    }
  }
  
  strong {
    font-weight: bold;
  }
  
  em {
    font-style: italic;
  }
  
  s {
    text-decoration: line-through;
  }
`;

export default RichTextDisplay;
```

### 1.5 Update StudyDetailModal.tsx

Update the description display in `StudyDetailModal.tsx`:

```typescript
// Add import at the top
import RichTextDisplay from '../common/RichTextDisplay';

// ... existing code ...

// Replace line 184
// OLD: <Description>{study.description}</Description>
// NEW:
<Description>
  <RichTextDisplay content={study.description} maxHeight="300px" />
</Description>
```

## Part 2: Web Frontend Implementation

### 2.1 Install Dependencies

```bash
cd /Users/rene/asyncsite/web
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder @tiptap/extension-character-count @tiptap/extension-link dompurify
npm install --save-dev @types/dompurify
```

### 2.2 Update Type Definitions

Update `src/types/auth.ts`:

```typescript
// Add bio field to User interface
export interface User {
  id: string;
  email: string;
  username: string;
  name?: string;
  bio?: string;  // NEW
  profileImage?: string;
  roles: string[];
  isActive: boolean;
  systemRole?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Add bio to UpdateProfileRequest
export interface UpdateProfileRequest {
  name?: string;
  bio?: string;  // NEW
  profileImage?: string;
}
```

### 2.3 Create TipTap Editor Component for Web

Create new file: `src/components/common/RichTextEditor.tsx`

```typescript
import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Link from '@tiptap/extension-link';
import './RichTextEditor.css';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
}

function RichTextEditor({
  value,
  onChange,
  placeholder = 'Tell us about yourself...',
  maxLength = 2000,
  disabled = false,
}: RichTextEditorProps): React.ReactNode {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // Disable headings for bio
      }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount.configure({
        limit: maxLength,
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const characterCount = editor?.storage.characterCount.characters() || 0;

  return (
    <div className="rich-text-editor">
      <div className="editor-toolbar">
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={editor?.isActive('bold') ? 'active' : ''}
          disabled={disabled}
        >
          Bold
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={editor?.isActive('italic') ? 'active' : ''}
          disabled={disabled}
        >
          Italic
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={editor?.isActive('bulletList') ? 'active' : ''}
          disabled={disabled}
        >
          List
        </button>
      </div>
      
      <EditorContent editor={editor} className="editor-content" />
      
      <div className="editor-footer">
        <span className={`character-count ${characterCount >= maxLength ? 'max' : ''}`}>
          {characterCount}/{maxLength}
        </span>
      </div>
    </div>
  );
}

export default RichTextEditor;
```

### 2.4 Update ProfileEditPage.tsx

Add bio field to `src/pages/user/ProfileEditPage.tsx`:

```typescript
import RichTextEditor from '../../components/common/RichTextEditor'; // NEW

interface ProfileFormData {
  name: string;
  bio: string;  // NEW
  profileImage: string;
  // ... notification settings
}

function ProfileEditPage(): React.ReactNode {
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    bio: '',  // NEW
    profileImage: '',
    // ... notification settings
  });

  useEffect(() => {
    if (user) {
      let formdata = {
        name: user.name || '',
        bio: user.bio || '',  // NEW
        profileImage: user.profileImage || '',
        // ... notification settings
      };
      // ... rest of effect
    }
  }, [user]);

  const handleBioChange = (html: string) => {  // NEW
    setFormData(prev => ({ ...prev, bio: html }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      await updateProfile({
        name: formData.name,
        bio: formData.bio,  // NEW
        profileImage: formData.profileImage || undefined
      });
      
      // ... rest of submit logic
    } catch (error) {
      // ... error handling
    }
  };

  return (
    <div className="profile-edit-page auth-page">
      {/* ... existing header and background ... */}
      
      <div className="profile-edit-container auth-container auth-fade-in">
        {/* ... existing form fields ... */}
        
        <form onSubmit={handleSubmit} className="profile-edit-form">
          {/* ... existing name field ... */}
          
          {/* NEW: Bio field */}
          <div className="form-group auth-form-group">
            <label htmlFor="bio" className="auth-label">
              자기소개
            </label>
            <RichTextEditor
              value={formData.bio}
              onChange={handleBioChange}
              placeholder="자신을 소개해주세요..."
              maxLength={2000}
              disabled={isSubmitting}
            />
          </div>
          
          {/* ... existing profileImage field ... */}
          {/* ... rest of form ... */}
        </form>
      </div>
    </div>
  );
}
```

## Part 3: Backend API Updates Required

### 3.1 User Entity Update (Backend)

```java
// User.java
@Entity
public class User {
    // ... existing fields
    
    @Column(columnDefinition = "TEXT")
    private String bio;  // NEW
    
    // getter/setter
}
```

### 3.2 DTO Updates (Backend)

```java
// UpdateProfileRequest.java
public class UpdateProfileRequest {
    private String name;
    private String bio;  // NEW
    private String profileImage;
    // ... getters/setters
}
```

### 3.3 Study Description Handling (Backend)

```java
// StudyService.java
public Study createStudy(StudyCreateRequest request) {
    // Sanitize HTML content
    String sanitizedDescription = sanitizeHtml(request.getDescription());
    
    // Validate length (HTML tags included)
    if (sanitizedDescription.length() > 10000) {
        throw new ValidationException("Description too long");
    }
    
    // ... create study
}

private String sanitizeHtml(String html) {
    // Use OWASP Java HTML Sanitizer or similar
    return PolicyFactory.sanitize(html);
}
```

## Testing Checklist

### Unit Tests
- [ ] RichTextEditor component renders correctly
- [ ] Editor handles content changes
- [ ] Character count works
- [ ] Toolbar buttons function properly
- [ ] HTML sanitization works

### Integration Tests
- [ ] Study creation with rich text
- [ ] Profile update with bio
- [ ] Data persistence
- [ ] Display of rich content

### E2E Tests
- [ ] Complete study creation flow
- [ ] Profile editing flow
- [ ] Cross-browser compatibility
- [ ] Mobile responsiveness

### Security Tests
- [ ] XSS prevention
- [ ] HTML injection prevention
- [ ] Content size limits enforced
- [ ] Malicious link handling

## Performance Considerations

1. **Bundle Size Optimization**:
   - Lazy load TipTap for non-critical pages
   - Use dynamic imports for editor component

2. **Runtime Performance**:
   - Debounce onChange events
   - Virtual scrolling for long content
   - Optimize re-renders with React.memo

3. **Network Optimization**:
   - Compress HTML content
   - Consider pagination for lists with rich content
   - Cache rendered content

## Rollback Plan

If issues arise:

1. **Feature Flag**: Use environment variable to toggle rich text
2. **Graceful Degradation**: Fall back to textarea if TipTap fails
3. **Data Compatibility**: Ensure plain text still works
4. **Quick Revert**: Keep old components until stable

```typescript
const EditorComponent = process.env.REACT_APP_USE_RICH_TEXT 
  ? RichTextEditor 
  : TextareaFallback;
```
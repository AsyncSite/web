# UI/UX Design Considerations for TipTap Integration

## Overview

This document addresses UI/UX considerations for integrating TipTap rich text editor across AsyncSite's two distinct user groups:
1. **General Users** (Web Frontend) - Profile management, content consumption
2. **Administrators** (Backoffice) - Study management, content moderation

## User Personas & Contexts

### General Users (Web Frontend)

#### Primary Persona: "Learning Enthusiast"
- **Age**: 20-35
- **Tech Savvy**: Medium to High
- **Goals**: Create compelling profile, join studies
- **Pain Points**: Limited self-expression in plain text
- **Device Usage**: 60% mobile, 40% desktop

#### Use Cases:
1. **Profile Bio Creation**
   - First-time setup during registration
   - Profile updates for job applications
   - Showcasing skills and interests

2. **Study Applications**
   - Writing motivation letters
   - Answering application questions
   - Describing relevant experience

### Administrators (Backoffice)

#### Primary Persona: "Study Coordinator"
- **Age**: 25-45
- **Tech Savvy**: High
- **Goals**: Efficiently manage studies, communicate clearly
- **Pain Points**: Formatting limitations, inconsistent content
- **Device Usage**: 95% desktop, 5% tablet

#### Use Cases:
1. **Study Creation**
   - Detailed curriculum descriptions
   - Prerequisites and requirements
   - Schedule and timeline formatting

2. **Content Moderation**
   - Review user submissions
   - Edit inappropriate content
   - Maintain quality standards

## Design Principles

### 1. Progressive Disclosure
**Show basic formatting first, advanced features on demand**

```typescript
// Basic toolbar for general users
const BasicToolbar = ['bold', 'italic', 'bulletList'];

// Extended toolbar for admins
const AdminToolbar = [
  ...BasicToolbar,
  'heading2', 'heading3', 'orderedList', 'link', 'blockquote'
];
```

### 2. Mobile-First Approach
**Optimize for touch interactions on mobile devices**

```css
/* Mobile toolbar optimization */
@media (max-width: 768px) {
  .editor-toolbar {
    position: sticky;
    bottom: 0;
    background: white;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  }
  
  .toolbar-button {
    min-width: 44px;
    min-height: 44px; /* Touch-friendly size */
  }
}
```

### 3. Contextual Help
**Provide inline guidance without overwhelming users**

```typescript
interface EditorHelpTips {
  firstTime: "Click here to format your text";
  markdown: "Tip: You can use **bold** and *italic* shortcuts";
  limit: "Keep it concise - readers prefer shorter descriptions";
}
```

## UI Components Design

### General User Interface (Web Frontend)

#### Profile Bio Editor
```
┌─────────────────────────────────────┐
│ 자기소개                            │
├─────────────────────────────────────┤
│ [B] [I] [List] [?Help]              │ <- Simplified toolbar
├─────────────────────────────────────┤
│                                     │
│ Tell us about yourself...           │ <- Large, friendly placeholder
│                                     │
│                                     │
├─────────────────────────────────────┤
│ 156/2000                 [AI Assist]│ <- Character count + AI helper
└─────────────────────────────────────┘
```

**Design Decisions:**
- Minimal toolbar with only essential formatting
- Large placeholder text for guidance
- Optional AI assistance for content suggestions
- Soft character limit with visual feedback

#### Mobile Bio Editor
```
┌─────────────────────┐
│ 자기소개            │
├─────────────────────┤
│                     │
│ Tell us about       │
│ yourself...         │
│                     │
├─────────────────────┤
│ 156/2000            │
├─────────────────────┤
│ [B] [I] [•] [?]     │ <- Bottom toolbar
└─────────────────────┘
```

### Administrator Interface (Backoffice)

#### Study Description Editor
```
┌──────────────────────────────────────────────┐
│ 스터디 설명 *                                │
├──────────────────────────────────────────────┤
│ [H2][H3] | [B][I][S] | [•][1.] | ["][🔗][📷] │ <- Full toolbar
├──────────────────────────────────────────────┤
│ ## 학습 목표                                  │
│                                              │
│ 이 스터디에서는 다음을 학습합니다:            │
│ • 알고리즘 기초                              │
│ • 자료구조 활용                              │
│                                              │
│ [Insert Template ▼]                          │ <- Template dropdown
├──────────────────────────────────────────────┤
│ 423/5000          [Preview] [Markdown] [HTML]│ <- Multiple view modes
└──────────────────────────────────────────────┘
```

**Design Decisions:**
- Comprehensive toolbar with formatting groups
- Template insertion for common structures
- Multiple view modes for power users
- Higher character limit for detailed content

## Interaction Patterns

### 1. Toolbar Interactions

#### Hover States
```css
.toolbar-button:hover {
  background: rgba(0, 123, 255, 0.1);
  transform: translateY(-1px);
}

.toolbar-button:hover::after {
  content: attr(data-tooltip);
  /* Tooltip showing keyboard shortcut */
}
```

#### Active States
```typescript
// Visual feedback for active formatting
const ToolbarButton = ({ active, ...props }) => (
  <button
    className={cx('toolbar-button', {
      'toolbar-button--active': active,
      'toolbar-button--pulse': justClicked, // Micro-animation
    })}
    {...props}
  />
);
```

### 2. Content Input Patterns

#### Smart Paste Handling
```typescript
const handlePaste = (event: ClipboardEvent) => {
  const text = event.clipboardData?.getData('text/plain');
  
  if (isURL(text)) {
    // Auto-convert to link
    return createLink(text);
  }
  
  if (isMarkdown(text)) {
    // Offer to convert markdown
    showMarkdownConversionDialog(text);
  }
  
  // Default paste behavior
};
```

#### Auto-Formatting
```typescript
// Auto-convert patterns
const autoFormatRules = {
  '**text**': 'bold',
  '*text*': 'italic',
  '- ': 'bulletList',
  '1. ': 'orderedList',
};
```

### 3. Mobile Gestures

```typescript
// Swipe to show/hide toolbar
const handleSwipe = (direction: 'up' | 'down') => {
  if (direction === 'up') {
    showToolbar();
  } else {
    hideToolbar();
  }
};

// Long press for formatting menu
const handleLongPress = (selection: Selection) => {
  showContextMenu(selection);
};
```

## Accessibility Considerations

### 1. Keyboard Navigation
```typescript
const keyboardShortcuts = {
  'Cmd+B': 'toggleBold',
  'Cmd+I': 'toggleItalic',
  'Cmd+Shift+7': 'toggleOrderedList',
  'Cmd+Shift+8': 'toggleBulletList',
  'Tab': 'indentList',
  'Shift+Tab': 'outdentList',
};
```

### 2. Screen Reader Support
```html
<div role="toolbar" aria-label="Text formatting">
  <button 
    aria-label="Bold" 
    aria-pressed="false"
    aria-keyshortcuts="Cmd+B"
  >
    B
  </button>
</div>

<div 
  role="textbox" 
  aria-multiline="true"
  aria-label="Study description"
  aria-describedby="char-count"
>
  <!-- Editor content -->
</div>
```

### 3. Focus Management
```typescript
// Maintain focus after formatting
const applyFormatting = (format: string) => {
  const selection = saveSelection();
  applyFormat(format);
  restoreSelection(selection);
  editor.focus();
};
```

## Visual Design Specifications

### Color Palette
```css
:root {
  /* Primary actions */
  --editor-primary: #2563eb;
  --editor-primary-hover: #1d4ed8;
  
  /* Toolbar */
  --toolbar-bg: #ffffff;
  --toolbar-border: #e5e7eb;
  --toolbar-button-hover: #f3f4f6;
  --toolbar-button-active: #dbeafe;
  
  /* Content */
  --editor-text: #111827;
  --editor-placeholder: #9ca3af;
  --editor-link: #2563eb;
  
  /* States */
  --editor-focus: #3b82f6;
  --editor-error: #ef4444;
  --editor-success: #10b981;
}
```

### Typography
```css
.editor-content {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 16px;
  line-height: 1.6;
}

.editor-content h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 24px 0 16px;
}

.editor-content h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 20px 0 12px;
}
```

### Spacing & Layout
```css
.editor-container {
  border-radius: 8px;
  overflow: hidden;
}

.editor-toolbar {
  padding: 8px;
  gap: 4px;
}

.editor-content {
  padding: 16px;
  min-height: 200px;
  max-height: 500px;
}

.editor-footer {
  padding: 8px 16px;
  border-top: 1px solid var(--toolbar-border);
}
```

## Responsive Behavior

### Breakpoint Strategy
```scss
// Breakpoints
$mobile: 320px;
$tablet: 768px;
$desktop: 1024px;
$wide: 1440px;

// Mobile (320px - 767px)
@media (max-width: #{$tablet - 1px}) {
  .editor-toolbar {
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .toolbar-button {
    flex-shrink: 0;
  }
}

// Tablet (768px - 1023px)
@media (min-width: #{$tablet}) and (max-width: #{$desktop - 1px}) {
  .editor-container {
    max-width: 720px;
  }
}

// Desktop (1024px+)
@media (min-width: #{$desktop}) {
  .editor-container {
    max-width: 800px;
  }
  
  .editor-toolbar {
    justify-content: flex-start;
  }
}
```

## Error States & Validation

### Inline Validation
```typescript
const ValidationFeedback = ({ content, maxLength }) => {
  const length = content.replace(/<[^>]*>/g, '').length;
  const percentage = (length / maxLength) * 100;
  
  return (
    <div className="validation-feedback">
      {percentage > 90 && (
        <Warning>글자 수 제한에 가까워지고 있습니다</Warning>
      )}
      {percentage >= 100 && (
        <Error>최대 글자 수를 초과했습니다</Error>
      )}
    </div>
  );
};
```

### Error Recovery
```typescript
// Auto-save draft
const autoSave = debounce((content: string) => {
  localStorage.setItem(`draft_${userId}`, content);
  showSaveIndicator();
}, 1000);

// Recover from crash
const recoverDraft = () => {
  const draft = localStorage.getItem(`draft_${userId}`);
  if (draft) {
    showRecoveryDialog(draft);
  }
};
```

## Performance Optimizations

### 1. Lazy Loading
```typescript
// Lazy load editor for non-critical pages
const RichTextEditor = lazy(() => import('./RichTextEditor'));

// Show skeleton while loading
<Suspense fallback={<EditorSkeleton />}>
  <RichTextEditor />
</Suspense>
```

### 2. Debounced Updates
```typescript
const debouncedOnChange = useMemo(
  () => debounce(onChange, 300),
  [onChange]
);
```

### 3. Virtual Scrolling for Long Content
```typescript
// For very long content, implement virtual scrolling
const VirtualEditor = ({ content, viewportHeight }) => {
  const [visibleRange, setVisibleRange] = useState([0, 10]);
  
  // Only render visible portions
  return (
    <VirtualScroller
      items={content.blocks}
      renderItem={renderBlock}
      visibleRange={visibleRange}
    />
  );
};
```

## User Education & Onboarding

### First-Time User Guide
```typescript
const OnboardingTour = () => {
  const steps = [
    {
      target: '.editor-toolbar',
      content: '여기서 텍스트 서식을 지정할 수 있습니다',
    },
    {
      target: '.toolbar-button-bold',
      content: '텍스트를 선택하고 B를 클릭하여 굵게 만드세요',
    },
    {
      target: '.character-count',
      content: '글자 수 제한을 확인하세요',
    },
  ];
  
  return <Tour steps={steps} />;
};
```

### Contextual Tips
```typescript
const ContextualTip = ({ context }) => {
  const tips = {
    empty: "멋진 자기소개를 작성해보세요!",
    typing: "Cmd+B로 굵은 글씨를 사용할 수 있어요",
    nearLimit: "간결하게 작성하는 것이 좋아요",
  };
  
  return <Tip>{tips[context]}</Tip>;
};
```

## A/B Testing Considerations

### Test Variants
1. **Toolbar Position**: Top vs. Bottom (mobile)
2. **Default Formatting**: Start with heading vs. plain text
3. **Placeholder Text**: Instructional vs. inspirational
4. **Character Limit Display**: Always visible vs. near limit only

### Metrics to Track
```typescript
const editorAnalytics = {
  // Engagement
  formattingUsed: boolean,
  toolbarClicks: number,
  averageSessionTime: number,
  
  // Completion
  profileCompletionRate: number,
  studyDescriptionLength: number,
  
  // Errors
  validationErrors: number,
  saveFfailures: number,
  
  // Performance
  loadTime: number,
  inputLatency: number,
};
```

## Platform-Specific Considerations

### iOS Safari
```css
/* Prevent zoom on input focus */
.editor-content {
  font-size: 16px; /* Prevents zoom on iOS */
}

/* Handle safe area */
.editor-toolbar-mobile {
  padding-bottom: env(safe-area-inset-bottom);
}
```

### Android Chrome
```typescript
// Handle virtual keyboard
const adjustForKeyboard = () => {
  const viewportHeight = window.visualViewport?.height || window.innerHeight;
  editor.style.maxHeight = `${viewportHeight * 0.5}px`;
};
```

## Future Enhancements

### Phase 2 Features
1. **Collaborative Editing**: Real-time collaboration for admin teams
2. **AI Writing Assistant**: Content suggestions and improvements
3. **Rich Media**: Image uploads, video embeds
4. **Templates Library**: Pre-designed content structures
5. **Version History**: Track changes and rollback

### Phase 3 Features
1. **Custom Blocks**: Callouts, code blocks, tables
2. **Markdown Import/Export**: For power users
3. **Accessibility Checker**: Ensure content meets WCAG standards
4. **SEO Optimization**: Meta description generation
5. **Multi-language Support**: RTL text, language-specific formatting
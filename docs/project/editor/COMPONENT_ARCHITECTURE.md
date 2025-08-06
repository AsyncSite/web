# TipTap Editor 컴포넌트 아키텍처

## Executive Summary

AsyncSite 플랫폼의 TipTap 에디터 통합을 위한 완전한 컴포넌트 아키텍처입니다. 재사용 가능하고 확장 가능한 컴포넌트 구조를 정의하며, 일반 사용자와 관리자 인터페이스를 모두 지원합니다.

## 1. 전체 아키텍처 개요

### 1.1 디렉토리 구조
```
src/
├── components/
│   ├── editor/
│   │   ├── core/                    # 핵심 에디터 컴포넌트
│   │   │   ├── TipTapEditor.tsx    # 메인 에디터
│   │   │   ├── TipTapViewer.tsx    # 읽기 전용 뷰어
│   │   │   └── EditorProvider.tsx   # 에디터 컨텍스트
│   │   ├── toolbar/                 # 툴바 컴포넌트
│   │   │   ├── Toolbar.tsx
│   │   │   ├── ToolbarButton.tsx
│   │   │   └── ToolbarGroups/
│   │   ├── extensions/              # TipTap 확장
│   │   │   ├── ImageUpload.ts
│   │   │   ├── AutoSave.ts
│   │   │   └── Collaboration.ts
│   │   ├── ui/                      # UI 컴포넌트
│   │   │   ├── BubbleMenu.tsx
│   │   │   ├── FloatingMenu.tsx
│   │   │   └── StatusBar.tsx
│   │   └── utils/                   # 유틸리티
│   │       ├── serializers.ts
│   │       ├── validators.ts
│   │       └── sanitizers.ts
│   ├── admin/
│   │   ├── ContentReview/           # 콘텐츠 검토
│   │   ├── BulkEditor/              # 일괄 편집
│   │   └── Analytics/               # 분석
│   └── common/
│       ├── Modal/
│       ├── Toast/
│       └── Loading/
├── hooks/
│   ├── editor/
│   │   ├── useEditor.ts
│   │   ├── useAutoSave.ts
│   │   └── useCollaboration.ts
│   └── admin/
│       ├── useContentModeration.ts
│       └── useAnalytics.ts
├── contexts/
│   ├── EditorContext.tsx
│   └── AdminContext.tsx
├── services/
│   ├── editorService.ts
│   ├── uploadService.ts
│   └── moderationService.ts
└── styles/
    ├── editor/
    │   ├── editor.scss
    │   ├── toolbar.scss
    │   └── themes/
    └── admin/
        └── admin.scss
```

## 2. 핵심 컴포넌트 상세 설계

### 2.1 메인 에디터 컴포넌트

```typescript
// components/editor/core/TipTapEditor.tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Collaboration from '@tiptap/extension-collaboration';
import * as Y from 'yjs';

interface TipTapEditorProps {
  initialContent?: any;
  onChange?: (content: any) => void;
  onSave?: (content: any) => Promise<void>;
  mode?: 'basic' | 'advanced' | 'admin';
  readOnly?: boolean;
  placeholder?: string;
  maxLength?: number;
  collaboration?: {
    enabled: boolean;
    room: string;
    user: { id: string; name: string; color: string };
  };
  autoSave?: {
    enabled: boolean;
    interval: number;
    onAutoSave?: (content: any) => Promise<void>;
  };
}

export const TipTapEditor: React.FC<TipTapEditorProps> = ({
  initialContent,
  onChange,
  onSave,
  mode = 'basic',
  readOnly = false,
  placeholder = '내용을 입력하세요...',
  maxLength,
  collaboration,
  autoSave
}) => {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [characterCount, setCharacterCount] = useState(0);
  const ydoc = useMemo(() => new Y.Doc(), []);
  
  // 에디터 인스턴스 생성
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: !collaboration?.enabled, // 협업 모드에서는 히스토리 비활성화
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      ...(mode === 'advanced' ? [
        Table.configure({
          resizable: true,
        }),
        TableRow,
        TableHeader,
        TableCell,
      ] : []),
      ...(collaboration?.enabled ? [
        Collaboration.configure({
          document: ydoc,
          field: 'content',
        }),
      ] : []),
      // 커스텀 확장
      AutoSaveExtension.configure({
        enabled: autoSave?.enabled,
        interval: autoSave?.interval,
        onSave: autoSave?.onAutoSave,
      }),
      CharacterCountExtension.configure({
        limit: maxLength,
      }),
    ],
    content: initialContent,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      onChange?.(json);
      setCharacterCount(editor.storage.characterCount.characters());
    },
  });
  
  // 자동 저장 처리
  useAutoSave({
    editor,
    enabled: autoSave?.enabled,
    interval: autoSave?.interval,
    onSave: async (content) => {
      setSaveStatus('saving');
      try {
        await autoSave?.onAutoSave?.(content);
        setSaveStatus('saved');
      } catch (error) {
        setSaveStatus('error');
        console.error('Auto-save failed:', error);
      }
    },
  });
  
  // 협업 설정
  useCollaboration({
    editor,
    enabled: collaboration?.enabled,
    room: collaboration?.room,
    user: collaboration?.user,
  });
  
  if (!editor) {
    return <EditorSkeleton />;
  }
  
  return (
    <div className={`tiptap-editor tiptap-editor--${mode}`}>
      <EditorToolbar 
        editor={editor} 
        mode={mode}
        onSave={onSave}
      />
      
      <div className="editor-content-wrapper">
        <EditorContent 
          editor={editor} 
          className="editor-content"
        />
        
        {collaboration?.enabled && (
          <CollaborationCursors editor={editor} />
        )}
      </div>
      
      <EditorStatusBar>
        <CharacterCounter
          current={characterCount}
          max={maxLength}
        />
        <SaveIndicator status={saveStatus} />
        {collaboration?.enabled && (
          <CollaboratorsList editor={editor} />
        )}
      </EditorStatusBar>
    </div>
  );
};
```

### 2.2 툴바 컴포넌트

```typescript
// components/editor/toolbar/Toolbar.tsx
import { Editor } from '@tiptap/core';
import { 
  Bold, Italic, Underline, Strikethrough,
  ListBullet, ListNumbers, ListChecks,
  Heading1, Heading2, Heading3,
  Quote, Code, Link, Image, Table,
  Undo, Redo, FormatClear
} from '@/components/icons';

interface EditorToolbarProps {
  editor: Editor;
  mode: 'basic' | 'advanced' | 'admin';
  onSave?: (content: any) => Promise<void>;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  editor,
  mode,
  onSave
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // 모드별 툴바 구성
  const toolbarConfig = useMemo(() => {
    const basic = {
      formatting: ['bold', 'italic', 'underline'],
      paragraph: ['bulletList', 'orderedList'],
      insert: ['link', 'image'],
      actions: ['undo', 'redo']
    };
    
    const advanced = {
      ...basic,
      formatting: [...basic.formatting, 'strike', 'code'],
      paragraph: [...basic.paragraph, 'taskList', 'blockquote'],
      heading: ['h1', 'h2', 'h3'],
      insert: [...basic.insert, 'table', 'horizontalRule'],
      actions: [...basic.actions, 'clearFormat', 'fullscreen']
    };
    
    const admin = {
      ...advanced,
      moderation: ['highlight', 'comment', 'suggest']
    };
    
    return mode === 'admin' ? admin : mode === 'advanced' ? advanced : basic;
  }, [mode]);
  
  // 모바일 툴바
  if (isMobile) {
    return <MobileToolbar editor={editor} config={toolbarConfig} />;
  }
  
  return (
    <div className="editor-toolbar">
      {/* 포맷팅 그룹 */}
      <ToolbarGroup>
        {toolbarConfig.formatting.includes('bold') && (
          <ToolbarButton
            icon={<Bold />}
            isActive={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
            tooltip="굵게 (Ctrl+B)"
          />
        )}
        {toolbarConfig.formatting.includes('italic') && (
          <ToolbarButton
            icon={<Italic />}
            isActive={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            tooltip="기울임 (Ctrl+I)"
          />
        )}
        {toolbarConfig.formatting.includes('underline') && (
          <ToolbarButton
            icon={<Underline />}
            isActive={editor.isActive('underline')}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            tooltip="밑줄 (Ctrl+U)"
          />
        )}
      </ToolbarGroup>
      
      <ToolbarDivider />
      
      {/* 제목 그룹 */}
      {toolbarConfig.heading && (
        <>
          <ToolbarGroup>
            <HeadingDropdown editor={editor} levels={toolbarConfig.heading} />
          </ToolbarGroup>
          <ToolbarDivider />
        </>
      )}
      
      {/* 리스트 그룹 */}
      <ToolbarGroup>
        {toolbarConfig.paragraph.includes('bulletList') && (
          <ToolbarButton
            icon={<ListBullet />}
            isActive={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            tooltip="글머리 기호"
          />
        )}
        {toolbarConfig.paragraph.includes('orderedList') && (
          <ToolbarButton
            icon={<ListNumbers />}
            isActive={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            tooltip="번호 매기기"
          />
        )}
        {toolbarConfig.paragraph.includes('taskList') && (
          <ToolbarButton
            icon={<ListChecks />}
            isActive={editor.isActive('taskList')}
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            tooltip="체크리스트"
          />
        )}
      </ToolbarGroup>
      
      <ToolbarDivider />
      
      {/* 삽입 그룹 */}
      <ToolbarGroup>
        {toolbarConfig.insert.includes('link') && (
          <LinkButton editor={editor} />
        )}
        {toolbarConfig.insert.includes('image') && (
          <ImageButton editor={editor} />
        )}
        {toolbarConfig.insert.includes('table') && (
          <TableButton editor={editor} />
        )}
      </ToolbarGroup>
      
      <ToolbarDivider />
      
      {/* 액션 그룹 */}
      <ToolbarGroup>
        <ToolbarButton
          icon={<Undo />}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          tooltip="실행 취소 (Ctrl+Z)"
        />
        <ToolbarButton
          icon={<Redo />}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          tooltip="다시 실행 (Ctrl+Shift+Z)"
        />
      </ToolbarGroup>
      
      {/* 저장 버튼 */}
      {onSave && (
        <div className="toolbar-end">
          <SaveButton onClick={() => onSave(editor.getJSON())} />
        </div>
      )}
    </div>
  );
};
```

### 2.3 이미지 업로드 컴포넌트

```typescript
// components/editor/extensions/ImageUpload.tsx
import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

interface ImageUploadProps {
  editor: Editor;
}

const ImageButton: React.FC<ImageUploadProps> = ({ editor }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setUploading(true);
    
    try {
      for (const file of Array.from(files)) {
        // 클라이언트 사이드 검증
        if (!validateImage(file)) {
          throw new Error(`${file.name}은(는) 유효하지 않은 이미지입니다.`);
        }
        
        // 이미지 압축
        const compressed = await compressImage(file, {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.8
        });
        
        // 임시 URL 생성 (즉시 미리보기)
        const tempUrl = URL.createObjectURL(compressed);
        
        // 에디터에 임시 이미지 삽입
        editor
          .chain()
          .focus()
          .setImage({ 
            src: tempUrl, 
            alt: file.name,
            'data-uploading': 'true' 
          })
          .run();
        
        // 백그라운드 업로드
        const uploadedUrl = await uploadImage(compressed, {
          onProgress: (progress) => setUploadProgress(progress)
        });
        
        // 임시 URL을 실제 URL로 교체
        replaceImageUrl(editor, tempUrl, uploadedUrl);
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      showToast({
        type: 'error',
        message: '이미지 업로드에 실패했습니다.'
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  return (
    <>
      <ToolbarButton
        icon={<ImageIcon />}
        onClick={() => fileInputRef.current?.click()}
        tooltip="이미지 삽입"
        disabled={uploading}
      />
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageSelect}
        style={{ display: 'none' }}
      />
      
      {uploading && (
        <UploadProgressBar progress={uploadProgress} />
      )}
    </>
  );
};

// 이미지 압축 함수
async function compressImage(
  file: File,
  options: CompressOptions
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
      // 비율 유지하며 리사이징
      const { width, height } = calculateDimensions(
        img.width,
        img.height,
        options.maxWidth,
        options.maxHeight
      );
      
      canvas.width = width;
      canvas.height = height;
      
      // 이미지 그리기
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Blob으로 변환
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Image compression failed'));
          }
        },
        'image/jpeg',
        options.quality
      );
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// 이미지 업로드 서비스
async function uploadImage(
  file: Blob,
  options: UploadOptions
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/upload/image', {
    method: 'POST',
    body: formData,
    onUploadProgress: (event) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100;
        options.onProgress?.(progress);
      }
    }
  });
  
  if (!response.ok) {
    throw new Error('Upload failed');
  }
  
  const data = await response.json();
  return data.url;
}
```

### 2.4 자동 저장 훅

```typescript
// hooks/editor/useAutoSave.ts
import { Editor } from '@tiptap/core';
import { useDebouncedCallback } from 'use-debounce';

interface UseAutoSaveOptions {
  editor: Editor | null;
  enabled?: boolean;
  interval?: number;
  onSave?: (content: any) => Promise<void>;
  onError?: (error: Error) => void;
}

export const useAutoSave = ({
  editor,
  enabled = true,
  interval = 30000, // 30초
  onSave,
  onError
}: UseAutoSaveOptions) => {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const contentRef = useRef<any>(null);
  
  // 디바운스된 저장 함수
  const debouncedSave = useDebouncedCallback(
    async (content: any) => {
      if (!enabled || !onSave) return;
      
      // 내용이 변경되지 않았으면 저장하지 않음
      if (JSON.stringify(content) === JSON.stringify(contentRef.current)) {
        return;
      }
      
      setStatus('saving');
      
      try {
        await onSave(content);
        contentRef.current = content;
        setLastSaved(new Date());
        setStatus('saved');
        
        // 3초 후 아이들 상태로
        setTimeout(() => setStatus('idle'), 3000);
      } catch (error) {
        setStatus('error');
        onError?.(error as Error);
        
        // 로컬 스토리지에 백업
        try {
          localStorage.setItem(
            'editor-backup',
            JSON.stringify({
              content,
              timestamp: Date.now()
            })
          );
        } catch {}
      }
    },
    interval
  );
  
  // 에디터 변경 감지
  useEffect(() => {
    if (!editor || !enabled) return;
    
    const handleUpdate = () => {
      const content = editor.getJSON();
      setStatus('typing');
      debouncedSave(content);
    };
    
    editor.on('update', handleUpdate);
    
    return () => {
      editor.off('update', handleUpdate);
    };
  }, [editor, enabled, debouncedSave]);
  
  // 페이지 언로드 시 저장
  useEffect(() => {
    if (!enabled || !onSave) return;
    
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const content = editor?.getJSON();
      
      if (content && JSON.stringify(content) !== JSON.stringify(contentRef.current)) {
        // 동기적으로 저장 시도
        navigator.sendBeacon(
          '/api/editor/save',
          JSON.stringify({ content })
        );
        
        // 사용자에게 경고
        e.preventDefault();
        e.returnValue = '저장되지 않은 변경사항이 있습니다.';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [editor, enabled, onSave]);
  
  // 수동 저장 함수
  const save = useCallback(async () => {
    if (!editor || !onSave) return;
    
    const content = editor.getJSON();
    await debouncedSave.flush();
  }, [editor, onSave, debouncedSave]);
  
  // 복구 함수
  const recover = useCallback(() => {
    try {
      const backup = localStorage.getItem('editor-backup');
      if (backup) {
        const { content, timestamp } = JSON.parse(backup);
        
        // 24시간 이내 백업만 복구
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          editor?.commands.setContent(content);
          return true;
        }
      }
    } catch {}
    return false;
  }, [editor]);
  
  return {
    status,
    lastSaved,
    save,
    recover
  };
};
```

## 3. 관리자 전용 컴포넌트

### 3.1 콘텐츠 검토 컴포넌트

```typescript
// components/admin/ContentReview/ContentReviewPanel.tsx
interface ContentReviewPanelProps {
  contentId: string;
  onDecision: (decision: ReviewDecision) => Promise<void>;
}

export const ContentReviewPanel: React.FC<ContentReviewPanelProps> = ({
  contentId,
  onDecision
}) => {
  const { content, author, history } = useContentDetails(contentId);
  const { analysis } = useAIAnalysis(content);
  const [decision, setDecision] = useState<ReviewDecision | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  
  return (
    <div className="content-review-panel">
      <SplitPane split="vertical" sizes={[60, 40]}>
        {/* 왼쪽: 콘텐츠 뷰어 */}
        <ContentViewerPane>
          <ViewerToolbar>
            <ToggleHighlights />
            <ToggleComments />
            <ToggleDiff />
            <ZoomControls />
          </ViewerToolbar>
          
          <TipTapViewer
            content={content}
            highlights={analysis.issues}
            comments={comments}
            readOnly
          />
          
          {analysis.issues.length > 0 && (
            <IssueOverlay issues={analysis.issues} />
          )}
        </ContentViewerPane>
        
        {/* 오른쪽: 정보 및 액션 */}
        <InfoActionPane>
          <Card title="AI 분석 결과">
            <AIScore score={analysis.score} />
            <IssueList issues={analysis.issues} />
            <SuggestedActions actions={analysis.suggestedActions} />
          </Card>
          
          <Card title="작성자 정보">
            <AuthorProfile author={author} />
            <AuthorHistory history={history} />
            <TrustScore score={author.trustScore} />
          </Card>
          
          <Card title="검토 체크리스트">
            <ReviewChecklist
              items={[
                { id: 'spam', label: '스팸/광고 없음', checked: !analysis.hasSpam },
                { id: 'offensive', label: '부적절한 내용 없음', checked: !analysis.hasOffensive },
                { id: 'original', label: '독창적 콘텐츠', checked: analysis.isOriginal },
                { id: 'quality', label: '품질 기준 충족', checked: analysis.meetsQuality }
              ]}
            />
          </Card>
          
          <Card title="검토 결정">
            <CommentInput
              value={decision?.comment}
              onChange={(comment) => setDecision({ ...decision, comment })}
              placeholder="검토 의견 (선택사항)"
            />
            
            <DecisionButtons>
              <ApproveButton
                onClick={() => handleDecision('approve')}
                shortcuts="A"
              />
              <RequestEditButton
                onClick={() => handleDecision('request_edit')}
                shortcuts="E"
              />
              <RejectButton
                onClick={() => handleDecision('reject')}
                shortcuts="R"
              />
            </DecisionButtons>
            
            {decision?.type === 'request_edit' && (
              <EditRequestForm
                onSubmit={(requests) => setDecision({
                  ...decision,
                  editRequests: requests
                })}
              />
            )}
            
            {decision?.type === 'reject' && (
              <RejectReasonForm
                onSubmit={(reason) => setDecision({
                  ...decision,
                  rejectReason: reason
                })}
              />
            )}
          </Card>
        </InfoActionPane>
      </SplitPane>
    </div>
  );
};
```

### 3.2 일괄 편집 컴포넌트

```typescript
// components/admin/BulkEditor/BulkEditor.tsx
export const BulkEditor: React.FC = () => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<BulkAction | null>(null);
  const [filters, setFilters] = useState<ContentFilters>({});
  
  const { contents, loading, refetch } = useContents(filters);
  
  return (
    <div className="bulk-editor">
      <BulkEditorHeader>
        <SelectionInfo count={selectedItems.length} />
        <BulkActions>
          <BulkEditButton
            disabled={selectedItems.length === 0}
            onClick={() => setBulkAction('edit')}
          />
          <BulkApproveButton
            disabled={selectedItems.length === 0}
            onClick={() => setBulkAction('approve')}
          />
          <BulkDeleteButton
            disabled={selectedItems.length === 0}
            onClick={() => setBulkAction('delete')}
          />
        </BulkActions>
      </BulkEditorHeader>
      
      <ContentFilters
        filters={filters}
        onChange={setFilters}
      />
      
      <ContentTable
        contents={contents}
        selectedItems={selectedItems}
        onSelectionChange={setSelectedItems}
        loading={loading}
      />
      
      {bulkAction && (
        <BulkActionModal
          action={bulkAction}
          items={selectedItems}
          onConfirm={handleBulkAction}
          onCancel={() => setBulkAction(null)}
        />
      )}
    </div>
  );
};
```

## 4. 공통 유틸리티 컴포넌트

### 4.1 에러 바운더리

```typescript
// components/common/ErrorBoundary.tsx
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class EditorErrorBoundary extends Component<
  { children: ReactNode; fallback?: ComponentType<any> },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 에러 로깅
    console.error('Editor error:', error, errorInfo);
    
    // Sentry로 에러 전송
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack
          }
        }
      });
    }
  }
  
  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} />;
    }
    
    return this.props.children;
  }
}
```

### 4.2 로딩 스켈레톤

```typescript
// components/common/Loading/EditorSkeleton.tsx
export const EditorSkeleton: React.FC = () => {
  return (
    <div className="editor-skeleton">
      <div className="skeleton-toolbar">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton-button" />
        ))}
      </div>
      
      <div className="skeleton-content">
        <div className="skeleton-line" style={{ width: '80%' }} />
        <div className="skeleton-line" style={{ width: '60%' }} />
        <div className="skeleton-line" style={{ width: '70%' }} />
        <div className="skeleton-line" style={{ width: '90%' }} />
      </div>
      
      <div className="skeleton-footer">
        <div className="skeleton-text" style={{ width: '100px' }} />
        <div className="skeleton-text" style={{ width: '80px' }} />
      </div>
    </div>
  );
};
```

## 5. 서비스 레이어

### 5.1 에디터 서비스

```typescript
// services/editorService.ts
class EditorService {
  private baseUrl = '/api/editor';
  
  async saveContent(content: any): Promise<SaveResult> {
    const response = await fetch(`${this.baseUrl}/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save content');
    }
    
    return response.json();
  }
  
  async loadContent(id: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/content/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to load content');
    }
    
    return response.json();
  }
  
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload image');
    }
    
    const data = await response.json();
    return data.url;
  }
  
  async validateContent(content: any): Promise<ValidationResult> {
    const response = await fetch(`${this.baseUrl}/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });
    
    return response.json();
  }
}

export const editorService = new EditorService();
```

## 6. 테스트 전략

### 6.1 단위 테스트

```typescript
// __tests__/components/editor/TipTapEditor.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TipTapEditor } from '@/components/editor/core/TipTapEditor';

describe('TipTapEditor', () => {
  it('should render editor with initial content', () => {
    const initialContent = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Hello World'
            }
          ]
        }
      ]
    };
    
    render(<TipTapEditor initialContent={initialContent} />);
    
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
  
  it('should call onChange when content changes', async () => {
    const onChange = jest.fn();
    
    render(<TipTapEditor onChange={onChange} />);
    
    const editor = screen.getByRole('textbox');
    await userEvent.type(editor, 'Test content');
    
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
  });
  
  it('should auto-save content', async () => {
    const onAutoSave = jest.fn();
    
    render(
      <TipTapEditor
        autoSave={{
          enabled: true,
          interval: 100,
          onAutoSave
        }}
      />
    );
    
    const editor = screen.getByRole('textbox');
    await userEvent.type(editor, 'Auto save test');
    
    await waitFor(() => {
      expect(onAutoSave).toHaveBeenCalled();
    }, { timeout: 200 });
  });
});
```

### 6.2 통합 테스트

```typescript
// __tests__/integration/editor-flow.test.tsx
describe('Editor Integration Flow', () => {
  it('should complete full editing flow', async () => {
    const { container } = render(<ProfileEditPage />);
    
    // 1. 에디터 로드 확인
    await waitFor(() => {
      expect(screen.getByRole('toolbar')).toBeInTheDocument();
    });
    
    // 2. 콘텐츠 입력
    const editor = screen.getByRole('textbox');
    await userEvent.type(editor, '안녕하세요, 테스트입니다.');
    
    // 3. 포맷팅 적용
    const boldButton = screen.getByLabelText('굵게');
    await userEvent.click(boldButton);
    
    // 4. 이미지 업로드
    const imageButton = screen.getByLabelText('이미지 삽입');
    await userEvent.click(imageButton);
    
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const input = container.querySelector('input[type="file"]');
    await userEvent.upload(input, file);
    
    // 5. 저장
    const saveButton = screen.getByText('저장');
    await userEvent.click(saveButton);
    
    // 6. 성공 메시지 확인
    await waitFor(() => {
      expect(screen.getByText('저장되었습니다')).toBeInTheDocument();
    });
  });
});
```

## 7. 성능 최적화

### 7.1 코드 분할

```typescript
// 동적 임포트를 통한 번들 크기 최적화
const TipTapEditor = lazy(() => 
  import(/* webpackChunkName: "editor" */ './components/editor/core/TipTapEditor')
);

const AdminDashboard = lazy(() => 
  import(/* webpackChunkName: "admin" */ './components/admin/Dashboard')
);

// 플러그인 지연 로딩
const loadAdvancedFeatures = async () => {
  const [
    { default: Table },
    { default: TableRow },
    { default: TableCell },
    { default: TableHeader }
  ] = await Promise.all([
    import('@tiptap/extension-table'),
    import('@tiptap/extension-table-row'),
    import('@tiptap/extension-table-cell'),
    import('@tiptap/extension-table-header')
  ]);
  
  return { Table, TableRow, TableCell, TableHeader };
};
```

### 7.2 메모이제이션

```typescript
// 비용이 큰 연산 캐싱
const EditorStats = memo(({ content }) => {
  const stats = useMemo(() => {
    return {
      wordCount: countWords(content),
      charCount: countCharacters(content),
      readingTime: calculateReadingTime(content)
    };
  }, [content]);
  
  return (
    <div className="editor-stats">
      <span>{stats.wordCount} 단어</span>
      <span>{stats.charCount} 글자</span>
      <span>{stats.readingTime}분 읽기</span>
    </div>
  );
});
```

## 8. 배포 및 환경 설정

### 8.1 환경 변수

```typescript
// config/editor.config.ts
export const editorConfig = {
  api: {
    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:8080',
    uploadUrl: process.env.REACT_APP_UPLOAD_URL || '/api/upload',
  },
  features: {
    collaboration: process.env.REACT_APP_ENABLE_COLLAB === 'true',
    aiAssistant: process.env.REACT_APP_ENABLE_AI === 'true',
    autoSave: process.env.REACT_APP_ENABLE_AUTOSAVE !== 'false',
  },
  limits: {
    maxFileSize: parseInt(process.env.REACT_APP_MAX_FILE_SIZE || '5242880'), // 5MB
    maxContentLength: parseInt(process.env.REACT_APP_MAX_CONTENT_LENGTH || '100000'),
  }
};
```

## 결론

이 컴포넌트 아키텍처는 AsyncSite 플랫폼의 TipTap 에디터 통합을 위한 확장 가능하고 유지보수가 용이한 구조를 제공합니다. 모든 컴포넌트는 재사용 가능하며, 테스트가 용이하고, 성능이 최적화되어 있습니다.

### 핵심 특징
1. **모듈화**: 각 기능이 독립적인 컴포넌트로 분리
2. **재사용성**: 공통 컴포넌트와 훅의 재사용
3. **확장성**: 새로운 기능 추가가 용이한 구조
4. **테스트 가능성**: 단위 및 통합 테스트 지원
5. **성능**: 코드 분할과 메모이제이션을 통한 최적화

*최종 업데이트: 2025년 1월 6일*
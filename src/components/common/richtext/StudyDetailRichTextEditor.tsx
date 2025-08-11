import React, { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import { Link } from '@tiptap/extension-link';
import CharacterCount from '@tiptap/extension-character-count';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  RichTextData, 
  StudyTheme, 
  ToolbarOption,
  DEFAULT_THEME,
  COLOR_PRESETS
} from './RichTextTypes';
import { RichTextConverter } from './RichTextConverter';
import './StudyDetailRichTextEditor.css';
import RichTextRenderer from './RichTextRenderer';

interface StudyDetailRichTextEditorProps {
  value: RichTextData | string | null;
  onChange: (data: RichTextData) => void;
  placeholder?: string;
  toolbar?: ToolbarOption[];
  theme?: StudyTheme;
  maxLength?: number;
  singleLine?: boolean;
  className?: string;
  label?: string;
}

/**
 * Study Detail Page 전용 RichText 편집기
 * 고유한 네이밍으로 스타일 충돌 방지
 */
const StudyDetailRichTextEditor: React.FC<StudyDetailRichTextEditorProps> = ({
  value,
  onChange,
  placeholder = '텍스트를 입력하세요...',
  toolbar = ['bold', 'italic', 'highlight', 'break'],
  theme = DEFAULT_THEME,
  maxLength,
  singleLine = false,
  className = '',
  label
}) => {
  const DEBUG = true;
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorTarget, setColorTarget] = useState<'text' | 'highlight' | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [previewData, setPreviewData] = useState<RichTextData | null>(null);

  // 동기화 제어 플래그
  const hasInitializedRef = useRef(false);
  const lastLoadedJsonRef = useRef<string | null>(null);
  const isApplyingExternalRef = useRef(false);

  // TipTap 에디터 초기화
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        },
        hardBreak: {
          keepMarks: true
        }
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: {
          class: 'sdpre-mark'
        }
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      }),
      CharacterCount.configure({
        limit: maxLength
      }),
      Placeholder.configure({
        placeholder
      })
    ],
    content: '',
    editorProps: {
      attributes: {
        // ProseMirror 기본 클래스 보존 + 에디터 전용 클래스 동시 적용
        class: 'ProseMirror sdpre__prosemirror',
        'data-sdpre-editor': 'true'
      },
      handleKeyDown: (view, event) => {
        if (singleLine && event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          return true;
        }
        return false;
      }
    },
    onCreate: ({ editor }) => {
      if (DEBUG) {
        try {
          // 확장 목록 및 초기 HTML 로그
          // eslint-disable-next-line no-console
          console.log('[SDPRE] onCreate: extensions=', editor.extensionManager.extensions.map(e => e.name));
          // eslint-disable-next-line no-console
          console.log('[SDPRE] onCreate: initial HTML=', editor.getHTML());
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('[SDPRE] onCreate error:', e);
        }
      }
    },
    onUpdate: ({ editor }) => {
      if (isApplyingExternalRef.current) return;
      try {
        const html = editor.getHTML();
        const richTextData = RichTextConverter.fromHTML(html);
        onChange(richTextData);
        setPreviewData(richTextData);
        if (DEBUG) {
          // eslint-disable-next-line no-console
          console.log('[SDPRE] onUpdate: HTML=', html);
        }
      } catch (e) {
        if (DEBUG) {
          // eslint-disable-next-line no-console
          console.error('[SDPRE] onUpdate error:', e);
        }
      }
    }
  });

  // 초기값 및 외부 값 반영 (루프 방지 가드 포함)
  useEffect(() => {
    if (!editor || value == null) return;

    // 문자열(레거시 HTML)
    if (typeof value === 'string') {
      const html = value;
      if (editor.getHTML() !== html) {
        isApplyingExternalRef.current = true;
        editor.commands.setContent(html);
        isApplyingExternalRef.current = false;
        setPreviewData(RichTextConverter.fromHTML(html));
        lastLoadedJsonRef.current = html;
      }
      hasInitializedRef.current = true;
      return;
    }

    // RichTextData
    const json = JSON.stringify(value);
    if (!hasInitializedRef.current || lastLoadedJsonRef.current !== json) {
      const html = RichTextConverter.toHTML(value);
      isApplyingExternalRef.current = true;
      editor.commands.setContent(html);
      isApplyingExternalRef.current = false;
      setPreviewData(value);
      lastLoadedJsonRef.current = json;
      hasInitializedRef.current = true;
    }
  }, [editor, value]);


  // 툴바 액션 처리
  const handleToolbarAction = (option: ToolbarOption) => {
    if (!editor) {
      return;
    }

    switch (option) {
      case 'bold':
        if (DEBUG) console.log('[SDPRE] toolbar: bold');
        editor.chain().focus().toggleBold().run();
        break;
      case 'italic':
        if (DEBUG) console.log('[SDPRE] toolbar: italic');
        editor.chain().focus().toggleItalic().run();
        break;
      case 'break':
        if (DEBUG) console.log('[SDPRE] toolbar: break');
        editor.chain().focus().setHardBreak().run();
        break;
      case 'highlight': {
        // 주 강조: 텍스트 색상
        if (DEBUG) console.log('[SDPRE] toolbar: highlight (text color)');
        const target = theme.colors.highlight;
        const isActive = editor.isActive('textStyle', { color: target });
        const chain = editor.chain().focus();
        if (isActive) {
          chain.unsetColor();
        } else {
          chain.setColor(target);
        }
        chain.run();
        break;
      }
      case 'subtle-highlight': {
        // 약한 강조: 텍스트 색상
        if (DEBUG) console.log('[SDPRE] toolbar: subtle-highlight (text color)');
        const target = theme.colors.subtleHighlight;
        const isActive = editor.isActive('textStyle', { color: target });
        const chain = editor.chain().focus();
        if (isActive) {
          chain.unsetColor();
        } else {
          chain.setColor(target);
        }
        chain.run();
        break;
      }
      case 'color':
        if (DEBUG) console.log('[SDPRE] toolbar: color picker open');
        setColorTarget('text');
        setShowColorPicker(true);
        break;
      case 'heading':
        if (DEBUG) console.log('[SDPRE] toolbar: heading h2');
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case 'list':
        if (DEBUG) console.log('[SDPRE] toolbar: bullet list');
        editor.chain().focus().toggleBulletList().run();
        break;
      case 'link':
        const url = prompt('링크 URL을 입력하세요:');
        if (url) {
          if (DEBUG) console.log('[SDPRE] toolbar: set link', url);
          editor.chain().focus().setLink({ href: url }).run();
        }
        break;
      case 'emoji':
        const emoji = prompt('이모지를 입력하세요:');
        if (emoji) {
          if (DEBUG) console.log('[SDPRE] toolbar: insert emoji', emoji);
          editor.chain().focus().insertContent(emoji).run();
        }
        break;
    }
  };

  // 색상 적용
  const applyColor = (color: string) => {
    if (!editor || !colorTarget) return;

    if (colorTarget === 'text' || colorTarget === 'highlight') {
      const rgbColor = color.startsWith('#') ? hexToRgb(color) : color;
      editor.chain().focus().setColor(rgbColor).run();
    }

    setShowColorPicker(false);
    setColorTarget(null);
  };

  // HEX를 RGB로 변환
  const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      const r = parseInt(result[1], 16);
      const g = parseInt(result[2], 16);
      const b = parseInt(result[3], 16);
      return `rgb(${r}, ${g}, ${b})`;
    }
    return hex;
  };

  // 툴바 버튼 렌더링
  const renderToolbarButton = (option: ToolbarOption) => {
    const icons: Record<ToolbarOption, string> = {
      bold: 'B',
      italic: 'I',
      highlight: '🔆',
      'subtle-highlight': '💡',
      link: '🔗',
      break: '⏎',
      heading: 'H',
      list: '☰',
      color: '🎨',
      emoji: '😊'
    };

    const labels: Record<ToolbarOption, string> = {
      bold: '굵게',
      italic: '기울임',
      highlight: '강조',
      'subtle-highlight': '약한 강조',
      link: '링크',
      break: '줄바꿈',
      heading: '제목',
      list: '목록',
      color: '색상',
      emoji: '이모지'
    };

    const isActive = () => {
      if (!editor) return false;
      
      switch (option) {
        case 'bold':
          return editor.isActive('bold');
        case 'italic':
          return editor.isActive('italic');
        case 'highlight':
          return editor.isActive('textStyle', { color: theme.colors.highlight });
        case 'subtle-highlight':
          return editor.isActive('textStyle', { color: theme.colors.subtleHighlight });
        case 'heading':
          return editor.isActive('heading');
        case 'list':
          return editor.isActive('bulletList');
        case 'link':
          return editor.isActive('link');
        default:
          return false;
      }
    };

    return (
      <button
        key={option}
        type="button"
        className={`sdpre__toolbar-button ${isActive() ? 'sdpre__toolbar-button--active' : ''}`}
        onClick={() => handleToolbarAction(option)}
        title={labels[option]}
      >
        <span className="sdpre__toolbar-icon">{icons[option] || labels[option]?.charAt(0).toUpperCase()}</span>
      </button>
    );
  };

  // 색상 선택기 렌더링
  const renderColorPicker = () => {
    if (!showColorPicker || !colorTarget) return null;

    return (
      <div className="sdpre__color-picker">
        <div className="sdpre__color-picker-header">
          <span>{colorTarget === 'text' ? '텍스트 색상' : '하이라이트 색상'}</span>
          <button 
            onClick={() => {
              setShowColorPicker(false);
              setColorTarget(null);
            }}
            className="sdpre__color-picker-close"
          >
            ✕
          </button>
        </div>
        
        <div className="sdpre__color-presets">
          <div className="sdpre__preset-label">테마 색상:</div>
          <button
            className="sdpre__color-preset"
            style={{ backgroundColor: theme.colors.highlight }}
            onClick={() => applyColor(theme.colors.highlight)}
            title="주 강조색"
          />
          <button
            className="sdpre__color-preset"
            style={{ backgroundColor: theme.colors.subtleHighlight }}
            onClick={() => applyColor(theme.colors.subtleHighlight)}
            title="부 강조색"
          />
        </div>
        
        <div className="sdpre__color-presets">
          <div className="sdpre__preset-label">프리셋:</div>
          {Object.values(COLOR_PRESETS).map(preset => (
            <button
              key={preset.name}
              className="sdpre__color-preset"
              style={{ 
                background: `linear-gradient(135deg, ${preset.colors.primary}, ${preset.colors.secondary})` 
              }}
              onClick={() => applyColor(preset.colors.primary)}
              title={preset.name}
            />
          ))}
        </div>

        <div className="sdpre__color-presets">
          <div className="sdpre__preset-label">기본 색상:</div>
          {['#ff0000', '#ffa500', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#ffffff'].map(color => (
            <button
              key={color}
              className="sdpre__color-preset"
              style={{ backgroundColor: color }}
              onClick={() => applyColor(color)}
            />
          ))}
        </div>

        {colorTarget === 'text' && (
          <div className="sdpre__color-reset">
            <button 
              onClick={() => {
                editor?.chain().focus().unsetColor().run();
                setShowColorPicker(false);
                setColorTarget(null);
              }}
              className="sdpre__reset-btn"
            >
              색상 초기화
            </button>
          </div>
        )}
      </div>
    );
  };

  const currentCharCount = editor?.storage.characterCount.characters() || 0;

  
  return (
    <div className={`sdpre__container ${className}`} data-sdpre-scope="study-detail">
      {label && <label className="sdpre__label">{label}</label>}
      
      <div className="sdpre__toolbar">
        {!isPreview && toolbar.map(renderToolbarButton)}
        
        {!isPreview && <div className="sdpre__toolbar-separator" />}
        
        <button
          type="button"
          className="sdpre__toolbar-button"
          onClick={() => setIsPreview(!isPreview)}
          title={isPreview ? '편집' : '미리보기'}
        >
          {isPreview ? '✏️' : '👁️'}
        </button>
      </div>

      {renderColorPicker()}

      <div className={`sdpre__content-area ${isPreview ? 'sdpre__content-area--preview' : 'sdpre__content-area--edit'}`}>
        {isPreview ? (
          <div className="sdpre__preview">
            <RichTextRenderer data={previewData || (editor ? RichTextConverter.fromHTML(editor.getHTML()) : null)} />
          </div>
        ) : (
          <div className="sdpre__tiptap-wrapper">
            <EditorContent editor={editor} />
          </div>
        )}
      </div>

      {maxLength && !isPreview && (
        <div className="sdpre__char-count">
          {currentCharCount} / {maxLength}
        </div>
      )}
    </div>
  );
};

export default StudyDetailRichTextEditor;
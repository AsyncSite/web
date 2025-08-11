import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
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
// RichTextStyles.css를 마지막에 import하여 우선순위 확보
import './RichTextStyles.css';
import './RichTextOverrides.css'; // 최상위 우선순위 스타일

interface RichTextEditorProps {
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
 * TipTap 기반 RichText 편집기 컴포넌트
 * WYSIWYG 방식으로 안전한 텍스트 포맷팅 제공
 */
const RichTextEditor: React.FC<RichTextEditorProps> = ({
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
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorTarget, setColorTarget] = useState<'text' | 'highlight' | null>(null);
  const [isPreview, setIsPreview] = useState(false);

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
          class: 'highlight'
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
        class: 'richtext-tiptap-editor'
      },
      handleKeyDown: (view, event) => {
        // 단일 라인 모드에서 Enter 키 방지
        if (singleLine && event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          return true;
        }
        return false;
      }
    },
    onUpdate: ({ editor }) => {
      // HTML을 RichText 데이터로 변환
      const html = editor.getHTML();
      const richTextData = RichTextConverter.fromHTML(html);
      onChange(richTextData);
    }
  });

  // 초기값 설정
  useEffect(() => {
    if (!editor || !value) return;

    let html = '';
    if (typeof value === 'string') {
      html = value;
    } else {
      html = RichTextConverter.toHTML(value);
    }

    // 에디터의 현재 내용과 다른 경우에만 업데이트
    if (editor.getHTML() !== html) {
      editor.commands.setContent(html);
    }
  }, [editor, value]);

  // 툴바 액션 처리
  const handleToolbarAction = (option: ToolbarOption) => {
    if (!editor) return;

    switch (option) {
      case 'bold':
        editor.chain().focus().toggleBold().run();
        break;
      case 'italic':
        editor.chain().focus().toggleItalic().run();
        break;
      case 'break':
        editor.chain().focus().setHardBreak().run();
        break;
      case 'highlight':
        // 기본 노란색 하이라이트 즉시 적용
        editor.chain().focus().toggleHighlight({ color: 'rgb(255, 234, 0)' }).run();
        break;
      case 'subtle-highlight':
        // 파란색 하이라이트 즉시 적용
        editor.chain().focus().toggleHighlight({ color: 'rgb(130, 170, 255)' }).run();
        break;
      case 'color':
        setColorTarget('text');
        setShowColorPicker(true);
        break;
      case 'heading':
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case 'list':
        editor.chain().focus().toggleBulletList().run();
        break;
      case 'link':
        const url = prompt('링크 URL을 입력하세요:');
        if (url) {
          editor.chain().focus().setLink({ href: url }).run();
        }
        break;
      case 'emoji':
        // 이모지 선택기는 별도 구현 필요
        const emoji = prompt('이모지를 입력하세요:');
        if (emoji) {
          editor.chain().focus().insertContent(emoji).run();
        }
        break;
    }
  };

  // 색상 적용
  const applyColor = (color: string) => {
    if (!editor || !colorTarget) return;

    if (colorTarget === 'text') {
      // 텍스트 색상 적용
      editor.chain().focus().setColor(color).run();
    } else if (colorTarget === 'highlight') {
      // 하이라이트 색상 적용 (RGB 형식으로 변환)
      const rgbColor = color.startsWith('#') ? hexToRgb(color) : color;
      editor.chain().focus().toggleHighlight({ color: rgbColor }).run();
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

    // 활성 상태 확인
    const isActive = () => {
      if (!editor) return false;
      
      switch (option) {
        case 'bold':
          return editor.isActive('bold');
        case 'italic':
          return editor.isActive('italic');
        case 'highlight':
          return editor.isActive('highlight');
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
        className={`richtext-toolbar-button ${isActive() ? 'active' : ''}`}
        onClick={() => handleToolbarAction(option)}
        title={labels[option]}
      >
        <span className="toolbar-icon">{icons[option] || labels[option]?.charAt(0).toUpperCase()}</span>
      </button>
    );
  };

  // 색상 선택기 렌더링
  const renderColorPicker = () => {
    if (!showColorPicker || !colorTarget) return null;

    return (
      <div className="richtext-color-picker">
        <div className="color-picker-header">
          <span>{colorTarget === 'text' ? '텍스트 색상' : '하이라이트 색상'}</span>
          <button 
            onClick={() => {
              setShowColorPicker(false);
              setColorTarget(null);
            }}
            className="color-picker-close"
          >
            ✕
          </button>
        </div>
        
        <div className="color-presets">
          <div className="preset-label">테마 색상:</div>
          <button
            className="color-preset"
            style={{ backgroundColor: theme.colors.highlight }}
            onClick={() => applyColor(theme.colors.highlight)}
            title="주 강조색"
          />
          <button
            className="color-preset"
            style={{ backgroundColor: theme.colors.subtleHighlight }}
            onClick={() => applyColor(theme.colors.subtleHighlight)}
            title="부 강조색"
          />
        </div>
        
        <div className="color-presets">
          <div className="preset-label">프리셋:</div>
          {Object.values(COLOR_PRESETS).map(preset => (
            <button
              key={preset.name}
              className="color-preset"
              style={{ 
                background: `linear-gradient(135deg, ${preset.colors.primary}, ${preset.colors.secondary})` 
              }}
              onClick={() => applyColor(preset.colors.primary)}
              title={preset.name}
            />
          ))}
        </div>

        {/* 기본 색상 팔레트 */}
        <div className="color-presets">
          <div className="preset-label">기본 색상:</div>
          {['#ff0000', '#ffa500', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#ffffff'].map(color => (
            <button
              key={color}
              className="color-preset"
              style={{ backgroundColor: color }}
              onClick={() => applyColor(color)}
            />
          ))}
        </div>

        {/* 색상 초기화 */}
        {colorTarget === 'text' && (
          <div className="color-reset">
            <button 
              onClick={() => {
                editor?.chain().focus().unsetColor().run();
                setShowColorPicker(false);
                setColorTarget(null);
              }}
              className="reset-btn"
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
    <div className={`richtext-editor ${className}`}>
      {label && <label className="richtext-label">{label}</label>}
      
      <div className="richtext-toolbar">
        {!isPreview && toolbar.map(renderToolbarButton)}
        
        {!isPreview && <div className="toolbar-separator" />}
        
        <button
          type="button"
          className="richtext-toolbar-button"
          onClick={() => setIsPreview(!isPreview)}
          title={isPreview ? '편집' : '미리보기'}
        >
          {isPreview ? '✏️' : '👁️'}
        </button>
      </div>

      {renderColorPicker()}

      <div className={`richtext-content ${isPreview ? 'preview-mode' : 'edit-mode'}`}>
        {isPreview ? (
          <div className="richtext-preview" style={{ color: '#f0f0f0' }}>
            <div dangerouslySetInnerHTML={{ __html: editor?.getHTML() || '' }} />
          </div>
        ) : (
          <EditorContent editor={editor} />
        )}
      </div>

      {maxLength && !isPreview && (
        <div className="richtext-char-count">
          {currentCharCount} / {maxLength}
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
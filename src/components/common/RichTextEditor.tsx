import { useEffect } from 'react';
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
  placeholder = '자신을 소개해주세요...',
  maxLength = 2000,
  disabled = false,
}: RichTextEditorProps): React.ReactNode {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        blockquote: false,
        hardBreak: false,
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'tiptap-editor-empty',
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
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor-content-area',
      },
    },
  });

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  const characterCount = editor?.storage.characterCount.characters() || 0;
  const isMaxLength = characterCount >= maxLength;

  const handleBoldClick = () => {
    editor?.chain().focus().toggleBold().run();
  };

  const handleItalicClick = () => {
    editor?.chain().focus().toggleItalic().run();
  };

  const handleStrikeClick = () => {
    editor?.chain().focus().toggleStrike().run();
  };

  const handleBulletListClick = () => {
    editor?.chain().focus().toggleBulletList().run();
  };

  const handleOrderedListClick = () => {
    editor?.chain().focus().toggleOrderedList().run();
  };

  const handleLinkClick = () => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('URL 주소를 입력하세요:', previousUrl);
    
    if (url === null) {
      return;
    }

    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className={`tiptap-editor-wrapper ${disabled ? 'tiptap-editor-disabled' : ''}`} data-profile-editor="true">
      <div className="tiptap-editor-toolbar">
        <div className="tiptap-toolbar-group">
          <button
            type="button"
            onClick={handleBoldClick}
            className={`tiptap-toolbar-button ${editor?.isActive('bold') ? 'tiptap-toolbar-button-active' : ''}`}
            disabled={disabled}
            title="굵게 (Ctrl+B)"
            aria-label="굵게"
          >
            <span className="tiptap-toolbar-icon-bold">B</span>
          </button>
          <button
            type="button"
            onClick={handleItalicClick}
            className={`tiptap-toolbar-button ${editor?.isActive('italic') ? 'tiptap-toolbar-button-active' : ''}`}
            disabled={disabled}
            title="기울임 (Ctrl+I)"
            aria-label="기울임"
          >
            <span className="tiptap-toolbar-icon-italic">I</span>
          </button>
          <button
            type="button"
            onClick={handleStrikeClick}
            className={`tiptap-toolbar-button ${editor?.isActive('strike') ? 'tiptap-toolbar-button-active' : ''}`}
            disabled={disabled}
            title="취소선 (Ctrl+Shift+X)"
            aria-label="취소선"
          >
            <span className="tiptap-toolbar-icon-strike">S</span>
          </button>
        </div>

        <div className="tiptap-toolbar-divider"></div>

        <div className="tiptap-toolbar-group">
          <button
            type="button"
            onClick={handleBulletListClick}
            className={`tiptap-toolbar-button ${editor?.isActive('bulletList') ? 'tiptap-toolbar-button-active' : ''}`}
            disabled={disabled}
            title="글머리 기호 목록"
            aria-label="글머리 기호 목록"
          >
            <span className="tiptap-toolbar-icon-list">• 목록</span>
          </button>
          <button
            type="button"
            onClick={handleOrderedListClick}
            className={`tiptap-toolbar-button ${editor?.isActive('orderedList') ? 'tiptap-toolbar-button-active' : ''}`}
            disabled={disabled}
            title="번호 매기기 목록"
            aria-label="번호 매기기 목록"
          >
            <span className="tiptap-toolbar-icon-numbered">1. 목록</span>
          </button>
        </div>

        <div className="tiptap-toolbar-divider"></div>

        <div className="tiptap-toolbar-group">
          <button
            type="button"
            onClick={handleLinkClick}
            className={`tiptap-toolbar-button ${editor?.isActive('link') ? 'tiptap-toolbar-button-active' : ''}`}
            disabled={disabled}
            title="링크 추가"
            aria-label="링크 추가"
          >
            <span className="tiptap-toolbar-icon-link">🔗</span>
          </button>
        </div>
      </div>

      <div className="tiptap-editor-content-wrapper">
        <EditorContent editor={editor} className="tiptap-editor-content" />
      </div>

      <div className="tiptap-editor-footer">
        <span className={`tiptap-character-count ${isMaxLength ? 'tiptap-character-count-max' : ''}`}>
          {characterCount}/{maxLength}
        </span>
      </div>
    </div>
  );
}

export default RichTextEditor;
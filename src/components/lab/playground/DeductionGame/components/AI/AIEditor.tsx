import React from 'react';

interface AIEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
  onSubmit: () => void;
}

const AIEditor: React.FC<AIEditorProps> = ({ code, onCodeChange, onSubmit }) => {
  return (
    <div className="ai-editor">
      <h3>AI 코드 에디터</h3>
      <textarea
        value={code}
        onChange={(e) => onCodeChange(e.target.value)}
        placeholder="AI 코드를 입력하세요..."
        rows={20}
        cols={80}
      />
      <div className="editor-actions">
        <button onClick={onSubmit}>AI 제출</button>
      </div>
    </div>
  );
};

export default AIEditor;

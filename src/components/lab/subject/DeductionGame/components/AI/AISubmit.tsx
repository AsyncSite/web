import React from 'react';

interface AISubmitProps {
  aiName: string;
  author: string;
  onNameChange: (name: string) => void;
  onAuthorChange: (author: string) => void;
  onSubmit: () => void;
  isValidating: boolean;
}

const AISubmit: React.FC<AISubmitProps> = ({ 
  aiName, 
  author, 
  onNameChange, 
  onAuthorChange, 
  onSubmit, 
  isValidating 
}) => {
  return (
    <div className="ai-submit">
      <h3>AI 정보</h3>
      <div className="ai-info">
        <label>
          AI 이름:
          <input 
            type="text" 
            value={aiName} 
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="AI 이름을 입력하세요"
          />
        </label>
        <label>
          제작자:
          <input 
            type="text" 
            value={author} 
            onChange={(e) => onAuthorChange(e.target.value)}
            placeholder="제작자 이름을 입력하세요"
          />
        </label>
      </div>
      <button onClick={onSubmit} disabled={isValidating}>
        {isValidating ? '검증 중...' : 'AI 등록'}
      </button>
    </div>
  );
};

export default AISubmit;
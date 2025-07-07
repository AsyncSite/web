import React from 'react';

interface GuessInputProps {
  selectedKeywords: number[];
  keywordPool: string[];
  onSubmit: () => void;
  onClear: () => void;
  disabled: boolean;
}

const GuessInput: React.FC<GuessInputProps> = ({
  selectedKeywords,
  keywordPool,
  onSubmit,
  onClear,
  disabled,
}) => {
  return (
    <div className="guess-input">
      <div className="selected-keywords">
        <h4>선택된 키워드</h4>
        <div className="selected-list">
          {selectedKeywords.map((index) => (
            <span key={index} className="selected-keyword">
              {keywordPool[index]}
            </span>
          ))}
        </div>
      </div>
      <div className="actions">
        <button onClick={onClear} disabled={disabled || selectedKeywords.length === 0}>
          선택 초기화
        </button>
        <button
          onClick={onSubmit}
          disabled={disabled || selectedKeywords.length === 0}
          className="submit-btn"
        >
          추측 제출
        </button>
      </div>
    </div>
  );
};

export default GuessInput;

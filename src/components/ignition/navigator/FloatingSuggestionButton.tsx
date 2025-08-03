import React, { useState } from 'react';
import SuggestionModal from './SuggestionModal';
import './FloatingSuggestionButton.css';

const FloatingSuggestionButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <div 
        className="floating-suggestion-container"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isHovered && (
          <div className="floating-suggestion-tooltip">
            제안하기
          </div>
        )}
        <button
          className="floating-suggestion-button"
          onClick={() => setIsModalOpen(true)}
          aria-label="제안하기"
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            <line x1="9" y1="10" x2="15" y2="10"></line>
            <line x1="12" y1="7" x2="12" y2="13"></line>
          </svg>
        </button>
      </div>

      <SuggestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          alert('제안이 성공적으로 전송되었습니다. 감사합니다!');
        }}
      />
    </>
  );
};

export default FloatingSuggestionButton;
import React, { useState } from 'react';
import SuggestionModal from './SuggestionModal';
import './SuggestionButton.css';

const SuggestionButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        className="suggestion-button"
        onClick={() => setIsModalOpen(true)}
        aria-label="제안하기"
      >
        <svg 
          width="20" 
          height="20" 
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
        <span className="suggestion-button-text">제안하기</span>
      </button>

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

export default SuggestionButton;
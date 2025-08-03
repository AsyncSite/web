import React, { useState, useEffect } from 'react';
import SuggestionModal from './SuggestionModal';
import './SuggestionFAB.css';

const SuggestionFAB: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true); // 일단 항상 표시
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // 스크롤이 100px 이상 내려가면 버튼 표시
      const shouldShow = window.scrollY > 100;
      setIsVisible(shouldShow);
    };

    // 일단 스크롤 감지 비활성화
    // window.addEventListener('scroll', handleScroll);
    // handleScroll(); // 초기 상태 확인

    // return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <button
        className={`suggestion-fab ${isVisible ? 'visible' : ''}`}
        onClick={() => setIsModalOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
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
          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        {isHovered && (
          <span className="suggestion-fab-tooltip">제안하기</span>
        )}
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

export default SuggestionFAB;
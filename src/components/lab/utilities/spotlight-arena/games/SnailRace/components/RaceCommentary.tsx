import React, { useState, useEffect, useRef } from 'react';
import './RaceCommentary.css';

interface CommentaryMessage {
  id: string;
  text: string;
  timestamp: number;
}

interface RaceCommentaryProps {
  messages: CommentaryMessage[];
}

const RaceCommentary: React.FC<RaceCommentaryProps> = ({ messages }) => {
  const [displayedMessages, setDisplayedMessages] = useState<CommentaryMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [userScrolled, setUserScrolled] = useState(false);

  useEffect(() => {
    // 모든 메시지 표시 (5개 제한 제거)
    setDisplayedMessages(messages);
  }, [messages]);

  // 자동 스크롤 기능
  useEffect(() => {
    if (!userScrolled && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [displayedMessages, userScrolled]);

  // 사용자 스크롤 감지
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      // 사용자가 최하단에서 10px 이상 위로 스크롤했는지 확인
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
      setUserScrolled(!isAtBottom);
    }
  };

  return (
    <div className="race-commentary">
      <div className="commentary-header">
        <span className="commentary-icon">📢</span>
        <span className="commentary-title">실시간 중계</span>
      </div>
      <div className="commentary-messages" ref={messagesContainerRef} onScroll={handleScroll}>
        {displayedMessages.map((message, index) => (
          <div
            key={message.id}
            className="commentary-message"
            style={{
              animation: `commentarySlideIn 0.5s ease-out`,
              animationDelay: `${index * 0.05}s`,
            }}
          >
            {message.text}
          </div>
        ))}
        {displayedMessages.length === 0 && (
          <div className="commentary-message">레이스가 곧 시작됩니다...</div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {userScrolled && (
        <button
          className="commentary-scroll-button"
          onClick={() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            setUserScrolled(false);
          }}
          title="최신 메시지로 이동"
        >
          ↓
        </button>
      )}
    </div>
  );
};

export default RaceCommentary;

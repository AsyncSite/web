import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    // 최신 5개 메시지만 표시
    setDisplayedMessages(messages.slice(-5));
  }, [messages]);

  return (
    <div className="race-commentary">
      <div className="commentary-header">
        <span className="commentary-icon">📢</span>
        <span className="commentary-title">실시간 중계</span>
      </div>
      <div className="commentary-messages">
        {displayedMessages.map((message) => (
          <div
            key={message.id}
            className="commentary-message"
            style={{
              animation: 'commentarySlideIn 0.5s ease-out',
            }}
          >
            {message.text}
          </div>
        ))}
        {displayedMessages.length === 0 && (
          <div className="commentary-message">레이스가 곧 시작됩니다...</div>
        )}
      </div>
    </div>
  );
};

export default RaceCommentary;

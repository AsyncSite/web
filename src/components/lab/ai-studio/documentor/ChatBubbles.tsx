import React from 'react';
import styles from './DocuMentor.module.css';

function ChatBubbles(): React.ReactNode {
  return (
    <div className={styles.chatBubbles}>
      <div className={`${styles.chatBubble} ${styles.user}`}>
        <span className={styles.emojiLarge}>😰</span>
        <div className={styles.chatContent}>
          <div className={styles.chatText}>내가 쓴 글이 괜찮은지 모르겠어...</div>
          <div className={styles.chatSubtext}>블로그 발행 전 늘 고민되시죠?</div>
        </div>
      </div>
      
      <div className={`${styles.chatBubble} ${styles.ai}`}>
        <span className={styles.emojiLarge}>🤖</span>
        <div className={styles.chatContent}>
          <div className={styles.chatText}>제가 읽고 피드백 드릴게요!</div>
          <div className={styles.chatSubtext}>3분이면 10가지 개선점을 찾아드려요</div>
        </div>
      </div>
    </div>
  );
}

export default ChatBubbles;
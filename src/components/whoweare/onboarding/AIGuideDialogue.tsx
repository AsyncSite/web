import React, { useState, useEffect } from 'react';
import './AIGuideDialogue.css';
import { aiGuideStore } from './AIGuideStore';

interface AIGuideDialogueProps {
  dialogue: string;
  onResponse: (response: string) => void;
  onSkip: () => void;
  onComplete: () => void;
  onBack?: () => void;
}

const AIGuideDialogue: React.FC<AIGuideDialogueProps> = ({
  dialogue,
  onResponse,
  onSkip,
  onComplete,
  onBack
}) => {
  const [isTyping, setIsTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [showChoices, setShowChoices] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isEndDialogue, setIsEndDialogue] = useState(false);
  const [currentAction, setCurrentAction] = useState<{ action?: string; target?: any }>({});
  
  useEffect(() => {
    if (!dialogue) {
      setDisplayedText('');
      setShowChoices(false);
      return;
    }
    
    setIsTyping(true);
    setDisplayedText('');
    setShowChoices(false);
    
    // 종료 대화인지 확인
    setIsEndDialogue(aiGuideStore.isEndDialogue());
    
    // 현재 액션 확인
    const action = aiGuideStore.getCurrentAction();
    setCurrentAction(action);
    
    // 대화 변경 이벤트 발생 (효과 초기화용)
    const dialogueChangeEvent = new CustomEvent('aiGuideDialogueChange');
    window.dispatchEvent(dialogueChangeEvent);
    
    // 액션에 따른 시각적 효과 트리거
    if (action.action === 'point' || action.action === 'highlight') {
      // 약간의 딜레이 후 효과 적용 (대화 변경 효과가 먼저 적용되도록)
      setTimeout(() => {
        const event = new CustomEvent('aiGuideAction', { 
          detail: { action: action.action, target: action.target } 
        });
        window.dispatchEvent(event);
      }, 100);
    }
    
    // 타이핑 효과
    const text = dialogue;
    let index = 0;
    
    const typeInterval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.substring(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        setShowChoices(true);
        clearInterval(typeInterval);
        
        // 종료 대화인 경우 5초 후 자동으로 닫기
        if (aiGuideStore.isEndDialogue()) {
          setTimeout(() => {
            setIsFadingOut(true);
            // 페이드 아웃 애니메이션 후 완전히 닫기
            setTimeout(() => {
              onComplete();
            }, 500);
          }, 5000);
        }
      }
    }, 30);
    
    return () => clearInterval(typeInterval);
  }, [dialogue, onComplete]);
  
  const handleChoice = (choiceText: string) => {
    onResponse(choiceText);
  };
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };
  
  const choices = aiGuideStore.getChoices();
  const canGoBack = aiGuideStore.canGoBack();
  
  if (!dialogue && !displayedText) return null;
  
  return (
    <div className={`ai-guide-dialogue-container ${isFadingOut ? 'fade-out' : ''}`}>
      <div className="ai-guide-avatar">
        <div className="avatar-glow"></div>
        <div className="avatar-core">
          <span className="avatar-emoji">🤖</span>
        </div>
        <div className="avatar-ring"></div>
      </div>
      
      <div className="ai-guide-bubble">
        {!isTyping && (
          <div className="dialogue-buttons">
            {canGoBack && !isEndDialogue && (
              <button className="back-guide-button" onClick={handleBack} title="이전">
                ←
              </button>
            )}
            <button className="skip-guide-button" onClick={onSkip}>
              {isEndDialogue ? '종료' : '건너뛰기'}
            </button>
          </div>
        )}
        
        <div className="bubble-content">
          <p className="bubble-text">{displayedText}</p>
          {isTyping && <span className="typing-cursor">|</span>}
        </div>
        
        {showChoices && choices && choices.length > 0 && (
          <div className="choice-buttons">
            {choices.map((choice, index) => (
              <button
                key={index}
                className="choice-button"
                onClick={() => handleChoice(choice.text)}
              >
                {choice.text}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIGuideDialogue;
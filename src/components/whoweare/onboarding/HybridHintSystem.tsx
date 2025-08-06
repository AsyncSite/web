import React, { useState, useEffect } from 'react';
import './HybridHintSystem.css';

interface HintSystemProps {
  currentStep: number;
  onSkip: () => void;
  onComplete: () => void;
  onInteraction?: () => void;
}

export const HybridHintSystem: React.FC<HintSystemProps> = ({
  currentStep,
  onSkip,
  onComplete,
  onInteraction
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showEntryTitle, setShowEntryTitle] = useState(false);
  
  const hints = [
    {
      id: 'explore',
      text: '드래그로 우주 공간을 둘러보세요',
      icon: '🔄',
      duration: 3000
    },
    {
      id: 'discover',
      text: '빛나는 이야기 카드를 클릭해보세요',
      icon: '✨',
      waitForAction: true
    },
    {
      id: 'meet',
      text: '팀원들을 만나보세요',
      icon: '👥',
      optional: true
    }
  ];

  useEffect(() => {
    // localStorage에서 온보딩 상태 확인
    const hasSeenOnboarding = localStorage.getItem('whoweare-hybrid-onboarding');
    if (hasSeenOnboarding === 'true') {
      onComplete();
      return;
    }
    
    // 첫 진입 타이틀 표시 (처음 마운트 시에만)
    if (!showEntryTitle && !isVisible) {
      setShowEntryTitle(true);
      setTimeout(() => {
        setShowEntryTitle(false);
        // 5초 후 첫 힌트 표시
        setTimeout(() => {
          setIsVisible(true);
        }, 2000);
      }, 3000);
    } else if (!showEntryTitle) {
      // 재시작 시에는 바로 힌트만 표시
      setIsVisible(true);
    }
    
    return () => {
      // Cleanup
    };
  }, [onComplete]);

  // Handle step changes based on currentStep prop
  useEffect(() => {
    if (currentStep >= hints.length) {
      // Complete onboarding after last step
      setTimeout(() => {
        localStorage.setItem('whoweare-hybrid-onboarding', 'true');
        setIsVisible(false);
        onComplete();
      }, 2000); // Give user time to see the last hint
    }
  }, [currentStep, hints.length, onComplete]);

  const handleSkip = () => {
    localStorage.setItem('whoweare-hybrid-onboarding', 'true');
    setIsVisible(false);
    onSkip();
  };

  // Entry title animation
  if (showEntryTitle) {
    return (
      <div className="hybrid-entry-overlay">
        <div className="hybrid-entry-content">
          <h1 className="hybrid-entry-title">AsyncSite Universe</h1>
          <p className="hybrid-entry-subtitle">우주를 떠다니는 우리들의 이야기</p>
        </div>
      </div>
    );
  }

  if (!isVisible) return null;

  const currentHint = hints[currentStep] || hints[0];

  return (
    <div className="hybrid-hint-container">
      <div className="hybrid-hint-bubble">
        <span className="hint-icon">{currentHint.icon}</span>
        <span className="hint-text">{currentHint.text}</span>
        <button className="hint-skip" onClick={handleSkip}>건너뛰기</button>
      </div>
      <div className="hint-progress">
        {hints.map((_, index) => (
          <div 
            key={index}
            className={`progress-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HybridHintSystem;
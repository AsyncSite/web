import React, { useState, useEffect } from 'react';
import './HelpButton.css';

interface HelpButtonProps {
  onHelp: () => void;
  isVisible?: boolean;
}

const HelpButton: React.FC<HelpButtonProps> = ({ onHelp, isVisible = true }) => {
  const [showPulse, setShowPulse] = useState(false);
  
  useEffect(() => {
    // Show pulse animation after 10 seconds of inactivity
    const timer = setTimeout(() => {
      setShowPulse(true);
      // Stop pulsing after 5 seconds
      setTimeout(() => setShowPulse(false), 5000);
    }, 10000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!isVisible) return null;
  
  return (
    <div className="help-button-container">
      <button 
        className={`help-button ${showPulse ? 'pulse' : ''}`}
        onClick={onHelp}
        aria-label="도움 받기"
      >
        <span className="help-icon">💡</span>
        <span className="help-text">도움 받기</span>
      </button>
    </div>
  );
};

export default HelpButton;
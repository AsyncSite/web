import React, { useEffect, useState } from 'react';
import './ComboDisplay.css';

interface ComboDisplayProps {
  cascadeLevel: number;
  isActive: boolean;
}

export const ComboDisplay: React.FC<ComboDisplayProps> = ({ cascadeLevel, isActive }) => {
  const [showCombo, setShowCombo] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (cascadeLevel >= 2 && isActive) {
      setShowCombo(true);
      setAnimationKey(prev => prev + 1);
      
      const timer = setTimeout(() => {
        setShowCombo(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [cascadeLevel, isActive]);

  if (!showCombo || cascadeLevel < 2) return null;

  const getComboText = () => {
    if (cascadeLevel === 2) return 'DOUBLE!';
    if (cascadeLevel === 3) return 'TRIPLE!';
    if (cascadeLevel === 4) return 'QUADRUPLE!';
    if (cascadeLevel >= 5) return `${cascadeLevel}X COMBO!`;
    return '';
  };

  const getComboClass = () => {
    if (cascadeLevel >= 5) return 'mega';
    if (cascadeLevel >= 4) return 'ultra';
    if (cascadeLevel >= 3) return 'super';
    return 'normal';
  };

  return (
    <div key={animationKey} className={`combo-display ${getComboClass()}`}>
      <div className="combo-text">{getComboText()}</div>
      <div className="combo-multiplier">x{cascadeLevel}</div>
      
      {/* 콤보 레벨별 특수 효과 */}
      {cascadeLevel >= 3 && (
        <div className="combo-flames">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flame"
              style={{
                '--flame-delay': `${i * 0.1}s`,
                '--flame-angle': `${i * 90}deg`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}
      
      {cascadeLevel >= 5 && (
        <div className="combo-lightning">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="lightning-bolt"
              style={{
                '--bolt-delay': `${i * 0.2}s`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}
    </div>
  );
};
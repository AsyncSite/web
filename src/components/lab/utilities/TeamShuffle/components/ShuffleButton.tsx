import React, { useState } from 'react';
import './ShuffleButton.css';

interface ShuffleButtonProps {
    onClick: () => void;
    disabled: boolean;
    participantCount: number;
}

export const ShuffleButton: React.FC<ShuffleButtonProps> = ({ 
    onClick, 
    disabled, 
    participantCount 
}) => {
    const [isShuffling, setIsShuffling] = useState(false);

    const handleClick = async () => {
        if (disabled || isShuffling) return;
        
        setIsShuffling(true);
        
        // 애니메이션 시간 확보
        await new Promise(resolve => setTimeout(resolve, 800));
        
        onClick();
        
        // 추가 애니메이션 시간
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setIsShuffling(false);
    };

    return (
        <button 
            className={`shuffle-button ${isShuffling ? 'shuffling' : ''}`}
            disabled={disabled || isShuffling}
            onClick={handleClick}
        >
            {isShuffling ? (
                <>
                    <span className="shuffle-spinner"></span>
                    <span>팀을 나누는 중...</span>
                </>
            ) : (
                <>
                    <span className="shuffle-icon">🚀</span>
                    <span>팀 나누기!</span>
                </>
            )}
            
            {/* 리플 효과를 위한 요소 */}
            <span className="ripple"></span>
        </button>
    );
};
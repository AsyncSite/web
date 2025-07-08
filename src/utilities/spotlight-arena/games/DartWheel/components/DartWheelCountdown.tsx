import { useState, useEffect } from 'react';
import './DartWheelCountdown.css';

interface DartWheelCountdownProps {
  onDartWheelCountdownComplete: () => void;
  dartWheelCountdownDuration?: number;
}

function DartWheelCountdown({ 
  onDartWheelCountdownComplete,
  dartWheelCountdownDuration = 3 
}: DartWheelCountdownProps): React.ReactNode {
  const [dartWheelCountdownNumber, setDartWheelCountdownNumber] = useState(dartWheelCountdownDuration);

  useEffect(() => {
    if (dartWheelCountdownNumber > 0) {
      const dartWheelCountdownTimer = setTimeout(() => {
        setDartWheelCountdownNumber(dartWheelCountdownNumber - 1);
      }, 1000);
      return () => clearTimeout(dartWheelCountdownTimer);
    } else {
      const dartWheelCompleteTimer = setTimeout(() => {
        onDartWheelCountdownComplete();
      }, 500);
      return () => clearTimeout(dartWheelCompleteTimer);
    }
  }, [dartWheelCountdownNumber, onDartWheelCountdownComplete]);

  return (
    <div className="dart-wheel-countdown-overlay">
      <div className="dart-wheel-countdown-content">
        {dartWheelCountdownNumber > 0 ? (
          <div className="dart-wheel-countdown-number">
            {dartWheelCountdownNumber}
          </div>
        ) : (
          <div className="dart-wheel-countdown-start">
            SPIN!
          </div>
        )}
        <div className="dart-wheel-countdown-message">
          다트휠 게임이 곧 시작됩니다
        </div>
      </div>
    </div>
  );
}

export default DartWheelCountdown;
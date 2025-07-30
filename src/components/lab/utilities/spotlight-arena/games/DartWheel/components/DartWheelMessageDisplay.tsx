import { useEffect, useState } from 'react';
import { DartWheelSpinResult } from '../types/dartWheel';
import { dartWheelGetResultMessage } from '../utils/dartWheelMessages';
import './DartWheelMessageDisplay.css';

interface DartWheelMessageDisplayProps {
  dartWheelLatestResult: DartWheelSpinResult | null;
  dartWheelIsSpinning: boolean;
}

function DartWheelMessageDisplay({ 
  dartWheelLatestResult,
  dartWheelIsSpinning
}: DartWheelMessageDisplayProps): React.ReactNode {
  const [dartWheelDisplayMessage, setDartWheelDisplayMessage] = useState<string>('');
  const [dartWheelShowAnimation, setDartWheelShowAnimation] = useState(false);

  useEffect(() => {
    if (dartWheelLatestResult) {
      const message = dartWheelGetResultMessage(
        dartWheelLatestResult.participant,
        dartWheelLatestResult.section
      );
      setDartWheelDisplayMessage(message);
      setDartWheelShowAnimation(true);
      
      // 애니메이션 리셋
      const timer = setTimeout(() => {
        setDartWheelShowAnimation(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [dartWheelLatestResult]);

  if (!dartWheelDisplayMessage && !dartWheelIsSpinning) {
    return null;
  }

  return (
    <div className={`dart-wheel-message-display ${dartWheelShowAnimation ? 'dart-wheel-message-show' : ''}`}>
      {dartWheelIsSpinning ? (
        <div className="dart-wheel-message-spinning">
          휠이 돌아가는 중...
        </div>
      ) : (
        <div className="dart-wheel-message-result">
          {dartWheelDisplayMessage}
        </div>
      )}
    </div>
  );
}

export default DartWheelMessageDisplay;
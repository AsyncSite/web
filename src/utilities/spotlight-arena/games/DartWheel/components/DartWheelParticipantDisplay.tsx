import { Participant } from '../../../../../components/lab/utilities/spotlight-arena/shared/types';
import './DartWheelParticipantDisplay.css';

interface DartWheelParticipantDisplayProps {
  dartWheelCurrentParticipant: Participant | null;
  dartWheelParticipantsList: Participant[];
  dartWheelCurrentIndex: number;
  dartWheelIsSpinning: boolean;
}

function DartWheelParticipantDisplay({
  dartWheelCurrentParticipant,
  dartWheelParticipantsList,
  dartWheelCurrentIndex,
  dartWheelIsSpinning
}: DartWheelParticipantDisplayProps): React.ReactNode {
  return (
    <div className="dart-wheel-participant-display">
      <div className="dart-wheel-participant-header">
        <h3 className="dart-wheel-participant-title">현재 참가자</h3>
        <div className="dart-wheel-participant-progress">
          {dartWheelCurrentIndex + 1} / {dartWheelParticipantsList.length}
        </div>
      </div>
      
      {dartWheelCurrentParticipant && (
        <div className={`dart-wheel-participant-info ${dartWheelIsSpinning ? 'dart-wheel-spinning' : ''}`}>
          <div className="dart-wheel-participant-name">
            {dartWheelCurrentParticipant.name}
          </div>
          <div className="dart-wheel-participant-status">
            {dartWheelIsSpinning ? '휠을 돌리는 중...' : '준비됨'}
          </div>
        </div>
      )}
      
      <div className="dart-wheel-participant-queue">
        <h4 className="dart-wheel-queue-title">대기 중인 참가자</h4>
        <div className="dart-wheel-queue-list">
          {dartWheelParticipantsList
            .slice(dartWheelCurrentIndex + 1)
            .map((participant) => (
              <div 
                key={`dart-wheel-queue-${participant.id}`} 
                className="dart-wheel-queue-item"
              >
                {participant.name}
              </div>
            ))}
          {dartWheelCurrentIndex === dartWheelParticipantsList.length - 1 && (
            <div className="dart-wheel-queue-empty">
              마지막 참가자입니다
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DartWheelParticipantDisplay;
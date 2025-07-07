import { Participant } from '../../../../utilities/spotlight-arena/shared/types';
import ParticipantInput from '../../../../utilities/spotlight-arena/common/ParticipantInput';

interface LobbyStepProps {
  participants: Participant[];
  winnerCount: number;
  onParticipantsChange: (participants: Participant[]) => void;
  onWinnerCountChange: (count: number) => void;
  onNext: () => void;
  onBackToLab: () => void;
  onViewStats: () => void;
}

function LobbyStep({
  participants,
  winnerCount,
  onParticipantsChange,
  onWinnerCountChange,
  onNext,
  onBackToLab,
  onViewStats,
}: LobbyStepProps): React.ReactNode {
  return (
    <div className="lobby-section sa-card">
      <button className="arena-back-button" onClick={onBackToLab}>
        ← Lab으로 돌아가기
      </button>
      <div className="lobby-header">
        <div>
          <h1 className="arena-title">🎮 스포트라이트 아레나</h1>
          <p className="arena-subtitle">다양한 미니게임으로 추첨을 재미있게!</p>
        </div>
        <button className="sa-button sa-button-secondary" onClick={onViewStats}>
          📊 통계 대시보드
        </button>
      </div>

      <div className="lobby-content">
        <div className="participant-section">
          <h2>👥 참가자 명단</h2>
          <ParticipantInput onParticipantsChange={onParticipantsChange} maxParticipants={20} />
        </div>

        <div className="settings-section">
          <h2>⚙️ 추첨 설정</h2>
          <div className="setting-item">
            <label>추첨 인원:</label>
            <input
              type="number"
              min="1"
              max={Math.max(1, participants.length)}
              value={winnerCount}
              onChange={(e) => onWinnerCountChange(Number(e.target.value))}
            />
            <span>명</span>
          </div>
        </div>
      </div>

      <button
        className="next-button sa-button sa-button-primary"
        onClick={onNext}
        disabled={participants.length < 2}
      >
        다음: 게임 선택하기 ➡️
      </button>
    </div>
  );
}

export default LobbyStep;

import { Participant } from '../../../../components/lab/utilities/spotlight-arena/shared/types';
import ParticipantInput from '../../../../components/lab/utilities/spotlight-arena/common/ParticipantInput';

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
}: LobbyStepProps): React.ReactElement {
  return (
    <div className="lobby-section sa-card">
      <button className="sa-arena-back-button" onClick={onBackToLab}>
        ← Lab으로 돌아가기
      </button>
      <div className="lobby-header">
        <div>
          <h1 className="sa-arena-title">🎮 스포트라이트 아레나</h1>
          <p className="sa-arena-subtitle">다양한 미니게임으로 추첨을 재미있게!</p>
        </div>
        <button className="sa-button sa-button-secondary" onClick={onViewStats}>
          📊 통계 대시보드
        </button>
      </div>

      <div className="lobby-content">
        <div className="sa-participant-section">
          <h2>👥 참가자 명단</h2>
          <ParticipantInput onParticipantsChange={onParticipantsChange} maxParticipants={20} />
        </div>

        <div className="sa-settings-section">
          <h2>⚙️ 추첨 설정</h2>
          <div className="sa-winner-count-section">
            <label className="sa-setting-label">추첨 인원</label>
            <div className="sa-winner-count-display">
              <span className="sa-winner-count-number">{winnerCount}</span>
              <span className="sa-winner-count-unit">명</span>
            </div>
            <div className="sa-winner-count-controls">
              <input
                type="range"
                className="sa-winner-count-slider"
                min="1"
                max={Math.max(1, participants.length)}
                value={winnerCount}
                onChange={(e) => onWinnerCountChange(Number(e.target.value))}
                disabled={participants.length === 0}
              />
              <div className="sa-winner-count-marks">
                <span>1</span>
                <span>{Math.max(1, Math.floor(participants.length / 2))}</span>
                <span>{Math.max(1, participants.length)}</span>
              </div>
            </div>
            {participants.length === 0 && (
              <p className="sa-winner-count-hint">참가자를 먼저 입력해주세요</p>
            )}
          </div>
        </div>
      </div>

      <button className="sa-arena-next-button" onClick={onNext} disabled={participants.length < 2}>
        다음: 게임 선택하기 ➡️
      </button>
    </div>
  );
}

export default LobbyStep;

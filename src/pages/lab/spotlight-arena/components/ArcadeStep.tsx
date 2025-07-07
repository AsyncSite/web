import { Participant } from '../../../../components/lab/utilities/spotlight-arena/shared/types';
import { GAMES_LIST } from '../../../../components/lab/utilities/spotlight-arena/shared/utils';
import GameCard from '../../../../components/lab/utilities/spotlight-arena/common/GameCard';

interface ArcadeStepProps {
  participants: Participant[];
  onGameSelect: (gameId: string) => void;
  onBack: () => void;
}

function ArcadeStep({ participants, onGameSelect, onBack }: ArcadeStepProps): React.ReactNode {
  return (
    <div className="arcade-section sa-card">
      <button className="sa-arcade-back-button" onClick={onBack}>
        ← 뒤로가기
      </button>

      <h1 className="sa-arcade-title">✨ 어떤 게임으로 추첨할까요?</h1>
      <p className="sa-arcade-subtitle">현재 {participants.length}명이 참가합니다</p>

      <div className="games-grid">
        {GAMES_LIST.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onClick={() => onGameSelect(game.id)}
            participantCount={participants.length}
          />
        ))}
      </div>
    </div>
  );
}

export default ArcadeStep;

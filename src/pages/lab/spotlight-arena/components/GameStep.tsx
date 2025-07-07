import { useState } from 'react';
import Lottie from 'lottie-react';
import { Participant } from '../../../../components/lab/utilities/spotlight-arena/shared/types';
import { LottieAnimationData } from '../types/animation';
import SnailRaceGame from '../../../../components/lab/utilities/spotlight-arena/games/SnailRace/SnailRaceGame';

interface GameStepProps {
  selectedGame: string;
  participants: Participant[];
  winnerCount: number;
  snailAnimation: LottieAnimationData | null;
  onBackToLobby: () => void;
  onBackToArcade: () => void;
}

function GameStep({
  selectedGame,
  participants,
  winnerCount,
  snailAnimation,
  onBackToLobby,
  onBackToArcade,
}: GameStepProps): React.ReactNode {
  const [showSnailIntro, setShowSnailIntro] = useState(true);
  const [gameKey, setGameKey] = useState(0);

  if (selectedGame !== 'snail-race') {
    return null;
  }

  return (
    <div className="game-section sa-card">
      {showSnailIntro ? (
        <>
          <button className="back-button" onClick={onBackToArcade}>
            ← 게임 선택으로
          </button>

          <div className="snail-race-container">
            <h2 className="snail-race-title">🐌 달팽이 레이스</h2>

            <div className="snail-animation-wrapper">
              {snailAnimation && (
                <div className="snail-animation-container">
                  <Lottie
                    animationData={snailAnimation}
                    loop={true}
                    autoplay={true}
                    style={{ width: '300px', height: '300px' }}
                  />
                </div>
              )}
            </div>

            <div className="snail-race-info">
              <p className="snail-race-description">
                세상에서 가장 느린 레이스, 그러나 가장 예측 불가능한 결과!
              </p>
              <div className="race-details">
                <div className="race-detail-item">
                  <span className="detail-label">참가자</span>
                  <span className="detail-value">{participants.length}명</span>
                </div>
                <div className="race-detail-item">
                  <span className="detail-label">추첨 인원</span>
                  <span className="detail-value">{winnerCount}명</span>
                </div>
              </div>

              <button
                className="start-race-button sa-button sa-button-primary"
                onClick={() => setShowSnailIntro(false)}
              >
                🏁 레이스 시작하기
              </button>
            </div>
          </div>
        </>
      ) : (
        <SnailRaceGame
          key={gameKey}
          participants={participants}
          winnerCount={winnerCount}
          onBack={() => {
            setShowSnailIntro(true);
            onBackToLobby();
          }}
          onReplay={() => {
            setShowSnailIntro(true);
            setGameKey((prev) => prev + 1);
            setTimeout(() => setShowSnailIntro(false), 100);
          }}
          onNewGame={() => {
            setShowSnailIntro(true);
            onBackToArcade();
          }}
        />
      )}
    </div>
  );
}

export default GameStep;

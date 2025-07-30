import { useState } from 'react';
import Lottie from 'lottie-react';
import { Participant } from '../../../../components/lab/utilities/spotlight-arena/shared/types';
import { LottieAnimationData } from '../types/animation';
import SnailRaceGame from '../../../../components/lab/utilities/spotlight-arena/games/SnailRace/SnailRaceGame';
import { DartWheelGame } from '../../../../components/lab/utilities/spotlight-arena/games/DartWheel';
import { SlotCascadeGame } from '../../../../components/lab/utilities/spotlight-arena/games/SlotCascade';

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
}: GameStepProps): React.ReactElement {
  const [showSnailIntro, setShowSnailIntro] = useState(true);
  const [gameKey, setGameKey] = useState(0);

  // DartWheel 게임인 경우
  if (selectedGame === 'dart-wheel') {
    return (
      <div className="game-section sa-card">
        <DartWheelGame
          participants={participants}
          winnerCount={winnerCount}
          onBack={onBackToLobby}
          onReplay={() => {
            setGameKey((prev) => prev + 1);
          }}
          onNewGame={onBackToArcade}
        />
      </div>
    );
  }

  // SlotCascade 게임인 경우
  if (selectedGame === 'slot-cascade') {
    return (
      <div className="game-section sa-card">
        <SlotCascadeGame
          participants={participants}
          winnerCount={winnerCount}
          onBack={onBackToLobby}
          onReplay={() => {
            setGameKey((prev) => prev + 1);
          }}
          onNewGame={onBackToArcade}
        />
      </div>
    );
  }

  // SnailRace 게임이 아닌 경우
  if (selectedGame !== 'snail-race') {
    return <div>게임을 준비 중입니다...</div>;
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

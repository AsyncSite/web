import { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import { SpotlightArenaProvider } from '../../../components/lab/spotlight-arena/shared/contexts';
import { Participant } from '../../../components/lab/spotlight-arena/shared/types';
import { GAMES_LIST } from '../../../components/lab/spotlight-arena/shared/utils';
import ParticipantInput from '../../../components/lab/spotlight-arena/common/ParticipantInput';
import GameCard from '../../../components/lab/spotlight-arena/common/GameCard';
import SnailRaceGame from '../../../components/lab/spotlight-arena/games/SnailRace/SnailRaceGame';
import snail1Animation from '../../../assets/animations/snail/snail_1.json';
import snail2Animation from '../../../assets/animations/snail/snail_2.json';
import './SpotlightArenaPage.css';

type Step = 'lobby' | 'arcade' | 'game';

const SpotlightArenaContent = () => {
  const [currentStep, setCurrentStep] = useState<Step>('lobby');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [winnerCount, setWinnerCount] = useState(1);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [snailAnimation, setSnailAnimation] = useState<any>(null);
  const [showSnailIntro, setShowSnailIntro] = useState(true);

  const snailAnimations = [snail1Animation, snail2Animation];

  useEffect(() => {
    // 달팽이 애니메이션 로드 (한 번만 랜덤 선택)
    if (selectedGame === 'snail-race' && !snailAnimation) {
      // 랜덤으로 달팽이 애니메이션 선택
      const randomIndex = Math.floor(Math.random() * snailAnimations.length);
      setSnailAnimation(snailAnimations[randomIndex]);
    }
  }, [selectedGame, snailAnimation, snailAnimations]);

  const handleParticipantsChange = (newParticipants: Participant[]) => {
    setParticipants(newParticipants);
  };

  const handleNextToArcade = () => {
    if (participants.length >= 2) {
      setCurrentStep('arcade');
    }
  };

  const handleGameSelect = (gameId: string) => {
    setSelectedGame(gameId);
    setCurrentStep('game');
  };

  const handleBackToLobby = () => {
    setCurrentStep('lobby');
    setSelectedGame(null);
  };

  const handleBackToArcade = () => {
    setCurrentStep('arcade');
    setSelectedGame(null);
    setSnailAnimation(null); // 애니메이션 초기화하여 다시 선택 시 새로운 랜덤 달팽이 로드
  };

  return (
    <div className="spotlight-arena">
      <div className="spotlight-arena-container">
        {currentStep === 'lobby' && (
          <div className="lobby-section sa-card">
            <h1 className="arena-title">🎮 스포트라이트 아레나</h1>
            <p className="arena-subtitle">다양한 미니게임으로 추첨을 재미있게!</p>
            
            <div className="lobby-content">
              <div className="participant-section">
                <h2>👥 참가자 명단</h2>
                <ParticipantInput 
                  onParticipantsChange={handleParticipantsChange}
                  maxParticipants={20}
                />
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
                    onChange={(e) => setWinnerCount(Number(e.target.value))}
                  />
                  <span>명</span>
                </div>
              </div>
            </div>
            
            <button
              className="next-button sa-button sa-button-primary"
              onClick={handleNextToArcade}
              disabled={participants.length < 2}
            >
              다음: 게임 선택하기 ➡️
            </button>
          </div>
        )}

        {currentStep === 'arcade' && (
          <div className="arcade-section sa-card">
            <button className="back-button" onClick={handleBackToLobby}>
              ← 뒤로가기
            </button>
            
            <h1 className="arcade-title">✨ 어떤 게임으로 추첨할까요?</h1>
            <p className="arcade-subtitle">
              현재 {participants.length}명이 참가합니다
            </p>
            
            <div className="games-grid">
              {GAMES_LIST.map(game => (
                <GameCard
                  key={game.id}
                  game={game}
                  onClick={() => handleGameSelect(game.id)}
                  participantCount={participants.length}
                />
              ))}
            </div>
          </div>
        )}

        {currentStep === 'game' && selectedGame === 'snail-race' && (
          <div className="game-section sa-card">
            {showSnailIntro ? (
              <>
                <button className="back-button" onClick={handleBackToArcade}>
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
                participants={participants}
                winnerCount={winnerCount}
                onBack={() => {
                  setShowSnailIntro(true);
                  handleBackToArcade();
                }}
                onReplay={() => {
                  // 같은 참가자로 다시 시작
                  setShowSnailIntro(false);
                }}
                onNewGame={() => {
                  // 새로운 게임 선택
                  setShowSnailIntro(true);
                  handleBackToArcade();
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const SpotlightArenaPage = () => {
  return (
    <SpotlightArenaProvider>
      <SpotlightArenaContent />
    </SpotlightArenaProvider>
  );
};

export default SpotlightArenaPage;
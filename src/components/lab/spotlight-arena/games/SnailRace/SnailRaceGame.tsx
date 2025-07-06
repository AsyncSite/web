import { useState, useEffect, useCallback } from 'react';
import { Participant, SnailRaceState, Snail } from '../../shared/types';
import { SNAIL_COLORS } from './utils/snailColors';
import { getEventCommentary } from './utils/commentaryMessages';
import RaceTrack from './components/RaceTrack';
import RaceCountdown from './components/RaceCountdown';
import EventNotification from './components/EventNotification';
import RaceCommentary from './components/RaceCommentary';
import ResultDisplay from '../../common/ResultDisplay';
import './SnailRaceGame.css';

interface SnailRaceGameProps {
  participants: Participant[];
  winnerCount: number;
  onBack: () => void;
  onReplay: () => void;
  onNewGame: () => void;
}

const SnailRaceGame: React.FC<SnailRaceGameProps> = ({
  participants,
  winnerCount,
  onBack,
  onReplay,
  onNewGame
}) => {
  const [gameState, setGameState] = useState<SnailRaceState>({
    status: 'waiting',
    winners: [],
    settings: {
      participants,
      winnerCount,
      allowDuplicates: false
    },
    snails: [],
    trackLength: 100,
    elapsedTime: 0,
    events: []
  });

  const [showCountdown, setShowCountdown] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<{ snailId: string; eventName: string } | null>(null);
  const [commentaryMessages, setCommentaryMessages] = useState<Array<{ id: string; text: string; timestamp: number }>>([]);

  // 게임 초기화
  useEffect(() => {
    const snails: Snail[] = participants.map((participant, index) => ({
      id: participant.id,
      participant,
      position: 0,
      speed: 0,
      baseSpeed: 2 + Math.random() * 3, // 2.0 ~ 5.0
      color: SNAIL_COLORS[index % SNAIL_COLORS.length],
      activeEvent: undefined
    }));

    setGameState(prev => ({ ...prev, snails }));
  }, [participants]);

  const handleStartGame = () => {
    setShowCountdown(true);
  };

  const handleCountdownComplete = () => {
    setShowCountdown(false);
    setGameState(prev => ({ ...prev, status: 'playing' }));
    addCommentary('🏁 레이스가 시작되었습니다! 모든 달팽이들이 출발합니다!');
  };

  const addCommentary = useCallback((text: string) => {
    setCommentaryMessages(prev => [...prev, {
      id: `msg-${Date.now()}-${Math.random()}`,
      text,
      timestamp: Date.now()
    }]);
  }, []);

  const handleRaceComplete = (winners: Participant[]) => {
    setGameState(prev => ({ 
      ...prev, 
      status: 'finished',
      winners 
    }));
  };

  const handleEventTrigger = (snailId: string, eventName: string) => {
    const snail = gameState.snails.find(s => s.id === snailId);
    if (snail) {
      setCurrentEvent({ snailId, eventName });
      setTimeout(() => setCurrentEvent(null), 2000);
      
      // 중계 메시지 추가
      const commentary = getEventCommentary(snail.participant.name, eventName);
      addCommentary(commentary);
    }
  };

  if (gameState.status === 'finished') {
    return (
      <ResultDisplay
        winners={gameState.winners}
        gameName="달팽이 레이스"
        onReplay={onReplay}
        onNewGame={onNewGame}
        onGoHome={onBack}
      />
    );
  }

  return (
    <div className="snail-race-game">
      <div className="game-header">
        <button className="back-button" onClick={onBack}>
          ← 뒤로가기
        </button>
        <h2 className="game-title">🐌 달팽이 레이스</h2>
      </div>

      <div className="game-content">
        {showCountdown && (
          <RaceCountdown onComplete={handleCountdownComplete} />
        )}

        {currentEvent && (
          <EventNotification
            snailName={gameState.snails.find(s => s.id === currentEvent.snailId)?.participant.name || ''}
            eventName={currentEvent.eventName}
          />
        )}

        <RaceTrack
          gameState={gameState}
          isPlaying={gameState.status === 'playing'}
          onRaceComplete={handleRaceComplete}
          onEventTrigger={handleEventTrigger}
        />

        <RaceCommentary messages={commentaryMessages} />

        {gameState.status === 'waiting' && (
          <div className="game-controls">
            <button 
              className="start-button sa-button sa-button-primary"
              onClick={handleStartGame}
            >
              🏁 레이스 시작하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SnailRaceGame;
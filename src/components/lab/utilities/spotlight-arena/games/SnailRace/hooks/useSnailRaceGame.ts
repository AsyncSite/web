import { useState, useEffect, useCallback } from 'react';
import { Participant, SnailRaceState, Snail } from '../../../shared/types';
import { SNAIL_COLORS } from '../utils/snailColors';
import { getEventCommentary } from '../utils/commentaryMessages';
import { gameHistoryService, participantStatsService } from '../../../shared/services';
import { GameResult } from '../../../shared/types/storage';

interface UseSnailRaceGameProps {
  participants: Participant[];
  winnerCount: number;
}

interface CommentaryMessage {
  id: string;
  text: string;
  timestamp: number;
}

interface CurrentEvent {
  snailId: string;
  eventName: string;
}

export function useSnailRaceGame({ participants, winnerCount }: UseSnailRaceGameProps) {
  const [gameState, setGameState] = useState<SnailRaceState>({
    status: 'waiting',
    winners: [],
    settings: {
      participants,
      winnerCount,
      allowDuplicates: false,
    },
    snails: [],
    trackLength: 100,
    elapsedTime: 0,
    events: [],
  });

  const [showCountdown, setShowCountdown] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<CurrentEvent | null>(null);
  const [commentaryMessages, setCommentaryMessages] = useState<CommentaryMessage[]>([]);
  const [gameStartTime, setGameStartTime] = useState<number>(0);

  // 게임 초기화
  useEffect(() => {
    const snails: Snail[] = participants.map((participant, index) => ({
      id: participant.id,
      participant,
      position: 0,
      speed: 0,
      baseSpeed: 2 + Math.random() * 3, // 2.0 ~ 5.0
      color: SNAIL_COLORS[index % SNAIL_COLORS.length],
      activeEvent: undefined,
    }));

    setGameState((prev) => ({ ...prev, snails }));
  }, [participants]);

  const addCommentary = useCallback((text: string) => {
    setCommentaryMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}-${Math.random()}`,
        text,
        timestamp: Date.now(),
      },
    ]);
  }, []);

  const handleStartGame = useCallback(() => {
    // 새 게임 시작 시 이전 녹화 데이터 정리
    localStorage.removeItem('snailRaceRecording');
    localStorage.removeItem('snailRaceRecordingTime');

    setShowCountdown(true);
  }, []);

  const handleCountdownComplete = useCallback(() => {
    setShowCountdown(false);
    setGameStartTime(Date.now());
    setGameState((prev) => ({ ...prev, status: 'playing' }));
    addCommentary('🏁 레이스가 시작되었습니다! 모든 달팽이들이 출발합니다!');
  }, [addCommentary]);

  const handleRaceComplete = useCallback(
    (winners: Participant[]) => {
      const gameResult: GameResult = {
        gameType: 'snail-race',
        participants,
        winners,
        gameConfig: {
          winnerCount,
          trackLength: gameState.trackLength,
        },
        startTime: gameStartTime,
        endTime: Date.now(),
      };

      // 히스토리 및 통계 업데이트
      try {
        gameHistoryService.saveGameResult(gameResult);
        participantStatsService.updateStats(gameResult);
      } catch (error) {
        // Failed to save game result
      }

      setGameState((prev) => ({
        ...prev,
        status: 'finished',
        winners,
      }));
    },
    [participants, winnerCount, gameState.trackLength, gameStartTime],
  );

  const handleEventTrigger = useCallback(
    (snailId: string, eventName: string) => {
      const snail = gameState.snails.find((s) => s.id === snailId);
      if (snail) {
        setCurrentEvent({ snailId, eventName });
        setTimeout(() => setCurrentEvent(null), 2000);

        // 중계 메시지 추가
        const commentary = getEventCommentary(snail.participant.name, eventName);
        addCommentary(commentary);
      }
    },
    [gameState.snails, addCommentary],
  );

  return {
    gameState,
    showCountdown,
    currentEvent,
    commentaryMessages,
    handlers: {
      handleStartGame,
      handleCountdownComplete,
      handleRaceComplete,
      handleEventTrigger,
    },
  };
}

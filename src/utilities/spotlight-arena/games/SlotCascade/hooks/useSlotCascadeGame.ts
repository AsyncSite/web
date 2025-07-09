import { useState, useEffect, useCallback } from 'react';
import { Participant } from '../../../../../components/lab/utilities/spotlight-arena/shared/types';
import { GameStatus, SlotCascadeGameState, PlayerState, DEFAULT_GAME_CONFIG } from '../types/game';
import { SymbolType } from '../types/symbol';
import { generateInitialGrid } from '../utils/symbolUtils';
import { findAllMatches } from '../utils/matchingUtils';
import { processCascade, getCascadeMultiplier, getCascadeBonus } from '../utils/cascadeUtils';
import { applySpecialEffects } from '../utils/specialEffectUtils';

interface UseSlotCascadeGameProps {
  participants: Participant[];
  onGameEnd: (winner: Participant) => void;
}

export const useSlotCascadeGame = ({ participants, onGameEnd }: UseSlotCascadeGameProps) => {
  const [gameState, setGameState] = useState<SlotCascadeGameState>({
    status: 'waiting',
    players: [],
    remainingTime: DEFAULT_GAME_CONFIG.gameDuration,
    config: DEFAULT_GAME_CONFIG,
    specialEventActive: null,
  });

  // 게임 초기화
  const initializeGame = useCallback(() => {
    const players: PlayerState[] = participants.map(participant => ({
      id: participant.id,
      name: participant.name,
      score: 0,
      grid: generateInitialGrid(DEFAULT_GAME_CONFIG.gridSize),
      cascadeLevel: 0,
      isSpinning: false,
    }));

    setGameState({
      status: 'waiting',
      players,
      remainingTime: DEFAULT_GAME_CONFIG.gameDuration,
      config: DEFAULT_GAME_CONFIG,
      specialEventActive: null,
    });
  }, [participants]);

  // 게임 시작
  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      status: 'playing',
    }));
  }, []);

  // 플레이어 스핀
  const spinPlayerSlot = useCallback((playerId: string) => {
    setGameState(prev => {
      if (prev.status !== 'playing') return prev;

      const newPlayers = prev.players.map(player => {
        if (player.id === playerId && !player.isSpinning) {
          return {
            ...player,
            isSpinning: true,
          };
        }
        return player;
      });

      return { ...prev, players: newPlayers };
    });

    // 스핀 애니메이션 후 결과 처리
    setTimeout(() => {
      processSpinResult(playerId);
    }, 1000);
  }, []);

  // 캐스케이드 처리
  const processCascadeForPlayer = useCallback(async (playerId: string, grid: (SymbolType | null)[][]) => {
    let currentGrid = grid;
    let totalScore = 0;
    let cascadeLevel = 0;

    // 캐스케이드 루프
    while (true) {
      const matches = findAllMatches(currentGrid);
      if (matches.length === 0) break;

      // 특수 심볼 효과 적용
      const specialEffectsResult = applySpecialEffects(currentGrid, matches);
      
      // 점수 계산 (배율 적용)
      const multiplier = getCascadeMultiplier(cascadeLevel);
      const bonus = getCascadeBonus(cascadeLevel);
      const baseScore = matches.reduce((sum, match) => sum + match.points, 0);
      const stepScore = (baseScore + specialEffectsResult.bonusPoints) * multiplier + bonus;
      totalScore += stepScore;

      // 제거할 위치 수집 (특수 효과 포함)
      const removingPositions = [
        ...matches.flatMap(match => match.positions),
        ...specialEffectsResult.additionalRemovals
      ];
      
      // 중복 제거
      const uniqueRemovingPositions = Array.from(
        new Map(removingPositions.map(pos => [`${pos.row},${pos.col}`, pos])).values()
      );

      // 제거 애니메이션 상태 설정
      setGameState(prev => {
        const playerIndex = prev.players.findIndex(p => p.id === playerId);
        if (playerIndex === -1) return prev;

        const newPlayers = [...prev.players];
        newPlayers[playerIndex] = {
          ...newPlayers[playerIndex],
          animationState: {
            removingPositions: uniqueRemovingPositions.map(pos => ({ row: pos.row, col: pos.col })),
            fallingPositions: [],
            newPositions: [],
          },
          specialEffects: specialEffectsResult.specialEffects,
        };

        return { ...prev, players: newPlayers };
      });

      // 제거 애니메이션 대기
      await new Promise(resolve => setTimeout(resolve, 300));

      // 매칭된 심볼 제거하고 캐스케이드 처리
      const gridAfterRemoval = currentGrid.map(row => [...row]);
      uniqueRemovingPositions.forEach(pos => {
        gridAfterRemoval[pos.row][pos.col] = null;
      });

      // 캐스케이드 (중력 + 새 심볼)
      const cascadeResult = processCascade(gridAfterRemoval);

      // 떨어지기 애니메이션 상태 설정
      setGameState(prev => {
        const playerIndex = prev.players.findIndex(p => p.id === playerId);
        if (playerIndex === -1) return prev;

        const newPlayers = [...prev.players];
        newPlayers[playerIndex] = {
          ...newPlayers[playerIndex],
          grid: gridAfterRemoval, // 빈 그리드 먼저 표시
          cascadeLevel,
          score: newPlayers[playerIndex].score + stepScore,
          animationState: {
            removingPositions: [],
            fallingPositions: cascadeResult.droppedPositions,
            newPositions: cascadeResult.newSymbolPositions,
          },
        };

        return { ...prev, players: newPlayers };
      });

      // 떨어지기 애니메이션 대기
      await new Promise(resolve => setTimeout(resolve, 400));

      // 최종 그리드 업데이트
      currentGrid = cascadeResult.grid;
      cascadeLevel++;

      setGameState(prev => {
        const playerIndex = prev.players.findIndex(p => p.id === playerId);
        if (playerIndex === -1) return prev;

        const newPlayers = [...prev.players];
        newPlayers[playerIndex] = {
          ...newPlayers[playerIndex],
          grid: currentGrid,
          animationState: undefined,
          specialEffects: undefined,
        };

        return { ...prev, players: newPlayers };
      });

      // 다음 캐스케이드 전 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // 최종 상태 업데이트
    setGameState(prev => {
      const playerIndex = prev.players.findIndex(p => p.id === playerId);
      if (playerIndex === -1) return prev;

      const newPlayers = [...prev.players];
      newPlayers[playerIndex] = {
        ...newPlayers[playerIndex],
        cascadeLevel: 0,
        animationState: undefined,
      };

      return { ...prev, players: newPlayers };
    });
  }, []);

  // 스핀 결과 처리
  const processSpinResult = useCallback(async (playerId: string) => {
    // 새 그리드 생성
    const newGrid = generateInitialGrid(DEFAULT_GAME_CONFIG.gridSize);
    
    setGameState(prev => {
      const playerIndex = prev.players.findIndex(p => p.id === playerId);
      if (playerIndex === -1) return prev;

      const newPlayers = [...prev.players];
      const player = { ...newPlayers[playerIndex] };
      
      player.grid = newGrid;
      player.isSpinning = false;
      player.cascadeLevel = 0;

      newPlayers[playerIndex] = player;
      return { ...prev, players: newPlayers };
    });

    // 캐스케이드 처리 시작
    await processCascadeForPlayer(playerId, newGrid);
  }, [processCascadeForPlayer]);

  // 타이머 업데이트
  useEffect(() => {
    if (gameState.status !== 'playing') return;

    const timer = setInterval(() => {
      setGameState(prev => {
        const newTime = prev.remainingTime - 1;
        
        if (newTime <= 0) {
          // 게임 종료
          const winner = [...prev.players].sort((a, b) => b.score - a.score)[0];
          const winnerParticipant = participants.find(p => p.id === winner.id);
          if (winnerParticipant) {
            onGameEnd(winnerParticipant);
          }
          
          return {
            ...prev,
            status: 'finished',
            remainingTime: 0,
          };
        }

        return {
          ...prev,
          remainingTime: newTime,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.status, participants, onGameEnd]);

  // 게임 초기화 (참가자 변경 시)
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  return {
    gameState,
    startGame,
    spinPlayerSlot,
  };
};
import { useState, useEffect, useCallback, useRef } from 'react';
import { Participant } from '../../../../../components/lab/utilities/spotlight-arena/shared/types';
import { GameStatus, SlotCascadeGameState, PlayerState, DEFAULT_GAME_CONFIG } from '../types/game';
import { SymbolType } from '../types/symbol';
import { generateInitialGrid } from '../utils/symbolUtils';
import { findAllMatches } from '../utils/matchingUtils';
import { processCascade, getCascadeMultiplier, getCascadeBonus } from '../utils/cascadeUtils';
import { applySpecialEffects, getMegaJackpotEffect } from '../utils/specialEffectUtils';
import { calculateUnderdogBoost, applyUnderdogBoostToCascade } from '../utils/underdogUtils';
import { determineNextEvent, createActiveEvent, calculateEventRemainingTime, getReversalChanceTargets, shouldApplyEventEffect } from '../utils/eventUtils';
import { EventType } from '../types/event';
import { PlayerBet, DEFAULT_BETTING_CONFIG, BettingState } from '../types/betting';
import { checkBetResult } from '../utils/bettingUtils';

interface UseSlotCascadeGameProps {
  participants: Participant[];
  winnerCount: number;
  onGameEnd: (winner: Participant) => void;
}

export const useSlotCascadeGame = ({ participants, winnerCount, onGameEnd }: UseSlotCascadeGameProps) => {
  const processBettingResultsRef = useRef<(() => void) | null>(null);
  
  const [gameState, setGameState] = useState<SlotCascadeGameState>({
    status: 'waiting',
    players: [],
    remainingTime: DEFAULT_GAME_CONFIG.gameDuration,
    config: DEFAULT_GAME_CONFIG,
    specialEventActive: null,
    lastEventTime: 0,
    nextSpinGuaranteedCascades: 0,
    eventScoreMultiplier: 1,
    specialSymbolOnlyMode: false,
    currentEvent: undefined,
    betting: {
      bets: [],
      totalBetAmount: 0,
      potentialPayout: 0,
      config: DEFAULT_BETTING_CONFIG,
      isBettingClosed: false,
    },
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
      remainingSpins: DEFAULT_GAME_CONFIG.maxSpinsPerPlayer,
      consecutiveFailures: 0,
      underdogBoost: 1.0,
      scoreUpdates: [],
      stats: {
        totalSpins: 0,
        totalCascades: 0,
        highestCombo: 0,
        specialSymbolsTriggered: {
          bomb: 0,
          star: 0,
          bonus: 0,
        },
      },
    }));

    setGameState({
      status: 'waiting',
      players,
      remainingTime: DEFAULT_GAME_CONFIG.gameDuration,
      config: DEFAULT_GAME_CONFIG,
      specialEventActive: null,
      lastEventTime: 0,
      nextSpinGuaranteedCascades: 0,
      eventScoreMultiplier: 1,
      specialSymbolOnlyMode: false,
      currentEvent: undefined,
      betting: {
        bets: [],
        totalBetAmount: 0,
        potentialPayout: 0,
        config: DEFAULT_BETTING_CONFIG,
        isBettingClosed: false,
      },
    });
  }, [participants]);

  // 게임 시작
  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      status: 'playing',
      betting: prev.betting ? {
        ...prev.betting,
        isBettingClosed: true,
      } : undefined,
    }));
  }, []);

  // 플레이어 스핀
  const spinPlayerSlot = useCallback((playerId: string) => {
    setGameState(prev => {
      if (prev.status !== 'playing') return prev;

      const playerIndex = prev.players.findIndex(p => p.id === playerId);
      if (playerIndex === -1) return prev;

      const player = prev.players[playerIndex];
      // 스핀 중이거나 남은 스핀이 없으면 불가
      if (player.isSpinning || player.remainingSpins <= 0) return prev;

      const newPlayers = prev.players.map((p, index) => {
        if (index === playerIndex) {
          return {
            ...p,
            isSpinning: true,
            remainingSpins: p.remainingSpins - 1,
            stats: {
              ...p.stats,
              totalSpins: p.stats.totalSpins + 1,
            },
          };
        }
        return p;
      });

      return { ...prev, players: newPlayers };
    });

    // 스핀 애니메이션 후 결과 처리
    setTimeout(() => {
      processSpinResult(playerId);
    }, 1000);
  }, []);

  // 캐스케이드 처리
  const processCascadeForPlayer = useCallback(async (playerId: string, grid: (SymbolType | null)[][], guaranteedCascades: number = 0) => {
    let currentGrid = grid;
    let totalScore = 0;
    let cascadeLevel = 0;
    let cascadesProcessed = 0;
    
    // 현재 플레이어의 언더독 부스트 계산
    const currentPlayer = gameState.players.find(p => p.id === playerId);
    const underdogBoost = currentPlayer ? calculateUnderdogBoost(currentPlayer, gameState.players) : 1.0;

    // 캐스케이드 루프
    while (true) {
      const matches = findAllMatches(currentGrid);
      
      // 보장된 캐스케이드가 남아있고 매칭이 없으면 강제로 매칭 생성
      if (matches.length === 0 && cascadesProcessed < guaranteedCascades) {
        // 중앙에 와일드카드 3개 배치하여 강제 매칭
        const center = Math.floor(gameState.config.gridSize / 2);
        currentGrid[center][0] = 'wild';
        currentGrid[center][1] = 'wild';
        currentGrid[center][2] = 'wild';
        continue;
      }
      
      if (matches.length === 0) break;

      // 1위 플레이어 점수 가져오기 (역전 심볼을 위해)
      const topScore = Math.max(...gameState.players.map(p => p.score));
      
      // 특수 심볼 효과 적용
      const specialEffectsResult = applySpecialEffects(currentGrid, matches, topScore);
      
      // 점수 계산 (언더독 부스트 및 이벤트 배율 적용)
      const baseMultiplier = getCascadeMultiplier(cascadeLevel);
      const multiplier = applyUnderdogBoostToCascade(baseMultiplier, underdogBoost) * gameState.eventScoreMultiplier;
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

      // 캐스케이드 (중력 + 새 심볼, 언더독 부스트 적용)
      const cascadeResult = processCascade(gridAfterRemoval, underdogBoost, gameState.specialSymbolOnlyMode);

      // 떨어지기 애니메이션 상태 설정
      setGameState(prev => {
        const playerIndex = prev.players.findIndex(p => p.id === playerId);
        if (playerIndex === -1) return prev;

        const newPlayers = [...prev.players];
        // 특수 심볼 통계 업데이트
        const stats = { ...newPlayers[playerIndex].stats };
        specialEffectsResult.specialEffects.forEach(effect => {
          if (effect.type === 'bomb') stats.specialSymbolsTriggered.bomb++;
          if (effect.type === 'star') stats.specialSymbolsTriggered.star++;
          if (effect.type === 'bonus') stats.specialSymbolsTriggered.bonus++;
        });
        stats.totalCascades++;
        stats.highestCombo = Math.max(stats.highestCombo, cascadeLevel + 1);

        newPlayers[playerIndex] = {
          ...newPlayers[playerIndex],
          grid: gridAfterRemoval, // 빈 그리드 먼저 표시
          cascadeLevel,
          score: newPlayers[playerIndex].score + stepScore,
          scoreUpdates: [
            ...newPlayers[playerIndex].scoreUpdates,
            {
              score: stepScore,
              multiplier,
              cascadeLevel,
              timestamp: Date.now(),
            },
          ],
          stats,
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
      
      // 처리된 캐스케이드 수 증가
      cascadesProcessed++;
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

      return { 
        ...prev, 
        players: newPlayers,
      };
    });
  }, [gameState.players]);

  // 스핀 결과 처리
  const processSpinResult = useCallback(async (playerId: string) => {
    // 현재 플레이어의 언더독 부스트 계산
    const currentPlayer = gameState.players.find(p => p.id === playerId);
    const underdogBoost = currentPlayer ? calculateUnderdogBoost(currentPlayer, gameState.players) : 1.0;
    
    // 새 그리드 생성 (언더독 부스트 및 특수 심볼 모드 적용)
    const newGrid = generateInitialGrid(DEFAULT_GAME_CONFIG.gridSize, underdogBoost, gameState.specialSymbolOnlyMode);
    
    // 메가 타임 이벤트 중이면 보장된 캐스케이드 사용
    let guaranteedCascades = 0;
    if (gameState.currentEvent?.type === 'megaTime' && gameState.nextSpinGuaranteedCascades > 0) {
      guaranteedCascades = gameState.nextSpinGuaranteedCascades;
      // 한 번 사용 후 초기화
      setGameState(prev => ({ ...prev, nextSpinGuaranteedCascades: 0 }));
    }
    
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

    // 매칭 확인하여 연속 실패 업데이트
    const initialMatches = findAllMatches(newGrid);
    const hasMatches = initialMatches.length > 0;
    
    setGameState(prev => {
      const playerIndex = prev.players.findIndex(p => p.id === playerId);
      if (playerIndex === -1) return prev;
      
      const newPlayers = [...prev.players];
      // 매칭이 없으면 연속 실패 증가, 있으면 초기화
      newPlayers[playerIndex].consecutiveFailures = hasMatches ? 0 : newPlayers[playerIndex].consecutiveFailures + 1;
      // 언더독 부스트 재계산
      newPlayers[playerIndex].underdogBoost = calculateUnderdogBoost(newPlayers[playerIndex], newPlayers);
      
      return { ...prev, players: newPlayers };
    });
    
    // 캐스케이드 처리 시작 (보장된 캐스케이드 포함)
    await processCascadeForPlayer(playerId, newGrid, guaranteedCascades);
  }, [processCascadeForPlayer, gameState.players, gameState.currentEvent, gameState.specialSymbolOnlyMode, gameState.nextSpinGuaranteedCascades]);

  // 타이머 및 이벤트 업데이트
  useEffect(() => {
    if (gameState.status !== 'playing') return;

    const timer = setInterval(() => {
      setGameState(prev => {
        const newTime = prev.remainingTime - 1;
        const elapsedTime = prev.config.gameDuration - newTime;
        
        // 게임 종료 체크 - 시간 종료 또는 모든 플레이어의 스핀 소진
        const allSpinsUsed = prev.players.every(p => p.remainingSpins <= 0);
        const anyPlayerSpinning = prev.players.some(p => p.isSpinning);
        
        // 스핀 중이 아니고, 시간이 종료되었거나 모든 스핀이 소진된 경우
        if (!anyPlayerSpinning && (newTime <= 0 || allSpinsUsed)) {
          // 베팅 결과 처리를 위해 setTimeout 사용
          setTimeout(() => {
            if (processBettingResultsRef.current) {
              processBettingResultsRef.current();
            }
          }, 0);
          
          return {
            ...prev,
            status: 'finished',
            remainingTime: 0,
          };
        }

        // 이벤트 업데이트
        let newState = { ...prev, remainingTime: newTime };
        
        // 현재 이벤트 시간 업데이트
        if (newState.currentEvent) {
          const remainingEventTime = calculateEventRemainingTime(newState.currentEvent);
          if (remainingEventTime <= 0) {
            // 이벤트 종료
            newState.currentEvent = undefined;
            newState.eventScoreMultiplier = 1;
            newState.specialSymbolOnlyMode = false;
          } else {
            newState.currentEvent.remainingTime = remainingEventTime;
          }
        }
        
        // 새 이벤트 트리거 체크 (30초마다, 파이널 카운트다운에서는 더 자주)
        const isFinalCountdown = newTime <= 30;
        const eventCheckInterval = isFinalCountdown ? 5 : 30;
        
        if (!newState.currentEvent && elapsedTime % eventCheckInterval === 0 && elapsedTime > 0) {
          const nextEvent = determineNextEvent(elapsedTime, prev.players, prev.lastEventTime, newTime);
          
          if (nextEvent) {
            newState.currentEvent = createActiveEvent(nextEvent);
            newState.lastEventTime = elapsedTime;
            
            // 이벤트별 효과 적용
            switch (nextEvent) {
              case 'goldenRush':
                newState.eventScoreMultiplier = 3;
                break;
                
              case 'symbolRain':
                newState.specialSymbolOnlyMode = true;
                break;
                
              case 'reversalChance':
                // 하위 3명에게 메가 잭팟 심볼 지급
                const targets = getReversalChanceTargets(prev.players);
                newState.players = prev.players.map(player => {
                  if (targets.includes(player.id)) {
                    // 그리드 중앙에 메가 잭팟 심볼 배치
                    const newGrid = [...player.grid.map(row => [...row])];
                    const center = Math.floor(prev.config.gridSize / 2);
                    newGrid[center][center] = 'megaJackpot';
                    return { ...player, grid: newGrid };
                  }
                  return player;
                });
                break;
                
              case 'megaTime':
                newState.nextSpinGuaranteedCascades = 10;
                break;
            }
          }
        }

        return newState;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.status, participants, onGameEnd]);

  // 게임 초기화 (참가자 변경 시)
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // 전체 플레이어 스핀
  const spinAllPlayers = useCallback(() => {
    // 스핀 가능한 모든 플레이어를 동시에 스핀
    gameState.players.forEach(player => {
      if (!player.isSpinning && player.remainingSpins > 0) {
        spinPlayerSlot(player.id);
      }
    });
  }, [gameState.players, spinPlayerSlot]);

  // 베팅 배치
  const placeBet = useCallback((bet: PlayerBet) => {
    setGameState(prev => {
      if (!prev.betting || prev.betting.isBettingClosed) return prev;
      
      const newBets = [...prev.betting.bets, bet];
      const totalBetAmount = newBets.reduce((sum, b) => sum + b.betAmount, 0);
      const potentialPayout = newBets.reduce((sum, b) => sum + (b.betAmount * b.odds), 0);
      
      return {
        ...prev,
        betting: {
          ...prev.betting,
          bets: newBets,
          totalBetAmount,
          potentialPayout,
        },
      };
    });
  }, []);

  // 베팅 결과 확인 및 처리
  const processBettingResults = useCallback(() => {
    if (!gameState.betting || gameState.betting.bets.length === 0) return;
    
    const results = gameState.betting.bets.map(bet => {
      const result = checkBetResult(bet, gameState.players, true);
      return {
        bet,
        ...result,
      };
    });
    
    // 베팅 결과를 플레이어 점수에 반영
    const updatedPlayers = gameState.players.map(player => {
      const playerBets = results.filter(r => r.bet.playerId === player.id);
      const playerWinnings = playerBets.reduce((sum, r) => sum + (r.isWon ? r.payout : 0), 0);
      const playerLosses = playerBets.reduce((sum, r) => sum + (r.isWon ? 0 : r.bet.betAmount), 0);
      
      return {
        ...player,
        score: player.score + playerWinnings - playerLosses, // 베팅 수익/손실을 점수에 반영
      };
    });
    
    // 최종 순위에서 상위 winnerCount명 선정
    const sortedPlayers = [...updatedPlayers].sort((a, b) => b.score - a.score);
    const winners = sortedPlayers.slice(0, winnerCount).map(p => 
      participants.find(part => part.id === p.id)!
    ).filter(Boolean);
    
    // 결과를 상태에 저장
    const totalWinnings = results.reduce((sum, r) => sum + r.payout, 0);
    
    setGameState(prev => ({
      ...prev,
      players: updatedPlayers,
      betting: prev.betting ? {
        ...prev.betting,
        results,
        totalWinnings,
      } : undefined,
    }));
    
    // 우승자들 전달
    if (winners.length > 0) {
      onGameEnd(winners[0]); // 현재는 1명만 전달, 추후 여러 명 처리 필요
    }
  }, [gameState.betting, gameState.players, participants, onGameEnd, winnerCount]);

  // processBettingResults를 ref에 할당
  useEffect(() => {
    processBettingResultsRef.current = processBettingResults;
  }, [processBettingResults]);

  // 베팅 마감
  const closeBetting = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      betting: prev.betting ? {
        ...prev.betting,
        isBettingClosed: true,
      } : undefined,
    }));
  }, []);

  return {
    gameState,
    startGame,
    spinPlayerSlot,
    spinAllPlayers,
    placeBet,
    processBettingResults,
    closeBetting,
  };
};
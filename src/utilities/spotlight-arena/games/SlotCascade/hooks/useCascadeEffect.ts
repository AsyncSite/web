import { useState, useCallback, useEffect } from 'react';
import { SymbolType, MatchGroup } from '../types/symbol';
import { findAllMatches, removeMatchedSymbols } from '../utils/matchingUtils';
import { processCascade, getCascadeMultiplier, getCascadeBonus } from '../utils/cascadeUtils';

interface CascadeState {
  isProcessing: boolean;
  currentLevel: number;
  totalScore: number;
  grid: (SymbolType | null)[][];
}

interface UseCascadeEffectProps {
  initialGrid: (SymbolType | null)[][];
  onComplete: (finalGrid: (SymbolType | null)[][], totalScore: number, cascadeLevel: number) => void;
  onCascadeStep?: (grid: (SymbolType | null)[][], matches: MatchGroup[], cascadeLevel: number) => void;
}

export const useCascadeEffect = ({
  initialGrid,
  onComplete,
  onCascadeStep,
}: UseCascadeEffectProps) => {
  const [cascadeState, setCascadeState] = useState<CascadeState>({
    isProcessing: false,
    currentLevel: 0,
    totalScore: 0,
    grid: initialGrid,
  });

  // 캐스케이드 프로세스 시작
  const startCascade = useCallback(() => {
    setCascadeState({
      isProcessing: true,
      currentLevel: 0,
      totalScore: 0,
      grid: initialGrid,
    });
  }, [initialGrid]);

  // 단일 캐스케이드 스텝 처리
  const processCascadeStep = useCallback(async (
    grid: (SymbolType | null)[][], 
    level: number, 
    accumulatedScore: number
  ): Promise<{ continuesCascade: boolean; newScore: number; newGrid: (SymbolType | null)[][] }> => {
    // 1. 현재 그리드에서 매칭 찾기
    const matches = findAllMatches(grid);
    
    if (matches.length === 0) {
      // 매칭이 없으면 캐스케이드 종료
      return { continuesCascade: false, newScore: accumulatedScore, newGrid: grid };
    }

    // 2. 캐스케이드 스텝 콜백 호출
    if (onCascadeStep) {
      onCascadeStep(grid, matches, level);
    }

    // 3. 점수 계산 (배율 적용)
    const multiplier = getCascadeMultiplier(level);
    const bonus = getCascadeBonus(level);
    const stepScore = matches.reduce((sum, match) => sum + match.points, 0) * multiplier + bonus;
    const newScore = accumulatedScore + stepScore;

    // 4. 매칭된 심볼 제거
    const gridAfterRemoval = removeMatchedSymbols(grid, matches);

    // 5. 캐스케이드 처리 (중력 + 새 심볼)
    await new Promise(resolve => setTimeout(resolve, 300)); // 제거 애니메이션 대기
    
    const cascadeResult = processCascade(gridAfterRemoval);
    
    await new Promise(resolve => setTimeout(resolve, 400)); // 떨어지는 애니메이션 대기

    return { 
      continuesCascade: true, 
      newScore, 
      newGrid: cascadeResult.grid 
    };
  }, [onCascadeStep]);

  // 캐스케이드 프로세스 실행
  useEffect(() => {
    if (!cascadeState.isProcessing) return;

    const runCascade = async () => {
      let currentGrid = cascadeState.grid;
      let currentScore = cascadeState.totalScore;
      let currentLevel = cascadeState.currentLevel;
      let continues = true;

      while (continues) {
        const result = await processCascadeStep(currentGrid, currentLevel, currentScore);
        
        continues = result.continuesCascade;
        currentGrid = result.newGrid;
        currentScore = result.newScore;
        
        if (continues) {
          currentLevel++;
          
          // 상태 업데이트
          setCascadeState({
            isProcessing: true,
            currentLevel,
            totalScore: currentScore,
            grid: currentGrid,
          });
        }
      }

      // 캐스케이드 완료
      setCascadeState({
        isProcessing: false,
        currentLevel,
        totalScore: currentScore,
        grid: currentGrid,
      });

      onComplete(currentGrid, currentScore, currentLevel);
    };

    runCascade();
  }, [cascadeState.isProcessing, cascadeState.grid, cascadeState.totalScore, cascadeState.currentLevel, processCascadeStep, onComplete]);

  return {
    cascadeState,
    startCascade,
  };
};
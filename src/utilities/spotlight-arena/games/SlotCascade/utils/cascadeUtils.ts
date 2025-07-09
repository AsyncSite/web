import { SymbolType } from '../types/symbol';
import { generateRandomSymbol } from './symbolUtils';

/**
 * 중력 적용 - null인 셀을 위로, 심볼을 아래로 이동
 */
export const applyGravity = (grid: (SymbolType | null)[][]): (SymbolType | null)[][] => {
  const newGrid = grid.map(row => [...row]);
  const gridSize = grid.length;

  // 각 열에 대해 처리
  for (let col = 0; col < gridSize; col++) {
    // 아래에서 위로 검사하면서 null이 아닌 심볼들을 아래로 모음
    const symbols: SymbolType[] = [];
    
    for (let row = 0; row < gridSize; row++) {
      if (newGrid[row][col] !== null) {
        symbols.push(newGrid[row][col]!);
        newGrid[row][col] = null;
      }
    }
    
    // 수집한 심볼들을 아래부터 다시 배치
    let bottomRow = gridSize - 1;
    for (let i = symbols.length - 1; i >= 0; i--) {
      newGrid[bottomRow][col] = symbols[i];
      bottomRow--;
    }
  }

  return newGrid;
};

/**
 * 빈 공간에 새로운 심볼 채우기
 */
export const fillEmptySpaces = (grid: (SymbolType | null)[][]): (SymbolType | null)[][] => {
  const newGrid = grid.map(row => [...row]);
  const gridSize = grid.length;

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (newGrid[row][col] === null) {
        newGrid[row][col] = generateRandomSymbol();
      }
    }
  }

  return newGrid;
};

/**
 * 특정 위치의 심볼이 떨어질 거리 계산
 */
export const calculateFallDistance = (
  originalGrid: (SymbolType | null)[][], 
  newGrid: (SymbolType | null)[][], 
  row: number, 
  col: number
): number => {
  const symbol = originalGrid[row][col];
  if (symbol === null) return 0;

  // 새 그리드에서 해당 심볼의 위치 찾기
  for (let newRow = row; newRow < originalGrid.length; newRow++) {
    if (newGrid[newRow][col] === symbol) {
      return newRow - row;
    }
  }

  return 0;
};

/**
 * 캐스케이드 프로세스 실행
 * @returns { grid: 새 그리드, hasNewMatches: 새 매칭 여부 }
 */
export const processCascade = (grid: (SymbolType | null)[][]): {
  grid: (SymbolType | null)[][];
  droppedPositions: { row: number; col: number; distance: number }[];
  newSymbolPositions: { row: number; col: number }[];
} => {
  const originalGrid = grid.map(row => [...row]);
  
  // 1. 중력 적용
  let newGrid = applyGravity(grid);
  
  // 2. 떨어진 심볼들의 위치와 거리 계산
  const droppedPositions: { row: number; col: number; distance: number }[] = [];
  const gridSize = grid.length;
  
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const distance = calculateFallDistance(originalGrid, newGrid, row, col);
      if (distance > 0) {
        droppedPositions.push({ row, col, distance });
      }
    }
  }
  
  // 3. 새 심볼이 생성될 위치 찾기
  const newSymbolPositions: { row: number; col: number }[] = [];
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (newGrid[row][col] === null) {
        newSymbolPositions.push({ row, col });
      }
    }
  }
  
  // 4. 빈 공간 채우기
  newGrid = fillEmptySpaces(newGrid);
  
  return {
    grid: newGrid,
    droppedPositions,
    newSymbolPositions,
  };
};

/**
 * 캐스케이드 레벨에 따른 점수 배율 계산
 */
export const getCascadeMultiplier = (cascadeLevel: number): number => {
  const multipliers = [1, 1.5, 2, 3]; // 레벨 0, 1, 2, 3+
  
  if (cascadeLevel >= multipliers.length) {
    return multipliers[multipliers.length - 1];
  }
  
  return multipliers[cascadeLevel];
};

/**
 * 캐스케이드 보너스 점수 계산
 */
export const getCascadeBonus = (cascadeLevel: number): number => {
  if (cascadeLevel >= 4) {
    return 500 * (cascadeLevel - 3); // 4레벨부터 500점씩 추가
  }
  return 0;
};
import { SymbolType, SymbolPosition } from '../types/symbol';
import { calculateSymbolPoints } from './symbolUtils';

/**
 * 폭탄 효과 - 3x3 영역 제거
 */
export const getBombEffect = (
  grid: (SymbolType | null)[][], 
  position: SymbolPosition
): { affectedPositions: SymbolPosition[]; points: number } => {
  const affectedPositions: SymbolPosition[] = [];
  let points = 0;
  const gridSize = grid.length;
  
  // 3x3 영역 계산
  for (let row = position.row - 1; row <= position.row + 1; row++) {
    for (let col = position.col - 1; col <= position.col + 1; col++) {
      if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
        const symbol = grid[row][col];
        if (symbol && symbol !== 'bomb') {
          affectedPositions.push({ row, col, symbol });
          points += calculateSymbolPoints(symbol);
        }
      }
    }
  }
  
  // 폭탄 자신도 포함
  affectedPositions.push(position);
  
  return { affectedPositions, points };
};

/**
 * 스타 효과 - 십자 라인 제거
 */
export const getStarEffect = (
  grid: (SymbolType | null)[][], 
  position: SymbolPosition
): { affectedPositions: SymbolPosition[]; points: number } => {
  const affectedPositions: SymbolPosition[] = [];
  let points = 0;
  const gridSize = grid.length;
  
  // 가로 라인
  for (let col = 0; col < gridSize; col++) {
    const symbol = grid[position.row][col];
    if (symbol && symbol !== 'star') {
      affectedPositions.push({ row: position.row, col, symbol });
      points += calculateSymbolPoints(symbol);
    }
  }
  
  // 세로 라인
  for (let row = 0; row < gridSize; row++) {
    const symbol = grid[row][position.col];
    if (symbol && symbol !== 'star' && row !== position.row) { // 중복 제거
      affectedPositions.push({ row, col: position.col, symbol });
      points += calculateSymbolPoints(symbol);
    }
  }
  
  // 스타 자신도 포함
  affectedPositions.push(position);
  
  return { affectedPositions, points };
};

/**
 * 특수 심볼 효과 적용
 */
export const applySpecialEffects = (
  grid: (SymbolType | null)[][], 
  matches: { positions: SymbolPosition[]; symbolType: SymbolType; points: number }[]
): {
  additionalRemovals: SymbolPosition[];
  bonusPoints: number;
  specialEffects: { type: SymbolType; position: SymbolPosition; affectedPositions: SymbolPosition[] }[];
} => {
  const additionalRemovals: SymbolPosition[] = [];
  let bonusPoints = 0;
  const specialEffects: { type: SymbolType; position: SymbolPosition; affectedPositions: SymbolPosition[] }[] = [];
  const processedPositions = new Set<string>();
  
  // 매칭된 심볼 중 특수 심볼 찾기
  matches.forEach(match => {
    match.positions.forEach(pos => {
      const posKey = `${pos.row},${pos.col}`;
      if (processedPositions.has(posKey)) return;
      
      const symbol = grid[pos.row][pos.col];
      
      if (symbol === 'bomb') {
        const effect = getBombEffect(grid, pos);
        additionalRemovals.push(...effect.affectedPositions);
        bonusPoints += effect.points;
        specialEffects.push({
          type: 'bomb',
          position: pos,
          affectedPositions: effect.affectedPositions,
        });
        processedPositions.add(posKey);
      } else if (symbol === 'star') {
        const effect = getStarEffect(grid, pos);
        additionalRemovals.push(...effect.affectedPositions);
        bonusPoints += effect.points;
        specialEffects.push({
          type: 'star',
          position: pos,
          affectedPositions: effect.affectedPositions,
        });
        processedPositions.add(posKey);
      } else if (symbol === 'bonus') {
        // 보너스는 이미 점수 계산에서 처리됨
        bonusPoints += Math.floor(Math.random() * 451) + 50; // 50-500 랜덤
        specialEffects.push({
          type: 'bonus',
          position: pos,
          affectedPositions: [pos],
        });
        processedPositions.add(posKey);
      }
    });
  });
  
  // 중복 제거
  const uniqueRemovals = Array.from(
    new Map(additionalRemovals.map(pos => [`${pos.row},${pos.col}`, pos])).values()
  );
  
  return {
    additionalRemovals: uniqueRemovals,
    bonusPoints,
    specialEffects,
  };
};

/**
 * 특수 심볼 연쇄 효과 확인
 * 특수 심볼이 다른 특수 심볼을 터뜨리는 경우 처리
 */
export const checkChainEffects = (
  grid: (SymbolType | null)[][],
  removedPositions: SymbolPosition[]
): { chainedRemovals: SymbolPosition[]; chainedPoints: number } => {
  const chainedRemovals: SymbolPosition[] = [];
  let chainedPoints = 0;
  const processedPositions = new Set<string>();
  
  removedPositions.forEach(pos => {
    const posKey = `${pos.row},${pos.col}`;
    if (processedPositions.has(posKey)) return;
    
    // 제거될 위치에 특수 심볼이 있는지 확인
    const symbol = grid[pos.row][pos.col];
    if (symbol === 'bomb' || symbol === 'star') {
      let effect;
      if (symbol === 'bomb') {
        effect = getBombEffect(grid, pos);
      } else {
        effect = getStarEffect(grid, pos);
      }
      
      chainedRemovals.push(...effect.affectedPositions);
      chainedPoints += effect.points;
      processedPositions.add(posKey);
    }
  });
  
  return { chainedRemovals, chainedPoints };
};
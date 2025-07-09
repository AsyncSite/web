import { SymbolType, SymbolPosition, MatchGroup } from '../types/symbol';
import { canMatch, calculateSymbolPoints } from './symbolUtils';

/**
 * 그리드에서 모든 매칭 찾기
 */
export const findAllMatches = (grid: (SymbolType | null)[][]): MatchGroup[] => {
  const matches: MatchGroup[] = [];
  const gridSize = grid.length;
  const visited = Array(gridSize).fill(null).map(() => Array(gridSize).fill(false));

  // 가로 매칭 확인
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize - 2; col++) {
      const matchPositions = checkHorizontalMatch(grid, row, col);
      if (matchPositions.length >= 3) {
        const symbolType = grid[row][col]!;
        matches.push({
          positions: matchPositions,
          symbolType,
          points: calculateSymbolPoints(symbolType, matchPositions.length),
        });
        matchPositions.forEach(pos => visited[pos.row][pos.col] = true);
      }
    }
  }

  // 세로 매칭 확인
  for (let col = 0; col < gridSize; col++) {
    for (let row = 0; row < gridSize - 2; row++) {
      if (!visited[row][col]) {
        const matchPositions = checkVerticalMatch(grid, row, col);
        if (matchPositions.length >= 3) {
          const symbolType = grid[row][col]!;
          matches.push({
            positions: matchPositions,
            symbolType,
            points: calculateSymbolPoints(symbolType, matchPositions.length),
          });
          matchPositions.forEach(pos => visited[pos.row][pos.col] = true);
        }
      }
    }
  }

  // 대각선 매칭 확인 (좌상단 -> 우하단)
  for (let row = 0; row < gridSize - 2; row++) {
    for (let col = 0; col < gridSize - 2; col++) {
      if (!visited[row][col]) {
        const matchPositions = checkDiagonalMatch(grid, row, col, 1, 1);
        if (matchPositions.length >= 3) {
          const symbolType = grid[row][col]!;
          matches.push({
            positions: matchPositions,
            symbolType,
            points: calculateSymbolPoints(symbolType, matchPositions.length),
          });
          matchPositions.forEach(pos => visited[pos.row][pos.col] = true);
        }
      }
    }
  }

  // 대각선 매칭 확인 (우상단 -> 좌하단)
  for (let row = 0; row < gridSize - 2; row++) {
    for (let col = 2; col < gridSize; col++) {
      if (!visited[row][col]) {
        const matchPositions = checkDiagonalMatch(grid, row, col, 1, -1);
        if (matchPositions.length >= 3) {
          const symbolType = grid[row][col]!;
          matches.push({
            positions: matchPositions,
            symbolType,
            points: calculateSymbolPoints(symbolType, matchPositions.length),
          });
          matchPositions.forEach(pos => visited[pos.row][pos.col] = true);
        }
      }
    }
  }

  return matches;
};

/**
 * 가로 매칭 확인
 */
const checkHorizontalMatch = (
  grid: (SymbolType | null)[][], 
  row: number, 
  startCol: number
): SymbolPosition[] => {
  const positions: SymbolPosition[] = [];
  const firstSymbol = grid[row][startCol];
  
  if (!firstSymbol) return positions;

  for (let col = startCol; col < grid.length; col++) {
    const currentSymbol = grid[row][col];
    if (currentSymbol && canMatch(firstSymbol, currentSymbol)) {
      positions.push({ row, col, symbol: currentSymbol });
    } else {
      break;
    }
  }

  return positions.length >= 3 ? positions : [];
};

/**
 * 세로 매칭 확인
 */
const checkVerticalMatch = (
  grid: (SymbolType | null)[][], 
  startRow: number, 
  col: number
): SymbolPosition[] => {
  const positions: SymbolPosition[] = [];
  const firstSymbol = grid[startRow][col];
  
  if (!firstSymbol) return positions;

  for (let row = startRow; row < grid.length; row++) {
    const currentSymbol = grid[row][col];
    if (currentSymbol && canMatch(firstSymbol, currentSymbol)) {
      positions.push({ row, col, symbol: currentSymbol });
    } else {
      break;
    }
  }

  return positions.length >= 3 ? positions : [];
};

/**
 * 대각선 매칭 확인
 */
const checkDiagonalMatch = (
  grid: (SymbolType | null)[][], 
  startRow: number, 
  startCol: number,
  rowDelta: number,
  colDelta: number
): SymbolPosition[] => {
  const positions: SymbolPosition[] = [];
  const firstSymbol = grid[startRow][startCol];
  
  if (!firstSymbol) return positions;

  let row = startRow;
  let col = startCol;

  while (row >= 0 && row < grid.length && col >= 0 && col < grid.length) {
    const currentSymbol = grid[row][col];
    if (currentSymbol && canMatch(firstSymbol, currentSymbol)) {
      positions.push({ row, col, symbol: currentSymbol });
    } else {
      break;
    }
    row += rowDelta;
    col += colDelta;
  }

  return positions.length >= 3 ? positions : [];
};

/**
 * 매칭된 심볼 제거 (null로 설정)
 */
export const removeMatchedSymbols = (
  grid: (SymbolType | null)[][], 
  matches: MatchGroup[]
): (SymbolType | null)[][] => {
  const newGrid = grid.map(row => [...row]);
  
  matches.forEach(match => {
    match.positions.forEach(pos => {
      newGrid[pos.row][pos.col] = null;
    });
  });
  
  return newGrid;
};
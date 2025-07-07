import { useState, useCallback } from 'react';
import { Team } from '../utils';

interface HistoryEntry {
  teams: Team[];
  timestamp: Date;
  divisionMethod: 'byTeamCount' | 'byMemberCount';
  divisionValue: number;
}

interface UseTeamHistoryReturn {
  currentTeams: Team[] | null;
  history: HistoryEntry[];
  canUndo: boolean;
  canRedo: boolean;
  addToHistory: (
    teams: Team[],
    divisionMethod: 'byTeamCount' | 'byMemberCount',
    divisionValue: number,
  ) => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
}

const MAX_HISTORY_SIZE = 10;

export const useTeamHistory = (): UseTeamHistoryReturn => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  const currentTeams = currentIndex >= 0 ? history[currentIndex]?.teams || null : null;
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const addToHistory = useCallback(
    (teams: Team[], divisionMethod: 'byTeamCount' | 'byMemberCount', divisionValue: number) => {
      const newEntry: HistoryEntry = {
        teams,
        timestamp: new Date(),
        divisionMethod,
        divisionValue,
      };

      setHistory((prev) => {
        // 현재 인덱스 이후의 히스토리는 제거 (새로운 분기 생성)
        const newHistory = prev.slice(0, currentIndex + 1);
        newHistory.push(newEntry);

        // 최대 히스토리 크기 유지
        if (newHistory.length > MAX_HISTORY_SIZE) {
          return newHistory.slice(newHistory.length - MAX_HISTORY_SIZE);
        }

        return newHistory;
      });

      setCurrentIndex((prev) => Math.min(prev + 1, MAX_HISTORY_SIZE - 1));
    },
    [currentIndex],
  );

  const undo = useCallback(() => {
    if (canUndo) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [canUndo]);

  const redo = useCallback(() => {
    if (canRedo) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [canRedo]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
  }, []);

  return {
    currentTeams,
    history,
    canUndo,
    canRedo,
    addToHistory,
    undo,
    redo,
    clearHistory,
  };
};

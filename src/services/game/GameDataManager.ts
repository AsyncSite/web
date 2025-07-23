import { 
  GameType, 
  GameResult, 
  GameHistory, 
  GameStatistics, 
  LeaderboardEntry, 
  GameSession,
  GameDataResult 
} from './types';

/**
 * Interface for managing game data across different storage mechanisms
 * Implementations can use localStorage for guests or API for authenticated users
 */
export interface GameDataManager {
  // Session management
  startGameSession(gameType: GameType): Promise<GameDataResult<GameSession>>;
  endGameSession(sessionId: string, result: GameResult): Promise<GameDataResult<void>>;
  abandonGameSession(sessionId: string): Promise<GameDataResult<void>>;
  getCurrentSession(gameType: GameType): Promise<GameDataResult<GameSession | null>>;

  // Game data management
  saveGameResult(result: GameResult): Promise<GameDataResult<void>>;
  getGameHistory(gameType?: GameType, limit?: number): Promise<GameDataResult<GameHistory[]>>;
  getGameStatistics(gameType?: GameType): Promise<GameDataResult<GameStatistics[]>>;
  
  // Personal records
  getPersonalBest(gameType: GameType): Promise<GameDataResult<number>>;
  getTotalGamesPlayed(gameType?: GameType): Promise<GameDataResult<number>>;
  
  // Leaderboard (may return empty for guest users)
  getLeaderboard(gameType: GameType, limit?: number): Promise<GameDataResult<LeaderboardEntry[]>>;
  getUserRank(gameType: GameType): Promise<GameDataResult<number | null>>;
  
  // Data migration (for when guest users log in)
  exportGameData(): Promise<GameDataResult<GameHistory[]>>;
  clearLocalData(): Promise<GameDataResult<void>>;
  
  // Utility methods
  isAvailable(): boolean;
  getStorageType(): 'local' | 'api';
}
import { GameDataManager } from './GameDataManager';
import {
  GameType,
  GameResult,
  GameHistory,
  GameStatistics,
  LeaderboardEntry,
  GameSession,
  GameDataResult,
  GameDataError,
  TetrisGameData,
  DeductionGameData
} from './types';

export class LocalStorageGameManager implements GameDataManager {
  private readonly STORAGE_KEYS = {
    SESSIONS: 'game-sessions',
    HISTORY: 'game-history',
    STATISTICS: 'game-statistics',
    // Legacy keys for backward compatibility
    TETRIS_HIGH_SCORE: 'tetris-high-score',
    TETRIS_LAST_PLAYED: 'tetris-last-played',
    TETRIS_PLAY_COUNT: 'tetris-play-count',
    DEDUCTION_HISTORY: 'deduction-game-history'
  };

  async startGameSession(gameType: GameType): Promise<GameDataResult<GameSession>> {
    try {
      const session: GameSession = {
        sessionId: `${gameType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        gameType,
        startedAt: new Date(),
        status: 'active'
      };

      const sessions = this.getStoredSessions();
      // Mark any existing active sessions for this game type as abandoned
      sessions.forEach(s => {
        if (s.gameType === gameType && s.status === 'active') {
          s.status = 'abandoned';
        }
      });
      sessions.push(session);
      this.setStoredSessions(sessions);

      return { success: true, data: session };
    } catch (error) {
      return {
        success: false,
        error: new GameDataError('Failed to start game session', 'STORAGE_ERROR', error)
      };
    }
  }

  async endGameSession(sessionId: string, result: GameResult): Promise<GameDataResult<void>> {
    try {
      const sessions = this.getStoredSessions();
      const sessionIndex = sessions.findIndex(s => s.sessionId === sessionId);
      
      if (sessionIndex === -1) {
        // If no session found, still save the result
        await this.saveGameResult(result);
        return { success: true, data: undefined };
      }

      sessions[sessionIndex].status = 'completed';
      this.setStoredSessions(sessions);

      // Save the game result
      await this.saveGameResult(result);

      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: new GameDataError('Failed to end game session', 'STORAGE_ERROR', error)
      };
    }
  }

  async abandonGameSession(sessionId: string): Promise<GameDataResult<void>> {
    try {
      const sessions = this.getStoredSessions();
      const session = sessions.find(s => s.sessionId === sessionId);
      
      if (session) {
        session.status = 'abandoned';
        this.setStoredSessions(sessions);
      }

      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: new GameDataError('Failed to abandon game session', 'STORAGE_ERROR', error)
      };
    }
  }

  async getCurrentSession(gameType: GameType): Promise<GameDataResult<GameSession | null>> {
    try {
      const sessions = this.getStoredSessions();
      const activeSession = sessions.find(
        s => s.gameType === gameType && s.status === 'active'
      );

      return { success: true, data: activeSession || null };
    } catch (error) {
      return {
        success: false,
        error: new GameDataError('Failed to get current session', 'STORAGE_ERROR', error)
      };
    }
  }

  async saveGameResult(result: GameResult): Promise<GameDataResult<void>> {
    try {
      const history = this.getStoredHistory();
      const historyEntry: GameHistory = {
        id: `${result.gameType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        gameType: result.gameType,
        score: result.score,
        playedAt: result.playedAt,
        additionalData: this.extractAdditionalData(result)
      };

      history.push(historyEntry);
      this.setStoredHistory(history);

      // Update statistics
      this.updateStatistics(result);

      // Update legacy storage for backward compatibility
      this.updateLegacyStorage(result);

      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: new GameDataError('Failed to save game result', 'STORAGE_ERROR', error)
      };
    }
  }

  async getGameHistory(gameType?: GameType, limit?: number): Promise<GameDataResult<GameHistory[]>> {
    try {
      let history = this.getStoredHistory();

      if (gameType) {
        history = history.filter(h => h.gameType === gameType);
      }

      // Sort by date descending
      history.sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime());

      if (limit) {
        history = history.slice(0, limit);
      }

      return { success: true, data: history };
    } catch (error) {
      return {
        success: false,
        error: new GameDataError('Failed to get game history', 'STORAGE_ERROR', error)
      };
    }
  }

  async getGameStatistics(gameType?: GameType): Promise<GameDataResult<GameStatistics[]>> {
    try {
      const stats = this.getStoredStatistics();
      
      if (gameType) {
        const stat = stats.find(s => s.gameType === gameType);
        return { success: true, data: stat ? [stat] : [] };
      }

      return { success: true, data: stats };
    } catch (error) {
      return {
        success: false,
        error: new GameDataError('Failed to get game statistics', 'STORAGE_ERROR', error)
      };
    }
  }

  async getPersonalBest(gameType: GameType): Promise<GameDataResult<number>> {
    try {
      const stats = this.getStoredStatistics();
      const stat = stats.find(s => s.gameType === gameType);
      
      return { success: true, data: stat?.bestScore || 0 };
    } catch (error) {
      return {
        success: false,
        error: new GameDataError('Failed to get personal best', 'STORAGE_ERROR', error)
      };
    }
  }

  async getTotalGamesPlayed(gameType?: GameType): Promise<GameDataResult<number>> {
    try {
      const stats = this.getStoredStatistics();
      
      if (gameType) {
        const stat = stats.find(s => s.gameType === gameType);
        return { success: true, data: stat?.totalGamesPlayed || 0 };
      }

      const total = stats.reduce((sum, stat) => sum + stat.totalGamesPlayed, 0);
      return { success: true, data: total };
    } catch (error) {
      return {
        success: false,
        error: new GameDataError('Failed to get total games played', 'STORAGE_ERROR', error)
      };
    }
  }

  async getLeaderboard(gameType: GameType, limit?: number): Promise<GameDataResult<LeaderboardEntry[]>> {
    // Local storage doesn't have access to global leaderboard
    return { success: true, data: [] };
  }

  async getUserRank(gameType: GameType): Promise<GameDataResult<number | null>> {
    // Local storage doesn't have access to global rankings
    return { success: true, data: null };
  }

  async exportGameData(): Promise<GameDataResult<GameHistory[]>> {
    try {
      const history = this.getStoredHistory();
      // Also include data from legacy storage
      this.migrateLegacyData();
      return { success: true, data: history };
    } catch (error) {
      return {
        success: false,
        error: new GameDataError('Failed to export game data', 'STORAGE_ERROR', error)
      };
    }
  }

  async clearLocalData(): Promise<GameDataResult<void>> {
    try {
      localStorage.removeItem(this.STORAGE_KEYS.SESSIONS);
      localStorage.removeItem(this.STORAGE_KEYS.HISTORY);
      localStorage.removeItem(this.STORAGE_KEYS.STATISTICS);
      // Don't clear legacy data to maintain backward compatibility
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: new GameDataError('Failed to clear local data', 'STORAGE_ERROR', error)
      };
    }
  }

  isAvailable(): boolean {
    try {
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  getStorageType(): 'local' | 'api' {
    return 'local';
  }

  // Private helper methods
  private getStoredSessions(): GameSession[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private setStoredSessions(sessions: GameSession[]): void {
    localStorage.setItem(this.STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }

  private getStoredHistory(): GameHistory[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private setStoredHistory(history: GameHistory[]): void {
    localStorage.setItem(this.STORAGE_KEYS.HISTORY, JSON.stringify(history));
  }

  private getStoredStatistics(): GameStatistics[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.STATISTICS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private setStoredStatistics(statistics: GameStatistics[]): void {
    localStorage.setItem(this.STORAGE_KEYS.STATISTICS, JSON.stringify(statistics));
  }

  private extractAdditionalData(result: GameResult): Record<string, any> {
    const { gameType, score, playedAt, timeElapsedSeconds, ...additionalData } = result;
    return additionalData;
  }

  private updateStatistics(result: GameResult): void {
    const stats = this.getStoredStatistics();
    let stat = stats.find(s => s.gameType === result.gameType);

    if (!stat) {
      stat = {
        gameType: result.gameType,
        totalGamesPlayed: 0,
        totalScore: 0,
        averageScore: 0,
        bestScore: 0,
        lastPlayedAt: result.playedAt
      };
      stats.push(stat);
    }

    stat.totalGamesPlayed++;
    stat.totalScore += result.score;
    stat.averageScore = stat.totalScore / stat.totalGamesPlayed;
    stat.bestScore = Math.max(stat.bestScore, result.score);
    stat.lastPlayedAt = result.playedAt;

    // Add game-specific stats
    if (result.gameType === 'TETRIS') {
      const tetrisResult = result as TetrisGameData;
      stat.additionalStats = {
        ...stat.additionalStats,
        highestLevel: Math.max(stat.additionalStats?.highestLevel || 0, tetrisResult.level),
        totalLinesCleared: (stat.additionalStats?.totalLinesCleared || 0) + tetrisResult.linesCleared
      };
    } else if (result.gameType === 'DEDUCTION') {
      const deductionResult = result as DeductionGameData;
      const wins = stat.additionalStats?.wins || 0;
      stat.additionalStats = {
        ...stat.additionalStats,
        wins: deductionResult.won ? wins + 1 : wins,
        winRate: deductionResult.won 
          ? ((wins + 1) / stat.totalGamesPlayed) * 100 
          : (wins / stat.totalGamesPlayed) * 100
      };
    }

    this.setStoredStatistics(stats);
  }

  private updateLegacyStorage(result: GameResult): void {
    if (result.gameType === 'TETRIS') {
      const tetrisResult = result as TetrisGameData;
      const currentHighScore = parseInt(localStorage.getItem(this.STORAGE_KEYS.TETRIS_HIGH_SCORE) || '0');
      
      if (tetrisResult.score > currentHighScore) {
        localStorage.setItem(this.STORAGE_KEYS.TETRIS_HIGH_SCORE, tetrisResult.score.toString());
      }
      
      localStorage.setItem(this.STORAGE_KEYS.TETRIS_LAST_PLAYED, result.playedAt.toISOString());
      
      const playCount = parseInt(localStorage.getItem(this.STORAGE_KEYS.TETRIS_PLAY_COUNT) || '0');
      localStorage.setItem(this.STORAGE_KEYS.TETRIS_PLAY_COUNT, (playCount + 1).toString());
    }
  }

  private migrateLegacyData(): void {
    // Migrate Tetris data
    const tetrisHighScore = localStorage.getItem(this.STORAGE_KEYS.TETRIS_HIGH_SCORE);
    const tetrisLastPlayed = localStorage.getItem(this.STORAGE_KEYS.TETRIS_LAST_PLAYED);
    
    if (tetrisHighScore && tetrisLastPlayed) {
      const history = this.getStoredHistory();
      const hasTetrisData = history.some(h => h.gameType === 'TETRIS');
      
      if (!hasTetrisData) {
        const tetrisEntry: GameHistory = {
          id: `TETRIS-legacy-${Date.now()}`,
          gameType: 'TETRIS',
          score: parseInt(tetrisHighScore),
          playedAt: new Date(tetrisLastPlayed),
          additionalData: {}
        };
        history.push(tetrisEntry);
        this.setStoredHistory(history);
      }
    }

    // Migrate Deduction Game data
    const deductionHistory = localStorage.getItem(this.STORAGE_KEYS.DEDUCTION_HISTORY);
    if (deductionHistory) {
      try {
        const oldHistory = JSON.parse(deductionHistory);
        const history = this.getStoredHistory();
        
        oldHistory.forEach((game: any) => {
          const deductionEntry: GameHistory = {
            id: `DEDUCTION-legacy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            gameType: 'DEDUCTION',
            score: game.score || 0,
            playedAt: new Date(game.timestamp || Date.now()),
            additionalData: {
              won: game.won || false,
              difficulty: game.difficulty || 'medium'
            }
          };
          history.push(deductionEntry);
        });
        
        this.setStoredHistory(history);
      } catch {
        // Ignore migration errors
      }
    }
  }
}
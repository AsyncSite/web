import { GameDataManager } from './GameDataManager';
import {
  GameType,
  GameResult,
  GameHistory,
  GameStatistics,
  LeaderboardEntry,
  GameSession,
  GameDataResult,
  GameDataError
} from './types';
import gameApiService, { 
  TetrisGameResult as ApiTetrisResult,
  DeductionGameResult as ApiDeductionResult,
  GameResultResponse,
  GameSession as ApiGameSession
} from '../../api/gameApiService';

export class ApiGameManager implements GameDataManager {
  private sessionCache: Map<GameType, GameSession> = new Map();

  async startGameSession(gameType: GameType): Promise<GameDataResult<GameSession>> {
    try {
      const apiSession = await gameApiService.startGameSession({
        gameTypeCode: gameType
      });

      const session: GameSession = {
        sessionId: apiSession.sessionId,
        gameType: gameType,
        startedAt: new Date(apiSession.startedAt),
        status: this.mapApiStatus(apiSession.status)
      };

      // Cache the session
      this.sessionCache.set(gameType, session);

      return { success: true, data: session };
    } catch (error: any) {
      const errorCode = error?.response?.status === 401 ? 'NETWORK_ERROR' : 'UNKNOWN_ERROR';
      return {
        success: false,
        error: new GameDataError('Failed to start game session', errorCode, error)
      };
    }
  }

  async endGameSession(sessionId: string, result: GameResult): Promise<GameDataResult<void>> {
    try {
      const apiResult = this.mapToApiResult(result);
      await gameApiService.endGameSession({
        sessionId,
        result: apiResult
      });

      // Clear cached session
      this.sessionCache.forEach((session, gameType) => {
        if (session.sessionId === sessionId) {
          this.sessionCache.delete(gameType);
        }
      });

      return { success: true, data: undefined };
    } catch (error: any) {
      const errorCode = error?.response?.status === 401 ? 'NETWORK_ERROR' : 'UNKNOWN_ERROR';
      return {
        success: false,
        error: new GameDataError('Failed to end game session', errorCode, error)
      };
    }
  }

  async abandonGameSession(sessionId: string): Promise<GameDataResult<void>> {
    try {
      await gameApiService.abandonGameSession(sessionId);

      // Clear cached session
      this.sessionCache.forEach((session, gameType) => {
        if (session.sessionId === sessionId) {
          this.sessionCache.delete(gameType);
        }
      });

      return { success: true, data: undefined };
    } catch (error: any) {
      const errorCode = error?.response?.status === 401 ? 'NETWORK_ERROR' : 'UNKNOWN_ERROR';
      return {
        success: false,
        error: new GameDataError('Failed to abandon game session', errorCode, error)
      };
    }
  }

  async getCurrentSession(gameType: GameType): Promise<GameDataResult<GameSession | null>> {
    try {
      // Check cache first
      const cachedSession = this.sessionCache.get(gameType);
      if (cachedSession && cachedSession.status === 'active') {
        return { success: true, data: cachedSession };
      }

      // If not in cache, try to get from API
      // Note: This requires implementing a method in gameApiService to get active sessions
      // For now, return null
      return { success: true, data: null };
    } catch (error: any) {
      return {
        success: false,
        error: new GameDataError('Failed to get current session', 'UNKNOWN_ERROR', error)
      };
    }
  }

  async saveGameResult(result: GameResult): Promise<GameDataResult<void>> {
    try {
      // This is handled by endGameSession in the API approach
      // If called directly, we need an active session
      const session = this.sessionCache.get(result.gameType);
      if (!session) {
        // Create a new session and immediately end it
        const newSessionResult = await this.startGameSession(result.gameType);
        if (!newSessionResult.success) {
          return newSessionResult as any;
        }
        return await this.endGameSession(newSessionResult.data.sessionId, result);
      }

      return await this.endGameSession(session.sessionId, result);
    } catch (error: any) {
      return {
        success: false,
        error: new GameDataError('Failed to save game result', 'UNKNOWN_ERROR', error)
      };
    }
  }

  async getGameHistory(gameType?: GameType, limit?: number): Promise<GameDataResult<GameHistory[]>> {
    try {
      const statistics = await gameApiService.getUserStatistics(gameType);
      
      // Note: The current API doesn't provide detailed history, only statistics
      // We'll need to adapt or request a new endpoint for history
      const history: GameHistory[] = statistics.map(stat => ({
        id: `${stat.gameType}-stat`,
        gameType: stat.gameType as GameType,
        score: stat.bestScore,
        playedAt: new Date(stat.lastPlayedAt),
        additionalData: stat.additionalStats || {}
      }));

      if (limit) {
        return { success: true, data: history.slice(0, limit) };
      }

      return { success: true, data: history };
    } catch (error: any) {
      const errorCode = error?.response?.status === 401 ? 'NETWORK_ERROR' : 'UNKNOWN_ERROR';
      return {
        success: false,
        error: new GameDataError('Failed to get game history', errorCode, error)
      };
    }
  }

  async getGameStatistics(gameType?: GameType): Promise<GameDataResult<GameStatistics[]>> {
    try {
      const apiStats = await gameApiService.getUserStatistics(gameType);
      
      const statistics: GameStatistics[] = apiStats.map(stat => ({
        gameType: stat.gameType as GameType,
        totalGamesPlayed: stat.totalGamesPlayed,
        totalScore: stat.totalScore,
        averageScore: stat.averageScore,
        bestScore: stat.bestScore,
        lastPlayedAt: new Date(stat.lastPlayedAt),
        additionalStats: stat.additionalStats
      }));

      return { success: true, data: statistics };
    } catch (error: any) {
      const errorCode = error?.response?.status === 401 ? 'NETWORK_ERROR' : 'UNKNOWN_ERROR';
      return {
        success: false,
        error: new GameDataError('Failed to get game statistics', errorCode, error)
      };
    }
  }

  async getPersonalBest(gameType: GameType): Promise<GameDataResult<number>> {
    try {
      const stats = await gameApiService.getUserStatistics(gameType);
      const gameStat = stats.find(s => s.gameType === gameType);
      
      return { success: true, data: gameStat?.bestScore || 0 };
    } catch (error: any) {
      const errorCode = error?.response?.status === 401 ? 'NETWORK_ERROR' : 'UNKNOWN_ERROR';
      return {
        success: false,
        error: new GameDataError('Failed to get personal best', errorCode, error)
      };
    }
  }

  async getTotalGamesPlayed(gameType?: GameType): Promise<GameDataResult<number>> {
    try {
      const stats = await gameApiService.getUserStatistics(gameType);
      
      if (gameType) {
        const gameStat = stats.find(s => s.gameType === gameType);
        return { success: true, data: gameStat?.totalGamesPlayed || 0 };
      }

      const total = stats.reduce((sum, stat) => sum + stat.totalGamesPlayed, 0);
      return { success: true, data: total };
    } catch (error: any) {
      const errorCode = error?.response?.status === 401 ? 'NETWORK_ERROR' : 'UNKNOWN_ERROR';
      return {
        success: false,
        error: new GameDataError('Failed to get total games played', errorCode, error)
      };
    }
  }

  async getLeaderboard(gameType: GameType, limit: number = 10): Promise<GameDataResult<LeaderboardEntry[]>> {
    try {
      const apiLeaderboard = await gameApiService.getGlobalLeaderboard(gameType, limit);
      
      const leaderboard: LeaderboardEntry[] = apiLeaderboard.map(entry => ({
        rank: entry.rank,
        userId: entry.userId.toString(),
        userName: entry.userName,
        score: entry.score,
        playedAt: new Date(entry.playedAt),
        additionalData: entry.additionalData
      }));

      return { success: true, data: leaderboard };
    } catch (error: any) {
      const errorCode = error?.response?.status === 401 ? 'NETWORK_ERROR' : 'UNKNOWN_ERROR';
      return {
        success: false,
        error: new GameDataError('Failed to get leaderboard', errorCode, error)
      };
    }
  }

  async getUserRank(gameType: GameType): Promise<GameDataResult<number | null>> {
    try {
      const aroundMe = await gameApiService.getLeaderboardAroundUser(gameType, 1);
      const myEntry = aroundMe.find(entry => entry.userName === 'me'); // Need to identify current user
      
      return { success: true, data: myEntry?.rank || null };
    } catch (error: any) {
      const errorCode = error?.response?.status === 401 ? 'NETWORK_ERROR' : 'UNKNOWN_ERROR';
      return {
        success: false,
        error: new GameDataError('Failed to get user rank', errorCode, error)
      };
    }
  }

  async exportGameData(): Promise<GameDataResult<GameHistory[]>> {
    // For API-based storage, export would involve fetching all user data
    return await this.getGameHistory();
  }

  async clearLocalData(): Promise<GameDataResult<void>> {
    // API-based storage doesn't need to clear local data
    // Just clear the session cache
    this.sessionCache.clear();
    return { success: true, data: undefined };
  }

  isAvailable(): boolean {
    // Check if we have a valid auth token
    const token = localStorage.getItem('authToken');
    return !!token;
  }

  getStorageType(): 'local' | 'api' {
    return 'api';
  }

  // Private helper methods
  private mapApiStatus(status: ApiGameSession['status']): GameSession['status'] {
    switch (status) {
      case 'IN_PROGRESS':
        return 'active';
      case 'COMPLETED':
        return 'completed';
      case 'ABANDONED':
        return 'abandoned';
      default:
        return 'abandoned';
    }
  }

  private mapToApiResult(result: GameResult): ApiTetrisResult | ApiDeductionResult {
    if (result.gameType === 'TETRIS') {
      const tetrisResult = result as any;
      return {
        gameType: 'TETRIS',
        score: tetrisResult.score,
        linesCleared: tetrisResult.linesCleared,
        level: tetrisResult.level,
        maxCombo: tetrisResult.maxCombo,
        timeElapsedSeconds: tetrisResult.timeElapsedSeconds,
        gameData: JSON.stringify({
          level: tetrisResult.level,
          linesCleared: tetrisResult.linesCleared
        })
      } as ApiTetrisResult;
    } else {
      const deductionResult = result as any;
      return {
        gameType: 'DEDUCTION',
        score: deductionResult.score,
        difficulty: deductionResult.difficulty.toUpperCase() as 'EASY' | 'MEDIUM' | 'HARD',
        guessesCount: deductionResult.guessesCount,
        hintsUsed: deductionResult.hintsUsed,
        playersCount: deductionResult.playersCount,
        timeElapsedSeconds: deductionResult.timeElapsedSeconds,
        won: deductionResult.won,
        gameData: JSON.stringify({
          difficulty: deductionResult.difficulty,
          won: deductionResult.won
        })
      } as ApiDeductionResult;
    }
  }
}
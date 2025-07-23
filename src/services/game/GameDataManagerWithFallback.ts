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

/**
 * GameDataManager implementation that provides automatic fallback
 * from primary (API) to secondary (localStorage) storage
 */
export class GameDataManagerWithFallback implements GameDataManager {
  constructor(
    private primary: GameDataManager,
    private fallback: GameDataManager
  ) {}

  async startGameSession(gameType: GameType): Promise<GameDataResult<GameSession>> {
    const primaryResult = await this.primary.startGameSession(gameType);
    
    if (primaryResult.success) {
      return primaryResult;
    }

    // Log the primary failure for monitoring
    console.warn('Primary storage failed for startGameSession, falling back:', primaryResult.error);
    
    // Try fallback
    const fallbackResult = await this.fallback.startGameSession(gameType);
    
    // If fallback also fails, return the primary error as it's more informative
    if (!fallbackResult.success) {
      return primaryResult;
    }

    // Mark the session as from fallback storage
    this.markAsFallbackData(fallbackResult.data);
    return fallbackResult;
  }

  async endGameSession(sessionId: string, result: GameResult): Promise<GameDataResult<void>> {
    const primaryResult = await this.primary.endGameSession(sessionId, result);
    
    if (primaryResult.success) {
      // Also save to fallback for data redundancy
      await this.fallback.saveGameResult(result);
      return primaryResult;
    }

    console.warn('Primary storage failed for endGameSession, falling back:', primaryResult.error);
    
    // Try fallback
    const fallbackResult = await this.fallback.endGameSession(sessionId, result);
    
    if (!fallbackResult.success) {
      return primaryResult;
    }

    // Schedule retry to sync with primary storage
    this.scheduleDataSync(result);
    return fallbackResult;
  }

  async abandonGameSession(sessionId: string): Promise<GameDataResult<void>> {
    const primaryResult = await this.primary.abandonGameSession(sessionId);
    
    if (primaryResult.success) {
      // Also update fallback
      await this.fallback.abandonGameSession(sessionId);
      return primaryResult;
    }

    console.warn('Primary storage failed for abandonGameSession, falling back:', primaryResult.error);
    return await this.fallback.abandonGameSession(sessionId);
  }

  async getCurrentSession(gameType: GameType): Promise<GameDataResult<GameSession | null>> {
    const primaryResult = await this.primary.getCurrentSession(gameType);
    
    if (primaryResult.success) {
      return primaryResult;
    }

    console.warn('Primary storage failed for getCurrentSession, falling back:', primaryResult.error);
    return await this.fallback.getCurrentSession(gameType);
  }

  async saveGameResult(result: GameResult): Promise<GameDataResult<void>> {
    const primaryResult = await this.primary.saveGameResult(result);
    
    if (primaryResult.success) {
      // Also save to fallback for data redundancy
      await this.fallback.saveGameResult(result);
      return primaryResult;
    }

    console.warn('Primary storage failed for saveGameResult, falling back:', primaryResult.error);
    
    const fallbackResult = await this.fallback.saveGameResult(result);
    
    if (!fallbackResult.success) {
      return primaryResult;
    }

    // Schedule retry to sync with primary storage
    this.scheduleDataSync(result);
    return fallbackResult;
  }

  async getGameHistory(gameType?: GameType, limit?: number): Promise<GameDataResult<GameHistory[]>> {
    const primaryResult = await this.primary.getGameHistory(gameType, limit);
    
    if (primaryResult.success) {
      return primaryResult;
    }

    console.warn('Primary storage failed for getGameHistory, falling back:', primaryResult.error);
    
    // Get data from both sources and merge
    const fallbackResult = await this.fallback.getGameHistory(gameType, limit);
    
    if (!fallbackResult.success) {
      return primaryResult;
    }

    return fallbackResult;
  }

  async getGameStatistics(gameType?: GameType): Promise<GameDataResult<GameStatistics[]>> {
    const primaryResult = await this.primary.getGameStatistics(gameType);
    
    if (primaryResult.success) {
      return primaryResult;
    }

    console.warn('Primary storage failed for getGameStatistics, falling back:', primaryResult.error);
    return await this.fallback.getGameStatistics(gameType);
  }

  async getPersonalBest(gameType: GameType): Promise<GameDataResult<number>> {
    const primaryResult = await this.primary.getPersonalBest(gameType);
    
    if (primaryResult.success) {
      // Also check fallback to ensure we have the true best
      const fallbackResult = await this.fallback.getPersonalBest(gameType);
      if (fallbackResult.success) {
        return {
          success: true,
          data: Math.max(primaryResult.data, fallbackResult.data)
        };
      }
      return primaryResult;
    }

    console.warn('Primary storage failed for getPersonalBest, falling back:', primaryResult.error);
    return await this.fallback.getPersonalBest(gameType);
  }

  async getTotalGamesPlayed(gameType?: GameType): Promise<GameDataResult<number>> {
    const primaryResult = await this.primary.getTotalGamesPlayed(gameType);
    
    if (primaryResult.success) {
      return primaryResult;
    }

    console.warn('Primary storage failed for getTotalGamesPlayed, falling back:', primaryResult.error);
    return await this.fallback.getTotalGamesPlayed(gameType);
  }

  async getLeaderboard(gameType: GameType, limit?: number): Promise<GameDataResult<LeaderboardEntry[]>> {
    // Leaderboard is only available from primary (API)
    const primaryResult = await this.primary.getLeaderboard(gameType, limit);
    
    if (!primaryResult.success) {
      console.warn('Failed to get leaderboard:', primaryResult.error);
      // Return empty leaderboard instead of error for better UX
      return { success: true, data: [] };
    }

    return primaryResult;
  }

  async getUserRank(gameType: GameType): Promise<GameDataResult<number | null>> {
    // User rank is only available from primary (API)
    const primaryResult = await this.primary.getUserRank(gameType);
    
    if (!primaryResult.success) {
      console.warn('Failed to get user rank:', primaryResult.error);
      return { success: true, data: null };
    }

    return primaryResult;
  }

  async exportGameData(): Promise<GameDataResult<GameHistory[]>> {
    // Try to get data from both sources and merge
    const [primaryResult, fallbackResult] = await Promise.all([
      this.primary.exportGameData(),
      this.fallback.exportGameData()
    ]);

    const allData: GameHistory[] = [];
    const seenIds = new Set<string>();

    // Add primary data first (more authoritative)
    if (primaryResult.success) {
      primaryResult.data.forEach(item => {
        allData.push(item);
        seenIds.add(item.id);
      });
    }

    // Add fallback data that's not already in primary
    if (fallbackResult.success) {
      fallbackResult.data.forEach(item => {
        if (!seenIds.has(item.id)) {
          allData.push(item);
        }
      });
    }

    if (allData.length === 0 && !primaryResult.success && !fallbackResult.success) {
      return primaryResult; // Return primary error
    }

    return { success: true, data: allData };
  }

  async clearLocalData(): Promise<GameDataResult<void>> {
    // Clear both storages
    const [primaryResult, fallbackResult] = await Promise.all([
      this.primary.clearLocalData(),
      this.fallback.clearLocalData()
    ]);

    if (!primaryResult.success && !fallbackResult.success) {
      return primaryResult;
    }

    return { success: true, data: undefined };
  }

  isAvailable(): boolean {
    // Available if either storage is available
    return this.primary.isAvailable() || this.fallback.isAvailable();
  }

  getStorageType(): 'local' | 'api' {
    // Return primary storage type if available
    if (this.primary.isAvailable()) {
      return this.primary.getStorageType();
    }
    return this.fallback.getStorageType();
  }

  // Private helper methods
  private markAsFallbackData(data: any): void {
    if (data && typeof data === 'object') {
      (data as any)._isFallbackData = true;
    }
  }

  private scheduleDataSync(data: GameResult): void {
    // Simple retry mechanism - in production, use a more sophisticated queue
    setTimeout(async () => {
      try {
        const result = await this.primary.saveGameResult(data);
        if (result.success) {
          console.log('Successfully synced game data to primary storage');
        }
      } catch (error) {
        console.error('Failed to sync game data:', error);
      }
    }, 5000); // Retry after 5 seconds
  }
}
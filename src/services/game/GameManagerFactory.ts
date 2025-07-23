import { GameDataManager } from './GameDataManager';
import { LocalStorageGameManager } from './LocalStorageGameManager';
import { ApiGameManager } from './ApiGameManager';
import { GameDataManagerWithFallback } from './GameDataManagerWithFallback';

export interface GameManagerConfig {
  isAuthenticated: boolean;
  enableFallback?: boolean;
  preferLocal?: boolean;
}

export class GameManagerFactory {
  private static instances: Map<string, GameDataManager> = new Map();

  /**
   * Get a GameDataManager instance based on configuration
   * @param config Configuration for determining which manager to use
   * @returns GameDataManager instance
   */
  static getGameManager(config: GameManagerConfig): GameDataManager {
    const key = this.generateKey(config);
    
    // Check if we already have an instance for this configuration
    if (this.instances.has(key)) {
      return this.instances.get(key)!;
    }

    // Create new instance based on configuration
    let manager: GameDataManager;

    if (config.preferLocal || !config.isAuthenticated) {
      // Use local storage for guests or when explicitly preferred
      manager = new LocalStorageGameManager();
    } else if (config.enableFallback) {
      // Use API with fallback to local storage for authenticated users
      const apiManager = new ApiGameManager();
      const localManager = new LocalStorageGameManager();
      manager = new GameDataManagerWithFallback(apiManager, localManager);
    } else {
      // Use API only for authenticated users without fallback
      manager = new ApiGameManager();
    }

    // Cache the instance
    this.instances.set(key, manager);
    return manager;
  }

  /**
   * Clear all cached instances
   * Useful for testing or when auth state changes
   */
  static clearInstances(): void {
    this.instances.clear();
  }

  /**
   * Get the default game manager based on current auth state
   * This is a convenience method that checks localStorage for auth token
   */
  static getDefaultGameManager(): GameDataManager {
    const authToken = localStorage.getItem('authToken');
    const isAuthenticated = !!authToken;

    return this.getGameManager({
      isAuthenticated,
      enableFallback: true // Enable fallback by default for better UX
    });
  }

  /**
   * Migrate data from local storage to API when user logs in
   * @param localManager The local storage manager with guest data
   * @param apiManager The API manager for the authenticated user
   */
  static async migrateGuestData(
    localManager: GameDataManager,
    apiManager: GameDataManager
  ): Promise<{ success: boolean; migratedCount: number; errors: Error[] }> {
    const errors: Error[] = [];
    let migratedCount = 0;

    try {
      // Export all game data from local storage
      const exportResult = await localManager.exportGameData();
      
      if (!exportResult.success) {
        errors.push(new Error('Failed to export local game data'));
        return { success: false, migratedCount: 0, errors };
      }

      const gameHistory = exportResult.data;

      // Save each game result to the API
      for (const history of gameHistory) {
        try {
          // Convert history to game result format
          const gameResult = {
            gameType: history.gameType,
            score: history.score,
            playedAt: history.playedAt,
            timeElapsedSeconds: 0, // Default if not available
            ...history.additionalData
          };

          const saveResult = await apiManager.saveGameResult(gameResult as any);
          
          if (saveResult.success) {
            migratedCount++;
          } else {
            errors.push(new Error(`Failed to migrate game ${history.id}`));
          }
        } catch (error) {
          errors.push(error as Error);
        }
      }

      // Optionally clear local data after successful migration
      if (migratedCount > 0 && errors.length === 0) {
        await localManager.clearLocalData();
      }

      return {
        success: errors.length === 0,
        migratedCount,
        errors
      };
    } catch (error) {
      errors.push(error as Error);
      return { success: false, migratedCount, errors };
    }
  }

  private static generateKey(config: GameManagerConfig): string {
    return `${config.isAuthenticated}-${config.enableFallback}-${config.preferLocal}`;
  }
}
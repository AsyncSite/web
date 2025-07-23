// Export all game data management related modules
export * from './types';
export * from './GameDataManager';
export * from './LocalStorageGameManager';
export * from './ApiGameManager';
export * from './GameDataManagerWithFallback';
export * from './GameManagerFactory';

// Export a convenience function to get the default game manager
import { GameManagerFactory } from './GameManagerFactory';

export const getGameManager = () => GameManagerFactory.getDefaultGameManager();
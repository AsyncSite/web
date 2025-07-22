import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import gameApiService, { GameSession, GameState, GameResultResponse } from '../api/gameApiService';

interface GameProgressContextType {
  // Current game session
  currentSession: GameSession | null;
  isSessionLoading: boolean;
  sessionError: string | null;
  
  // Game session management
  startSession: (gameType: string, metadata?: any) => Promise<GameSession>;
  endSession: (result: any) => Promise<GameResultResponse>;
  abandonSession: () => Promise<void>;
  
  // Game state management
  saveGameState: (stateData: any, stateType?: GameState['stateType']) => Promise<void>;
  loadGameState: () => Promise<any | null>;
  hasUnsavedProgress: boolean;
  
  // Sync status
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncError: string | null;
  
  // Utils
  clearSession: () => void;
  retrySync: () => Promise<void>;
}

const GameProgressContext = createContext<GameProgressContextType | undefined>(undefined);

interface GameProgressProviderProps {
  children: ReactNode;
}

export const GameProgressProvider: React.FC<GameProgressProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  // Session state
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  
  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [hasUnsavedProgress, setHasUnsavedProgress] = useState(false);
  
  // Pending operations queue for offline support
  const [pendingOperations, setPendingOperations] = useState<Array<() => Promise<void>>>([]);

  // Load active session from localStorage on mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem('activeGameSession');
    if (savedSessionId && isAuthenticated) {
      loadSession(savedSessionId);
    }
  }, [isAuthenticated]);

  // Process pending operations when coming online
  useEffect(() => {
    const handleOnline = () => {
      if (pendingOperations.length > 0) {
        processPendingOperations();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [pendingOperations]);

  const loadSession = async (sessionId: string) => {
    try {
      setIsSessionLoading(true);
      const session = await gameApiService.getGameSession(sessionId);
      if (session.status === 'IN_PROGRESS') {
        setCurrentSession(session);
      } else {
        localStorage.removeItem('activeGameSession');
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      localStorage.removeItem('activeGameSession');
    } finally {
      setIsSessionLoading(false);
    }
  };

  const startSession = async (gameType: string, metadata?: any): Promise<GameSession> => {
    try {
      setIsSessionLoading(true);
      setSessionError(null);
      
      // End any existing session
      if (currentSession) {
        await abandonSession();
      }

      if (!isAuthenticated) {
        // For guests, create a local session
        const guestSession: GameSession = {
          sessionId: `guest-${Date.now()}`,
          gameTypeCode: gameType,
          status: 'IN_PROGRESS',
          startedAt: new Date().toISOString()
        };
        setCurrentSession(guestSession);
        return guestSession;
      }

      const session = await gameApiService.startGameSession({ 
        gameTypeCode: gameType, 
        metadata 
      });
      
      setCurrentSession(session);
      localStorage.setItem('activeGameSession', session.sessionId);
      setHasUnsavedProgress(false);
      
      return session;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to start game session';
      setSessionError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsSessionLoading(false);
    }
  };

  const endSession = async (result: any): Promise<GameResultResponse> => {
    if (!currentSession) {
      throw new Error('No active session');
    }

    try {
      setIsSyncing(true);
      setSyncError(null);

      if (!isAuthenticated || currentSession.sessionId.startsWith('guest-')) {
        // For guests, just clear the session
        clearSession();
        // Return a mock response
        return {
          recordId: 0,
          sessionId: currentSession.sessionId,
          gameType: currentSession.gameTypeCode,
          score: result.score || 0,
          isPersonalBest: false,
          playedAt: new Date().toISOString()
        };
      }

      const response = await gameApiService.endGameSession({
        sessionId: currentSession.sessionId,
        result
      });

      clearSession();
      setLastSyncTime(new Date());
      setHasUnsavedProgress(false);
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to end game session';
      setSyncError(errorMessage);
      
      // Queue for retry if offline
      if (!navigator.onLine) {
        queueOperation(async () => {
          await gameApiService.endGameSession({
            sessionId: currentSession.sessionId,
            result
          });
        });
      }
      
      throw new Error(errorMessage);
    } finally {
      setIsSyncing(false);
    }
  };

  const abandonSession = async (): Promise<void> => {
    if (!currentSession) return;

    try {
      if (isAuthenticated && !currentSession.sessionId.startsWith('guest-')) {
        await gameApiService.abandonGameSession(currentSession.sessionId);
      }
      clearSession();
    } catch (error) {
      console.error('Failed to abandon session:', error);
      clearSession();
    }
  };

  const saveGameState = async (stateData: any, stateType: GameState['stateType'] = 'CHECKPOINT'): Promise<void> => {
    if (!currentSession) return;

    try {
      setIsSyncing(true);
      setHasUnsavedProgress(true);

      // Save to localStorage first
      const localState = {
        sessionId: currentSession.sessionId,
        stateData,
        stateType,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(`gameState-${currentSession.sessionId}`, JSON.stringify(localState));

      if (isAuthenticated && !currentSession.sessionId.startsWith('guest-')) {
        await gameApiService.saveGameState(currentSession.sessionId, stateData, stateType);
        setLastSyncTime(new Date());
        setHasUnsavedProgress(false);
      }
    } catch (error) {
      console.error('Failed to save game state:', error);
      
      // Queue for retry if offline
      if (!navigator.onLine) {
        queueOperation(async () => {
          await gameApiService.saveGameState(currentSession.sessionId, stateData, stateType);
        });
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const loadGameState = async (): Promise<any | null> => {
    if (!currentSession) return null;

    try {
      // Try to load from server first
      if (isAuthenticated && !currentSession.sessionId.startsWith('guest-')) {
        const serverState = await gameApiService.loadGameState(currentSession.sessionId);
        if (serverState) {
          return JSON.parse(serverState.stateData);
        }
      }

      // Fall back to localStorage
      const localState = localStorage.getItem(`gameState-${currentSession.sessionId}`);
      if (localState) {
        const parsed = JSON.parse(localState);
        return parsed.stateData;
      }

      return null;
    } catch (error) {
      console.error('Failed to load game state:', error);
      return null;
    }
  };

  const clearSession = () => {
    if (currentSession) {
      localStorage.removeItem('activeGameSession');
      localStorage.removeItem(`gameState-${currentSession.sessionId}`);
    }
    setCurrentSession(null);
    setSessionError(null);
    setHasUnsavedProgress(false);
  };

  const queueOperation = (operation: () => Promise<void>) => {
    setPendingOperations(prev => [...prev, operation]);
  };

  const processPendingOperations = async () => {
    const operations = [...pendingOperations];
    setPendingOperations([]);

    for (const operation of operations) {
      try {
        await operation();
      } catch (error) {
        console.error('Failed to process pending operation:', error);
      }
    }
  };

  const retrySync = async () => {
    if (pendingOperations.length > 0) {
      await processPendingOperations();
    }
  };

  const value: GameProgressContextType = {
    // Session state
    currentSession,
    isSessionLoading,
    sessionError,
    
    // Session management
    startSession,
    endSession,
    abandonSession,
    
    // State management
    saveGameState,
    loadGameState,
    hasUnsavedProgress,
    
    // Sync status
    isSyncing,
    lastSyncTime,
    syncError,
    
    // Utils
    clearSession,
    retrySync
  };

  return (
    <GameProgressContext.Provider value={value}>
      {children}
    </GameProgressContext.Provider>
  );
};

export const useGameProgress = () => {
  const context = useContext(GameProgressContext);
  if (context === undefined) {
    throw new Error('useGameProgress must be used within a GameProgressProvider');
  }
  return context;
};
import { GameSession } from '../../api/gameApiService';
import gameApiService from '../../api/gameApiService';

export interface StoredSession {
  sessionId: string;
  gameType: string;
  timestamp: number;
}

class SessionRecoveryService {
  private readonly SESSION_KEY_PREFIX = 'game_session_';
  private readonly SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Save a game session to sessionStorage
   */
  saveSession(gameType: string, sessionId: string): void {
    const key = this.getSessionKey(gameType);
    const sessionData: StoredSession = {
      sessionId,
      gameType,
      timestamp: Date.now()
    };
    
    try {
      sessionStorage.setItem(key, JSON.stringify(sessionData));
    } catch (error) {
      // Handle quota exceeded or other storage errors
      console.error('Failed to save session:', error);
    }
  }

  /**
   * Get a stored session from sessionStorage
   */
  getStoredSession(gameType: string): StoredSession | null {
    const key = this.getSessionKey(gameType);
    
    try {
      const data = sessionStorage.getItem(key);
      if (!data) return null;
      
      const session = JSON.parse(data) as StoredSession;
      
      // Check if session is expired
      if (this.isSessionExpired(session)) {
        this.clearSession(gameType);
        return null;
      }
      
      return session;
    } catch (error) {
      console.error('Failed to retrieve session:', error);
      return null;
    }
  }

  /**
   * Validate and recover a session from the server
   */
  async validateAndRecoverSession(gameType: string): Promise<GameSession | null> {
    const storedSession = this.getStoredSession(gameType);
    if (!storedSession) return null;
    
    try {
      // Validate session with the server
      const session = await gameApiService.getGameSession(storedSession.sessionId);
      
      // Check if session is still in progress
      if (session.status === 'IN_PROGRESS') {
        return session;
      }
      
      // Clear invalid session
      this.clearSession(gameType);
      return null;
    } catch (error) {
      // Session not found or other error
      this.clearSession(gameType);
      return null;
    }
  }

  /**
   * Clear a stored session
   */
  clearSession(gameType: string): void {
    const key = this.getSessionKey(gameType);
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  /**
   * Clear all stored sessions
   */
  clearAllSessions(): void {
    try {
      // Get all keys that match our session pattern
      const keys = Object.keys(sessionStorage).filter(key => 
        key.startsWith(this.SESSION_KEY_PREFIX)
      );
      
      keys.forEach(key => sessionStorage.removeItem(key));
    } catch (error) {
      console.error('Failed to clear all sessions:', error);
    }
  }

  /**
   * Get all active sessions
   */
  getAllActiveSessions(): StoredSession[] {
    const sessions: StoredSession[] = [];
    
    try {
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith(this.SESSION_KEY_PREFIX)) {
          const data = sessionStorage.getItem(key);
          if (data) {
            const session = JSON.parse(data) as StoredSession;
            if (!this.isSessionExpired(session)) {
              sessions.push(session);
            }
          }
        }
      });
    } catch (error) {
      console.error('Failed to get all sessions:', error);
    }
    
    return sessions;
  }

  /**
   * Check if a specific game type has an active session
   */
  hasActiveSession(gameType: string): boolean {
    const session = this.getStoredSession(gameType);
    return session !== null;
  }

  /**
   * Update session timestamp to extend expiry
   */
  touchSession(gameType: string): void {
    const session = this.getStoredSession(gameType);
    if (session) {
      session.timestamp = Date.now();
      this.saveSession(gameType, session.sessionId);
    }
  }

  private getSessionKey(gameType: string): string {
    return `${this.SESSION_KEY_PREFIX}${gameType}`;
  }

  private isSessionExpired(session: StoredSession): boolean {
    return Date.now() - session.timestamp > this.SESSION_EXPIRY_MS;
  }

  /**
   * Migrate from localStorage to sessionStorage if needed
   * (for backward compatibility)
   */
  migrateFromLocalStorage(): void {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.SESSION_KEY_PREFIX)) {
          const data = localStorage.getItem(key);
          if (data) {
            sessionStorage.setItem(key, data);
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.error('Failed to migrate sessions:', error);
    }
  }
}

// Export singleton instance
export const sessionRecoveryService = new SessionRecoveryService();

// Export for testing
export { SessionRecoveryService };
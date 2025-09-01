import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../api/authService';
import userService from '../api/userService';
import gameApiService, { TetrisGameResult, DeductionGameResult } from '../api/gameApiService';
import { handleApiError } from '../api/client';
import { AUTH_EVENTS, addAuthEventListener, dispatchAuthEvent } from '../utils/authEvents';
import { GameHistory } from '../services/game/types';
import {
  AuthContextType,
  User,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  ChangePasswordRequest
} from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): React.ReactNode {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Migrate guest scores to logged-in user
  const migrateGuestScores = useCallback(async () => {
    try {
      // Read complete game history from localStorage
      const gameHistoryJson = localStorage.getItem('game-history');
      if (!gameHistoryJson) {
        // Fallback to legacy Tetris score migration
        await migrateLegacyTetrisScore();
        return;
      }

      const gameHistory: GameHistory[] = JSON.parse(gameHistoryJson);
      if (!gameHistory || gameHistory.length === 0) {
        return;
      }

      // Track successfully migrated game IDs to avoid duplicates
      const migratedGameIds: string[] = [];
      
      // Get previously migrated game IDs to prevent duplicates
      const previouslyMigratedJson = localStorage.getItem('migrated-game-ids');
      const previouslyMigrated = previouslyMigratedJson ? JSON.parse(previouslyMigratedJson) : [];

      // Migrate each game record
      for (const historyEntry of gameHistory) {
        // Skip if already migrated
        if (previouslyMigrated.includes(historyEntry.id)) {
          continue;
        }

        try {
          // Start a game session
          const session = await gameApiService.startGameSession({
            gameTypeCode: historyEntry.gameType
          });

          // Prepare game result based on type
          let gameResult;
          if (historyEntry.gameType === 'TETRIS') {
            const tetrisResult: TetrisGameResult = {
              gameType: 'TETRIS',
              score: historyEntry.score,
              level: historyEntry.additionalData?.level || 1,
              linesCleared: historyEntry.additionalData?.linesCleared || 0,
              timeElapsedSeconds: historyEntry.additionalData?.timeElapsedSeconds || 0,
              maxCombo: historyEntry.additionalData?.maxCombo || 0,
              gameData: JSON.stringify({
                migratedFromGuest: true,
                originalId: historyEntry.id,
                originalPlayedAt: historyEntry.playedAt,
                ...historyEntry.additionalData
              })
            };
            gameResult = tetrisResult;
          } else if (historyEntry.gameType === 'DEDUCTION') {
            const deductionResult: DeductionGameResult = {
              gameType: 'DEDUCTION',
              score: historyEntry.score,
              won: historyEntry.additionalData?.won || false,
              difficulty: historyEntry.additionalData?.difficulty || 'medium',
              guessesCount: historyEntry.additionalData?.guessesCount || 1,
              hintsUsed: historyEntry.additionalData?.hintsUsed || 0,
              wrongAnswerHintsUsed: historyEntry.additionalData?.wrongAnswerHintsUsed || 0,
              correctAnswerHintsUsed: historyEntry.additionalData?.correctAnswerHintsUsed || 0,
              timeElapsedSeconds: historyEntry.additionalData?.timeElapsedSeconds || 0,
              playersCount: historyEntry.additionalData?.playersCount || 4,
              opponentType: historyEntry.additionalData?.opponentType || 'AI',
              opponentDifficulty: historyEntry.additionalData?.opponentDifficulty,
              opponentId: historyEntry.additionalData?.opponentId,
              gameData: JSON.stringify({
                migratedFromGuest: true,
                originalId: historyEntry.id,
                originalPlayedAt: historyEntry.playedAt,
                ...historyEntry.additionalData
              })
            };
            gameResult = deductionResult;
          } else {
            // Skip unknown game types
            continue;
          }

          // End the session with the migrated data
          await gameApiService.endGameSession({
            sessionId: session.sessionId,
            result: gameResult
          });

          // Track successful migration
          migratedGameIds.push(historyEntry.id);
        } catch (error) {
          // Continue with next game if one fails
          console.error(`Failed to migrate game ${historyEntry.id}:`, error);
        }
      }

      // Update migrated game IDs in localStorage
      if (migratedGameIds.length > 0) {
        const allMigratedIds = [...previouslyMigrated, ...migratedGameIds];
        localStorage.setItem('migrated-game-ids', JSON.stringify(allMigratedIds));
      }

      // Clear legacy storage after successful migration
      localStorage.removeItem('tetris-high-score');
      localStorage.removeItem('tetris-last-played');
      localStorage.removeItem('tetris-play-count');
    } catch (error) {
      console.error('Migration failed:', error);
      // Don't throw - migration failure shouldn't block login
    }
  }, []);

  // Fallback migration for legacy Tetris scores
  const migrateLegacyTetrisScore = async () => {
    try {
      const tetrisHighScore = localStorage.getItem('tetris-high-score');
      if (tetrisHighScore) {
        const score = parseInt(tetrisHighScore);
        const lastPlayed = localStorage.getItem('tetris-last-played') || new Date().toISOString();
        
        try {
          const session = await gameApiService.startGameSession({
            gameTypeCode: 'TETRIS'
          });
          
          const tetrisResult: TetrisGameResult = {
            gameType: 'TETRIS',
            score: score,
            level: 1,
            linesCleared: 0,
            timeElapsedSeconds: 0,
            maxCombo: 0,
            gameData: JSON.stringify({ 
              migratedFromGuest: true, 
              originalPlayedAt: lastPlayed,
              legacyMigration: true 
            })
          };
          
          await gameApiService.endGameSession({
            sessionId: session.sessionId,
            result: tetrisResult
          });
          
          localStorage.removeItem('tetris-high-score');
          localStorage.removeItem('tetris-last-played');
        } catch (error) {
          // Silently fail
        }
      }
    } catch (error) {
      // Silently fail
    }
  };

  // Listen for unauthorized events
  useEffect(() => {
    const handleUnauthorized = (event: CustomEvent) => {
      // Clear user state
      setUser(null);
      
      // Only redirect to login if not already there
      if (location.pathname !== '/login' && location.pathname !== '/') {
        navigate('/login', { replace: true });
      }
    };

    const cleanup = addAuthEventListener(AUTH_EVENTS.UNAUTHORIZED, handleUnauthorized);
    return cleanup;
  }, [navigate, location.pathname]);

  // Listen for login success events (e.g., WebAuthn flows that bypass AuthContext.login)
  useEffect(() => {
    const handleLoginSuccess = async () => {
      try {
        // Token should already be stored by the caller
        const userProfile = await userService.getProfile();
        setUser(userProfile);
      } catch (error) {
        // If fetching profile fails, keep token-based auth; UI can retry later
      }
    };

    const cleanup = addAuthEventListener(AUTH_EVENTS.LOGIN_SUCCESS, handleLoginSuccess as any);
    return cleanup;
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = authService.getStoredToken();
        if (token) {
          // First validate the token
          await authService.validateToken();
          // Then get the full user profile with name
          const userProfile = await userService.getProfile();
          setUser(userProfile);
        }
      } catch (error) {
        authService.clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    console.log('[AuthContext] login \ud568\uc218 \ud638\ucd9c');
    try {
      const response = await authService.login(credentials);
      authService.storeAuthData(response);
      
      // Fetch full user profile after login
      const userProfile = await userService.getProfile();
      console.log('[AuthContext] setUser \ud638\ucd9c \uc804');
      setUser(userProfile);
      console.log('[AuthContext] setUser \ud638\ucd9c \ud6c4, user:', userProfile);
      
      // Migrate guest scores after successful login (don't await to prevent blocking)
      migrateGuestScores().catch(() => {
        // Silently fail - migration failure shouldn't block login
      });
      
      // Dispatch login success event
      dispatchAuthEvent(AUTH_EVENTS.LOGIN_SUCCESS, { user: userProfile });
      console.log('[AuthContext] login \uc131\uacf5 \uc644\ub8cc');
    } catch (error) {
      console.log('[AuthContext] login \uc2e4\ud328:', error);
      throw new Error(handleApiError(error));
    }
  }, [migrateGuestScores]);

  const logout = useCallback(async (options?: { redirectTo?: string }) => {
    const currentPath = window.location.pathname;
    const protectedRoutes = ['/users/me', '/users/me/edit'];
    
    try {
      await authService.logout();
    } finally {
      setUser(null);
      // Clear auth data
      authService.clearAuthData();
      
      // Clear session storage as well
      sessionStorage.clear();
      
      // Determine redirect path - always go to landing page unless specified
      let redirectPath: string;
      if (options?.redirectTo) {
        redirectPath = options.redirectTo;
      } else {
        redirectPath = '/';
      }
      
      // Force navigation and reload to clear any cached state
      window.location.href = redirectPath;
    }
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    try {
      await userService.register(data);
      // After successful registration, login the user
      await login({ username: data.email, password: data.password });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }, [login]);

  // Ref for polling interval
  const profileImagePollingRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to poll for final image URL
  const pollForFinalImageUrl = useCallback((pendingUrl: string, userId: string) => {
    let attempts = 0;
    const maxAttempts = 30;
    const pollInterval = 2000;

    // Clear any existing polling
    if (profileImagePollingRef.current) {
      clearInterval(profileImagePollingRef.current);
    }

    profileImagePollingRef.current = setInterval(async () => {
      attempts++;

      try {
        // Build full URL for polling
        const fullUrl = pendingUrl.startsWith('http') 
          ? pendingUrl 
          : `${window.location.origin}${pendingUrl}`;

        const response = await fetch(fullUrl, {
          method: 'HEAD', // Use HEAD to check status without downloading
          redirect: 'manual'
        });

        // If redirected or status changed, reload profile
        if (response.type === 'opaqueredirect' || response.status === 302 || response.status === 301) {
          // Clear interval
          if (profileImagePollingRef.current) {
            clearInterval(profileImagePollingRef.current);
            profileImagePollingRef.current = null;
          }

          // Reload full profile to get final URL
          try {
            const updatedProfile = await userService.getProfile();
            setUser(updatedProfile);
          } catch (error) {
            console.error('Failed to reload profile after image upload:', error);
          }
          return;
        }

        // Also try fetching with GET to check content type
        const getResponse = await fetch(fullUrl, { method: 'GET' });
        const contentType = getResponse.headers.get('content-type');
        
        // If we get an image back, upload is complete
        if (contentType?.startsWith('image/')) {
          if (profileImagePollingRef.current) {
            clearInterval(profileImagePollingRef.current);
            profileImagePollingRef.current = null;
          }

          // Reload profile
          try {
            const updatedProfile = await userService.getProfile();
            setUser(updatedProfile);
          } catch (error) {
            console.error('Failed to reload profile after image upload:', error);
          }
          return;
        }

        // Check for JSON response with status
        if (contentType?.includes('application/json')) {
          const data = await getResponse.json();
          if (data.status === 'COMPLETED' || data.uploadStatus === 'COMPLETED') {
            if (profileImagePollingRef.current) {
              clearInterval(profileImagePollingRef.current);
              profileImagePollingRef.current = null;
            }

            // Reload profile
            try {
              const updatedProfile = await userService.getProfile();
              setUser(updatedProfile);
            } catch (error) {
              console.error('Failed to reload profile after image upload:', error);
            }
            return;
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }

      // Stop after max attempts
      if (attempts >= maxAttempts) {
        if (profileImagePollingRef.current) {
          clearInterval(profileImagePollingRef.current);
          profileImagePollingRef.current = null;
        }
        console.warn('Profile image upload polling timeout');
      }
    }, pollInterval);
  }, []);

  const updateProfile = useCallback(async (data: UpdateProfileRequest) => {
    try {
      const updatedUser = await userService.updateProfile(data);
      setUser(updatedUser);

      // Check if profile image is a pending URL
      if (updatedUser.profileImage && updatedUser.profileImage.includes('/pending/')) {
        // Start polling for final URL
        pollForFinalImageUrl(updatedUser.profileImage, updatedUser.id);
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }, [pollForFinalImageUrl]);

  const changePassword = useCallback(async (data: ChangePasswordRequest) => {
    try {
      await userService.changePassword(data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const storedRefreshToken = authService.getStoredRefreshToken();
      if (!storedRefreshToken) throw new Error('No refresh token available');
      
      const response = await authService.refreshToken(storedRefreshToken);
      // Just update the access token, keep other data
      localStorage.setItem('authToken', response.accessToken);
    } catch (error) {
      await logout();
      throw new Error(handleApiError(error));
    }
  }, [logout]);

  // Add a method to manually update user state
  const setUserState = useCallback((newUser: User | null) => {
    setUser(newUser);
  }, []);

  const value: AuthContextType = {
    user,
    // Progressive authentication check:
    // - During initial loading: check token existence to prevent redirect flicker on page refresh
    // - After loading complete: rely only on user object for accurate authentication state
    // This prevents 401 errors when token exists but is invalid/expired
    isAuthenticated: isLoading ? !!authService.getStoredToken() : !!user,
    isLoading,
    login,
    logout,
    register,
    updateProfile,
    changePassword,
    refreshToken,
    setUserState
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
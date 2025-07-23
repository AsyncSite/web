import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../api/authService';
import userService from '../api/userService';
import gameApiService, { TetrisGameResult } from '../api/gameApiService';
import { handleApiError } from '../api/client';
import { AUTH_EVENTS, addAuthEventListener, dispatchAuthEvent } from '../utils/authEvents';
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
      // Check for Tetris guest score
      const tetrisHighScore = localStorage.getItem('tetris-high-score');
      if (tetrisHighScore) {
        const score = parseInt(tetrisHighScore);
        const lastPlayed = localStorage.getItem('tetris-last-played') || new Date().toISOString();
        
        // Start a session and immediately end it with the guest score
        try {
          const session = await gameApiService.startGameSession({
            gameTypeCode: 'TETRIS'
          });
          
          const tetrisResult: TetrisGameResult = {
            gameType: 'TETRIS',
            score: score,
            level: 1, // Default level for migrated scores
            linesCleared: 0, // Default lines for migrated scores
            timeElapsedSeconds: 0, // Default time for migrated scores
            maxCombo: 0, // Default combo for migrated scores
            gameData: JSON.stringify({ migratedFromGuest: true, originalPlayedAt: lastPlayed })
          };
          
          await gameApiService.endGameSession({
            sessionId: session.sessionId,
            result: tetrisResult
          });
          
          // Clear guest scores after successful migration
          localStorage.removeItem('tetris-high-score');
          localStorage.removeItem('tetris-last-played');
        } catch (error) {
          // Silently fail - migration failure shouldn't block login
        }
      }
    } catch (error) {
      // Don't throw error - migration failure shouldn't block login
    }
  }, []);

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
    try {
      const response = await authService.login(credentials);
      authService.storeAuthData(response);
      
      // Fetch full user profile after login
      const userProfile = await userService.getProfile();
      setUser(userProfile);
      
      // Migrate guest scores after successful login (don't await to prevent blocking)
      migrateGuestScores().catch(() => {
        // Silently fail - migration failure shouldn't block login
      });
      
      // Dispatch login success event
      dispatchAuthEvent(AUTH_EVENTS.LOGIN_SUCCESS, { user: userProfile });
    } catch (error) {
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
      
      // Determine redirect path
      let redirectPath: string;
      if (options?.redirectTo) {
        redirectPath = options.redirectTo;
      } else if (protectedRoutes.includes(currentPath)) {
        redirectPath = '/';
      } else {
        redirectPath = currentPath;
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

  const updateProfile = useCallback(async (data: UpdateProfileRequest) => {
    try {
      const updatedUser = await userService.updateProfile(data);
      setUser(updatedUser);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }, []);

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

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
    updateProfile,
    changePassword,
    refreshToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../api/authService';
import userService from '../api/userService';
import { handleApiError } from '../api/client';
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

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = authService.getStoredToken();
        if (token) {
          const validatedUser = await authService.validateToken();
          setUser(validatedUser);
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
      
      // Don't navigate here - let the LoginPage handle it
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      navigate('/login');
    }
  }, [navigate]);

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
      const refreshToken = authService.getStoredRefreshToken();
      if (!refreshToken) throw new Error('No refresh token available');
      
      const response = await authService.refreshToken(refreshToken);
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
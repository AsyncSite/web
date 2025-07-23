import apiClient from './client';
import {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  TokenResponse,
  User,
  ApiResponse
} from '../types/auth';

class AuthService {
  /**
   * Login user with email/username and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<ApiResponse<LoginResponse>>('/api/auth/login', credentials);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/auth/logout');
    } catch (error) {
      // Even if logout fails on server, clear local storage
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const request: RefreshTokenRequest = { refreshToken };
    const response = await apiClient.post<ApiResponse<TokenResponse>>('/api/auth/refresh', request);
    return response.data.data;
  }

  /**
   * Validate current token and get user info
   */
  async validateToken(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/api/auth/validate');
    return response.data.data;
  }

  /**
   * Store authentication data in localStorage
   */
  storeAuthData(loginResponse: LoginResponse): void {
    localStorage.setItem('authToken', loginResponse.accessToken);
    localStorage.setItem('refreshToken', loginResponse.refreshToken);
    
    // Store user data
    const user: Partial<User> = {
      email: loginResponse.email,
      username: loginResponse.username,
      roles: loginResponse.roles,
    };
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Get stored authentication token
   */
  getStoredToken(): string | null {
    return localStorage.getItem('authToken');
  }

  /**
   * Get stored refresh token
   */
  getStoredRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  /**
   * Get stored user data
   */
  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  }

  /**
   * Check if user is authenticated (has valid token)
   */
  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }

  /**
   * Clear all authentication data
   */
  clearAuthData(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
}

export default new AuthService();
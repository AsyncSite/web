import apiClient from './client';
import {
  RegisterRequest,
  RegisterResponse,
  User,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ApiResponse
} from '../types/auth';

class UserService {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post<ApiResponse<RegisterResponse>>('/api/users/register', data);
    return response.data.data;
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/api/users/me');
    return response.data.data;
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>('/api/users/me', data);
    return response.data.data;
  }

  /**
   * Change user password
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await apiClient.put('/api/users/me/password', data);
  }

  /**
   * Deactivate user account
   */
  async deactivateAccount(): Promise<void> {
    await apiClient.post('/api/users/me/deactivate');
  }

  /**
   * Delete user account (soft delete)
   */
  async deleteAccount(): Promise<void> {
    await apiClient.delete('/api/users/me');
  }

  /**
   * Check if email is already registered
   * Note: This might not be exposed by the backend for security reasons
   * In that case, handle the 409 conflict error during registration
   */
  async checkEmailAvailability(email: string): Promise<boolean> {
    try {
      const response = await apiClient.get(`/api/users/check-email?email=${encodeURIComponent(email)}`);
      return response.data.available;
    } catch (error) {
      // If endpoint doesn't exist, return true and let registration handle conflicts
      return true;
    }
  }
}

export default new UserService();
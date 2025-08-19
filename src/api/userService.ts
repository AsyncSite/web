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
    const response = await apiClient.post<RegisterResponse>('/api/users/register', data);
    return response.data;
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response = await apiClient.get<User>('/api/users/me');
    // API가 직접 User 객체를 반환하는 경우
    return response.data;
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const response = await apiClient.put<User>('/api/users/me', data);
    return response.data;
  }

  /**
   * Update user profile with image file
   * Converts image to base64 and includes it in the profile data
   */
  async updateProfileWithImage(
    profileData: UpdateProfileRequest,
    imageFile?: File
  ): Promise<User> {
    let profileDataWithImage = { ...profileData };
    
    // Convert image to base64 if provided
    if (imageFile) {
      const base64Image = await this.fileToBase64(imageFile);
      profileDataWithImage = {
        ...profileData,
        profileImageData: {
          fileName: imageFile.name,
          mimeType: imageFile.type,
          base64Data: base64Image
        }
      };
    }
    
    // Use regular updateProfile endpoint with image data included
    const response = await apiClient.put<User>('/api/users/me', profileDataWithImage);
    return response.data;
  }

  /**
   * Convert file to base64 string
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove data URL prefix (e.g., "data:image/png;base64,")
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
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
      const response = await apiClient.post('/api/users/check-email', { email });
      // Check if response has data.data structure (ApiResponse wrapper)
      const responseData = response.data.data || response.data;
      return responseData.available;
    } catch (error) {
      // If endpoint doesn't exist or errors, return true and let registration handle conflicts
      return true;
    }
  }

  /**
   * Get public team members for WhoWeAre page
   * Returns only public-safe information
   */
  async getWhoWeAreMembers(): Promise<Array<{
    name: string;
    role?: string;
    quote?: string;
    bio?: string;
    profileImage?: string;
  }>> {
    try {
      const response = await apiClient.get('/api/public/users/whoweare-members');
      return response.data;
    } catch (error) {
      // Return empty array if fetching fails to prevent UI issues
      return [];
    }
  }
}

export default new UserService();
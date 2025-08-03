import apiClient from './client';
import {NotiSetting, UpdateNotificationSettingsRequest} from "../types/noti";

class NotiService {
  /**
   * Register a new user
   */
  async updateNotiSetting(userId: string, data: UpdateNotificationSettingsRequest): Promise<NotiSetting> {
    const response = await apiClient.post<NotiSetting>(`/api/v1/users/${userId}/notification-settings`, data);
    return response.data;
  }

  /**
   * Get current user profile
   */
  async getNotiSetting(userId: string): Promise<NotiSetting> {
    const response = await apiClient.get<NotiSetting>(`/api/v1/users/${userId}/notification-settings`);
    return response.data;
  }
}

export default new NotiService();
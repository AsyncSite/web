import apiClient from './client';
import {NotiSetting, UpdateNotificationSettingsRequest} from "../types/noti";

class NotiService {
  baseUrl = "/api/noti/settings/";
  /**
   * Register a new user
   */
  async updateNotiSetting(userId: string, data: UpdateNotificationSettingsRequest): Promise<NotiSetting> {
    const response = await apiClient.post<NotiSetting>(`${this.baseUrl}${userId}`, data);
    return response.data;
  }

  /**
   * Get current user profile
   */
  async getNotiSetting(userId: string): Promise<NotiSetting> {
    const response = await apiClient.get<NotiSetting>(`${this.baseUrl}${userId}`);
    return response.data;
  }
}

export default new NotiService();
import apiClient from './client';
import {NotiSetting, UpdateNotificationSettingsRequest} from "../types/noti";

class NotiService {
  private readonly baseUrl = "/api/noti/settings/";
  
  /**
   * Update notification settings
   */
  updateNotiSetting = async (userId: string, data: UpdateNotificationSettingsRequest): Promise<NotiSetting> => {
    const response = await apiClient.post<NotiSetting>(`${this.baseUrl}${userId}`, data);
    return response.data;
  }

  /**
   * Get notification settings
   */
  getNotiSetting = async (userId: string): Promise<NotiSetting> => {
    const response = await apiClient.get<NotiSetting>(`${this.baseUrl}${userId}`);
    return response.data;
  }
}

export default new NotiService();
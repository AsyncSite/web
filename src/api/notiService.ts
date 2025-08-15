import apiClient, {handleApiError} from './client';
import {NotiSetting, UpdateNotificationSettingsRequest,} from "../types/noti";
import {ApiResponse} from "../types/auth";

class NotiService {
    private readonly baseUrl = "/api/noti";

    getNotiSetting = async (userId: string): Promise<NotiSetting> => {
        return apiClient.get<ApiResponse<NotiSetting>>(`${this.baseUrl}/settings/${userId}`)
            .then(response => response.data.data)
            .catch(error => {
                throw new Error(handleApiError(error))
            })
    }

    // Approve a study (admin only)
    updateNotiSetting = async (userId: string, data: UpdateNotificationSettingsRequest): Promise<ApiResponse<NotiSetting>> => {
        return apiClient.put(`${this.baseUrl}/settings/${userId}`, data)
            .then(response => response.data.data)
            .catch(error => {
                throw new Error(handleApiError(error))
            })
    }
}

export default new NotiService();
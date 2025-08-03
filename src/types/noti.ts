export interface NotiSetting {
    userId: string;
    studyUpdates: boolean;
    marketing: boolean;
    emailEnabled: boolean;
    discordEnabled: boolean;
    pushEnabled: boolean;
    timezone: string;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateNotificationSettingsRequest {
    studyUpdates: boolean;
    marketing: boolean;
    emailEnabled: boolean;
    discordEnabled: boolean;
    pushEnabled: boolean;
}
import { GameHistoryService } from './GameHistoryService';
import { ParticipantStatsService } from './ParticipantStatsService';

export { GameHistoryService } from './GameHistoryService';
export { ParticipantStatsService } from './ParticipantStatsService';
export { BaseStorageService } from './BaseStorageService';

// 싱글톤 인스턴스 export
export const gameHistoryService = GameHistoryService.getInstance();
export const participantStatsService = ParticipantStatsService.getInstance();

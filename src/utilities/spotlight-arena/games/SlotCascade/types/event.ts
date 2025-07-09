// 이벤트 타입 정의
export type EventType = 'goldenRush' | 'symbolRain' | 'reversalChance' | 'megaTime' | 'none';

// 이벤트 정보
export interface EventInfo {
  type: EventType;
  name: string;
  description: string;
  duration: number; // 초 단위
  icon: string;
  color: string;
}

// 활성 이벤트
export interface ActiveEvent {
  type: EventType;
  startTime: number;
  endTime: number;
  remainingTime: number;
}

// 이벤트 목록
export const EVENTS: Record<EventType, EventInfo> = {
  goldenRush: {
    type: 'goldenRush',
    name: '골든 러시',
    description: '모든 매칭 점수 3배!',
    duration: 10,
    icon: '⚡',
    color: '#ffd700',
  },
  symbolRain: {
    type: 'symbolRain',
    name: '심볼 레인',
    description: '특수 심볼만 떨어집니다!',
    duration: 5,
    icon: '🌟',
    color: '#ff6b6b',
  },
  reversalChance: {
    type: 'reversalChance',
    name: '역전 찬스',
    description: '하위 3명에게 메가 잭팟 심볼!',
    duration: 0, // 즉시 효과
    icon: '🔄',
    color: '#4caf50',
  },
  megaTime: {
    type: 'megaTime',
    name: '대박 타임',
    description: '다음 스핀 10연속 캐스케이드 보장!',
    duration: 15,
    icon: '🎰',
    color: '#9c27b0',
  },
  none: {
    type: 'none',
    name: '',
    description: '',
    duration: 0,
    icon: '',
    color: '',
  },
};

// 이벤트 효과
export interface EventEffect {
  scoreMultiplier?: number;
  specialSymbolOnly?: boolean;
  guaranteedCascades?: number;
  instantMegaJackpot?: string[]; // 플레이어 ID 리스트
}

// 이벤트 트리거 조건
export interface EventTriggerCondition {
  minTimeElapsed: number; // 최소 경과 시간
  maxScoreGap?: number; // 최대 점수 차이
  minPlayers?: number; // 최소 플레이어 수
  randomChance: number; // 발생 확률 (0-1)
}
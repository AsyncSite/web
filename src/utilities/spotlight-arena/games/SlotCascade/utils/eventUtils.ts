import { EventType, EVENTS, ActiveEvent, EventTriggerCondition } from '../types/event';
import { PlayerState } from '../types/game';

// 이벤트 트리거 조건 설정
const EVENT_TRIGGER_CONDITIONS: Record<EventType, EventTriggerCondition> = {
  goldenRush: {
    minTimeElapsed: 30,
    randomChance: 0.3,
  },
  symbolRain: {
    minTimeElapsed: 45,
    randomChance: 0.25,
  },
  reversalChance: {
    minTimeElapsed: 60,
    maxScoreGap: 50000,
    randomChance: 0.4,
  },
  megaTime: {
    minTimeElapsed: 90,
    randomChance: 0.2,
  },
  none: {
    minTimeElapsed: 0,
    randomChance: 0,
  },
};

// 다음 이벤트 결정
export const determineNextEvent = (
  elapsedTime: number,
  players: PlayerState[],
  lastEventTime: number,
  remainingTime: number
): EventType | null => {
  // 마지막 30초 (파이널 카운트다운)
  const isFinalCountdown = remainingTime <= 30;
  
  // 파이널 카운트다운 중에는 더 자주 이벤트 발생
  const minEventInterval = isFinalCountdown ? 5 : 20;
  
  // 마지막 이벤트로부터 최소 시간 경과해야 함
  if (elapsedTime - lastEventTime < minEventInterval) return null;
  
  // 점수 차이 계산
  const scores = players.map(p => p.score).sort((a, b) => b - a);
  const scoreGap = scores.length > 1 ? scores[0] - scores[scores.length - 1] : 0;
  
  // 가능한 이벤트 확인
  const possibleEvents: EventType[] = [];
  
  Object.entries(EVENT_TRIGGER_CONDITIONS).forEach(([eventType, condition]) => {
    if (eventType === 'none') return;
    
    // 시간 조건
    if (elapsedTime < condition.minTimeElapsed) return;
    
    // 점수 차이 조건
    if (condition.maxScoreGap && scoreGap < condition.maxScoreGap) return;
    
    // 파이널 카운트다운에서는 확률 2배
    const chance = isFinalCountdown ? condition.randomChance * 2 : condition.randomChance;
    
    // 확률 체크
    if (Math.random() < chance) {
      possibleEvents.push(eventType as EventType);
    }
  });
  
  // 파이널 카운트다운 중에는 특별한 이벤트 추가
  if (isFinalCountdown && possibleEvents.length === 0) {
    // 강제로 극적인 이벤트 발생
    if (scoreGap > 30000) {
      possibleEvents.push('reversalChance');
    } else {
      possibleEvents.push('goldenRush', 'megaTime');
    }
  }
  
  // 랜덤하게 하나 선택
  if (possibleEvents.length > 0) {
    return possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
  }
  
  return null;
};

// 활성 이벤트 생성
export const createActiveEvent = (type: EventType): ActiveEvent => {
  const eventInfo = EVENTS[type];
  const now = Date.now();
  
  return {
    type,
    startTime: now,
    endTime: now + eventInfo.duration * 1000,
    remainingTime: eventInfo.duration,
  };
};

// 이벤트 남은 시간 계산
export const calculateEventRemainingTime = (event: ActiveEvent): number => {
  const now = Date.now();
  const remaining = Math.max(0, event.endTime - now) / 1000;
  return Math.ceil(remaining);
};

// 역전 찬스 대상 플레이어 선정
export const getReversalChanceTargets = (players: PlayerState[], count: number = 3): string[] => {
  // 점수 기준 하위 플레이어 선정
  const sortedPlayers = [...players].sort((a, b) => a.score - b.score);
  return sortedPlayers.slice(0, count).map(p => p.id);
};

// 이벤트 효과 적용 여부 확인
export const shouldApplyEventEffect = (
  eventType: EventType,
  playerId?: string,
  targetPlayerIds?: string[]
): boolean => {
  switch (eventType) {
    case 'goldenRush':
    case 'symbolRain':
    case 'megaTime':
      return true; // 모든 플레이어에게 적용
      
    case 'reversalChance':
      // 특정 플레이어에게만 적용
      return playerId ? targetPlayerIds?.includes(playerId) ?? false : false;
      
    default:
      return false;
  }
};
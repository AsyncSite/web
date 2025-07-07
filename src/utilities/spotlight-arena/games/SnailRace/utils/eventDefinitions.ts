import { SnailRaceEvent } from '../../../shared/types';

// 달팽이 레이스 이벤트 정의
export const SNAIL_RACE_EVENTS: SnailRaceEvent[] = [
  {
    id: 'sparkle-dew',
    name: '반짝이는 이슬',
    icon: '🌟',
    duration: 2000,
    speedModifier: 2.0,
    probability: 0.15,
  },
  {
    id: 'nap-time',
    name: '꿀잠 타임',
    icon: '💤',
    duration: 1500,
    speedModifier: 0,
    probability: 0.15,
  },
  {
    id: 'slippery-leaf',
    name: '미끄러운 나뭇잎',
    icon: '🍃',
    duration: 1000,
    speedModifier: 1.5,
    probability: 0.2,
  },
  {
    id: 'tasty-grass',
    name: '맛있는 풀잎',
    icon: '🌿',
    duration: 2000,
    speedModifier: 0,
    probability: 0.1,
  },
  {
    id: 'sudden-wind',
    name: '갑작스런 바람',
    icon: '💨',
    duration: 0,
    speedModifier: -2, // 뒤로 2 units
    probability: 0.1,
  },
  {
    id: 'super-booster',
    name: '슈퍼 부스터',
    icon: '🚀',
    duration: 1000,
    speedModifier: 3.0,
    probability: 0.05,
  },
  {
    id: 'confused',
    name: '방향 감각 상실',
    icon: '🔄',
    duration: 1500,
    speedModifier: -0.5, // 뒤로 이동
    probability: 0.1,
  },
  {
    id: 'jump',
    name: '깜짝 도약',
    icon: '🏃',
    duration: 0,
    speedModifier: 5, // 앞으로 5 units
    probability: 0.1,
  },
  {
    id: 'dance',
    name: '춤추는 달팽이',
    icon: '🎵',
    duration: 1000,
    speedModifier: 0,
    probability: 0.05,
  },
];

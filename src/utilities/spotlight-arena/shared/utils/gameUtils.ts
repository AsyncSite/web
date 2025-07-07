import { GameInfo } from '../types';

// 게임 목록 데이터
export const GAMES_LIST: GameInfo[] = [
  {
    id: 'snail-race',
    name: '예측불허! 달팽이 레이스',
    description: '느리지만 드라마틱한 레이스',
    icon: '🐌',
    tags: ['레이싱', '유머'],
    minPlayers: 2,
    maxPlayers: 20,
    available: true,
  },
  {
    id: 'dart-wheel',
    name: '다트 휠',
    description: '회전하는 휠에 다트를 던져라',
    icon: '🎯',
    tags: ['카지노', '긴장감'],
    minPlayers: 2,
    maxPlayers: 30,
    available: false,
  },
  {
    id: 'slot-cascade',
    name: '슬롯머신 캐스케이드',
    description: '이름이 쏟아지는 슬롯머신',
    icon: '🎰',
    tags: ['카지노', '스릴'],
    minPlayers: 2,
    maxPlayers: 50,
    available: false,
  },
  {
    id: 'circus-cannon',
    name: '서커스 대포',
    description: '대포에서 발사되는 참가자들',
    icon: '🎪',
    tags: ['액션', '스펙터클'],
    minPlayers: 2,
    maxPlayers: 15,
    available: false,
  },
  {
    id: 'bubble-pop',
    name: '버블 팝',
    description: '마지막까지 남는 버블',
    icon: '🏹',
    tags: ['서바이벌', '팝핑'],
    minPlayers: 2,
    maxPlayers: 25,
    available: false,
  },
  {
    id: 'masquerade',
    name: '가면 무도회',
    description: '스포트라이트를 받을 주인공은?',
    icon: '🎭',
    tags: ['미스터리', '드라마'],
    minPlayers: 2,
    maxPlayers: 20,
    available: false,
  },
];

// 게임 찾기 함수
export const findGameById = (gameId: string): GameInfo | undefined => {
  return GAMES_LIST.find((game) => game.id === gameId);
};

// 카테고리별 게임 필터링
export const filterGamesByTag = (tag: string): GameInfo[] => {
  return GAMES_LIST.filter((game) => game.tags.includes(tag));
};

// 플레이 가능한 게임 필터링
export const getPlayableGames = (participantCount: number): GameInfo[] => {
  return GAMES_LIST.filter(
    (game) =>
      game.available && participantCount >= game.minPlayers && participantCount <= game.maxPlayers,
  );
};

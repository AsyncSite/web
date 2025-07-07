// 달팽이 색상 팔레트 (최대 20개)
export const SNAIL_COLORS = [
  '#FF6B6B', // 빨강
  '#4ECDC4', // 청록
  '#45B7D1', // 하늘
  '#96CEB4', // 민트
  '#FECA57', // 노랑
  '#FF9FF3', // 분홍
  '#54A0FF', // 파랑
  '#48DBFB', // 연파랑
  '#A29BFE', // 보라
  '#FD79A8', // 핑크
  '#FDCB6E', // 주황
  '#6C5CE7', // 진보라
  '#A8E6CF', // 연두
  '#FFD3B6', // 살구
  '#FFAAA5', // 코랄
  '#B4F8C8', // 라임
  '#FBE9E7', // 연분홍
  '#C7ECEE', // 연하늘
  '#778BEB', // 연보라
  '#F8B500', // 골드
];

// 색상에 따른 대비 색상 (달팽이 이름표용)
export const getContrastColor = (hexColor: string): string => {
  // 밝은 색상인지 어두운 색상인지 판단
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#FFFFFF';
};

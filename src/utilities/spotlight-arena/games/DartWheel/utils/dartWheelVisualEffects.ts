import { DartWheelSection } from '../types/dartWheel';

/**
 * 선택된 섹션에 펄스 효과 적용
 */
export function dartWheelApplyPulseEffect(
  section: DartWheelSection,
  time: number
): {
  scale: number;
  opacity: number;
  glow: number;
} {
  const pulse = Math.sin(time * 0.005) * 0.5 + 0.5;
  
  return {
    scale: 1 + pulse * 0.1,
    opacity: 0.8 + pulse * 0.2,
    glow: pulse * 20,
  };
}

/**
 * 3D 그림자 효과 계산
 */
export function dartWheelCalculate3DShadow(
  rotation: number,
  sectionAngle: number
): {
  shadowOffsetX: number;
  shadowOffsetY: number;
  shadowBlur: number;
  shadowOpacity: number;
} {
  const combinedAngle = (rotation + sectionAngle) % 360;
  const radians = (combinedAngle * Math.PI) / 180;
  
  return {
    shadowOffsetX: Math.cos(radians) * 5,
    shadowOffsetY: Math.sin(radians) * 5,
    shadowBlur: 10,
    shadowOpacity: 0.3,
  };
}

/**
 * 네온 효과 스타일
 */
export function dartWheelGetNeonStyle(
  color: string,
  intensity: number = 1
): {
  shadowColor: string;
  shadowBlur: number;
  shadowOpacity: number;
  strokeWidth: number;
} {
  return {
    shadowColor: color,
    shadowBlur: 20 * intensity,
    shadowOpacity: 0.8 * intensity,
    strokeWidth: 2,
  };
}

/**
 * 무지개 그라데이션 색상 생성
 */
export function dartWheelGenerateRainbowColors(
  sectionCount: number
): string[] {
  const colors: string[] = [];
  
  for (let i = 0; i < sectionCount; i++) {
    const hue = (360 / sectionCount) * i;
    colors.push(`hsl(${hue}, 70%, 50%)`);
  }
  
  return colors;
}

/**
 * 테마별 색상 팔레트
 */
export const DART_WHEEL_THEME_PALETTES = {
  casino: {
    primary: ['#DC143C', '#000000', '#FFD700', '#006400'],
    accent: '#FFD700',
    background: '#1a1a1a',
    glow: '#FFD700',
  },
  circus: {
    primary: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF'],
    accent: '#FF6B6B',
    background: '#FFF5E1',
    glow: '#FFE66D',
  },
  space: {
    primary: ['#6B5B95', '#88B0D3', '#34A0A4', '#52B69A'],
    accent: '#88B0D3',
    background: '#0a0a2e',
    glow: '#88B0D3',
  },
  neon: {
    primary: ['#FF006E', '#FB5607', '#FFBE0B', '#8338EC'],
    accent: '#FF006E',
    background: '#0a0a0a',
    glow: '#FF006E',
  },
  forest: {
    primary: ['#2D6A4F', '#40916C', '#52B788', '#74C69D'],
    accent: '#40916C',
    background: '#1B4332',
    glow: '#74C69D',
  },
};

/**
 * 섹션 호버 효과
 */
export function dartWheelGetHoverEffect(
  isHovered: boolean
): {
  scale: number;
  brightness: number;
  shadowBlur: number;
} {
  return {
    scale: isHovered ? 1.05 : 1,
    brightness: isHovered ? 1.2 : 1,
    shadowBlur: isHovered ? 15 : 0,
  };
}

/**
 * 스포트라이트 효과
 */
export function dartWheelCalculateSpotlight(
  centerX: number,
  centerY: number,
  targetAngle: number,
  radius: number
): {
  x: number;
  y: number;
  gradientStops: any[];
} {
  const radians = (targetAngle * Math.PI) / 180;
  const x = centerX + Math.cos(radians) * radius * 0.7;
  const y = centerY + Math.sin(radians) * radius * 0.7;
  
  return {
    x,
    y,
    gradientStops: [
      { offset: 0, color: 'rgba(255, 255, 255, 0.8)' },
      { offset: 0.5, color: 'rgba(255, 255, 255, 0.3)' },
      { offset: 1, color: 'rgba(255, 255, 255, 0)' },
    ],
  };
}
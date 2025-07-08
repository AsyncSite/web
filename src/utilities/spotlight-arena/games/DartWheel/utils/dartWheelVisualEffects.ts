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
 * 무지개 그라데이션 색상 생성 (접근성 개선)
 */
export function dartWheelGenerateRainbowColors(
  sectionCount: number
): string[] {
  const colors: string[] = [];
  
  for (let i = 0; i < sectionCount; i++) {
    const hue = (360 / sectionCount) * i;
    // 더 나은 대비를 위해 채도와 명도 조정
    colors.push(`hsl(${hue}, 75%, 45%)`);
  }
  
  return colors;
}

/**
 * 테마별 색상 팔레트 (WCAG AA 기준 충족)
 */
export const DART_WHEEL_THEME_PALETTES = {
  casino: {
    primary: ['#DC143C', '#2C2C2C', '#FFB300', '#1B5E20'],
    accent: '#FFB300',
    background: '#1a1a1a',
    glow: '#FFB300',
    text: '#FFFFFF',
    secondaryText: '#E0E0E0',
  },
  circus: {
    primary: ['#D32F2F', '#0097A7', '#F57C00', '#388E3C'],
    accent: '#D32F2F',
    background: '#FAFAFA',
    glow: '#F57C00',
    text: '#212121',
    secondaryText: '#424242',
  },
  space: {
    primary: ['#5E35B1', '#1976D2', '#00796B', '#388E3C'],
    accent: '#1976D2',
    background: '#0D1117',
    glow: '#1976D2',
    text: '#FFFFFF',
    secondaryText: '#B0BEC5',
  },
  neon: {
    primary: ['#E91E63', '#FF5722', '#FFC107', '#7B1FA2'],
    accent: '#E91E63',
    background: '#0a0a0a',
    glow: '#E91E63',
    text: '#FFFFFF',
    secondaryText: '#E0E0E0',
  },
  forest: {
    primary: ['#1B5E20', '#2E7D32', '#43A047', '#66BB6A'],
    accent: '#2E7D32',
    background: '#F1F8E9',
    glow: '#66BB6A',
    text: '#1B5E20',
    secondaryText: '#33691E',
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
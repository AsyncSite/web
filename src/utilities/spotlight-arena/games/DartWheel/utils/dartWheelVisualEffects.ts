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
    background: '#0D0D0D',
    surface: '#1A1A1A',
    glow: '#FFB300',
    text: '#FFFFFF',
    secondaryText: '#E0E0E0',
    border: '#333333',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    hover: 'rgba(255, 179, 0, 0.1)',
    shadow: 'rgba(255, 179, 0, 0.3)',
  },
  circus: {
    primary: ['#E53935', '#00ACC1', '#FB8C00', '#43A047'],
    accent: '#E53935',
    background: '#FFF3E0',
    surface: '#FFFFFF',
    glow: '#FFB74D',
    text: '#212121',
    secondaryText: '#424242',
    border: '#FFE0B2',
    success: '#66BB6A',
    warning: '#FFA726',
    error: '#EF5350',
    hover: 'rgba(229, 57, 53, 0.08)',
    shadow: 'rgba(251, 140, 0, 0.2)',
  },
  space: {
    primary: ['#7B1FA2', '#1E88E5', '#00897B', '#5E35B1'],
    accent: '#2196F3',
    background: '#000814',
    surface: '#001D3D',
    glow: '#64B5F6',
    text: '#FFFFFF',
    secondaryText: '#B3E5FC',
    border: '#003566',
    success: '#00E676',
    warning: '#FFAB00',
    error: '#FF1744',
    hover: 'rgba(33, 150, 243, 0.1)',
    shadow: 'rgba(100, 181, 246, 0.4)',
  },
  neon: {
    primary: ['#FF006E', '#FB5607', '#FFBE0B', '#8338EC'],
    accent: '#FF006E',
    background: '#000000',
    surface: '#0A0A0A',
    glow: '#FF006E',
    text: '#FFFFFF',
    secondaryText: '#E0E0E0',
    border: '#3A86FF',
    success: '#06FFB4',
    warning: '#FFBE0B',
    error: '#FF006E',
    hover: 'rgba(255, 0, 110, 0.15)',
    shadow: 'rgba(255, 0, 110, 0.5)',
  },
  forest: {
    primary: ['#2E7D32', '#388E3C', '#4CAF50', '#81C784'],
    accent: '#388E3C',
    background: '#E8F5E9',
    surface: '#FFFFFF',
    glow: '#81C784',
    text: '#1B5E20',
    secondaryText: '#2E7D32',
    border: '#C8E6C9',
    success: '#66BB6A',
    warning: '#FFB74D',
    error: '#E57373',
    hover: 'rgba(76, 175, 80, 0.08)',
    shadow: 'rgba(129, 199, 132, 0.3)',
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

/**
 * 카지노 칩 스타일 생성
 */
export function dartWheelGetCasinoChipStyle(
  index: number,
  total: number
): {
  innerColor: string;
  outerColor: string;
  pattern: 'stripes' | 'dots' | 'solid';
} {
  const patterns: ('stripes' | 'dots' | 'solid')[] = ['stripes', 'dots', 'solid'];
  const isEven = index % 2 === 0;
  
  return {
    innerColor: isEven ? '#DC143C' : '#2C2C2C',
    outerColor: isEven ? '#2C2C2C' : '#DC143C',
    pattern: patterns[index % 3],
  };
}

/**
 * 금색 파티클 효과
 */
export function dartWheelCreateGoldParticles(
  count: number,
  centerX: number,
  centerY: number
): Array<{
  x: number;
  y: number;
  size: number;
  velocity: { x: number; y: number };
  opacity: number;
  color: string;
}> {
  const particles = [];
  const colors = ['#FFD700', '#FFB300', '#FFA000', '#FF8F00'];
  
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const speed = 2 + Math.random() * 3;
    
    particles.push({
      x: centerX,
      y: centerY,
      size: 2 + Math.random() * 4,
      velocity: {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed,
      },
      opacity: 0.8 + Math.random() * 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
  
  return particles;
}

/**
 * 서커스 테마 장식 생성
 */
export function dartWheelCreateCircusDecorations(): {
  stars: Array<{ x: number; y: number; size: number; rotation: number }>;
  flags: Array<{ start: number; end: number; color: string }>;
} {
  const stars = [];
  const flags = [];
  
  // 별 장식
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8;
    stars.push({
      x: Math.cos(angle) * 280,
      y: Math.sin(angle) * 280,
      size: 10 + Math.random() * 5,
      rotation: Math.random() * 360,
    });
  }
  
  // 깃발 장식
  const flagColors = ['#E53935', '#FB8C00', '#43A047', '#00ACC1'];
  for (let i = 0; i < 12; i++) {
    const startAngle = (360 / 12) * i;
    flags.push({
      start: startAngle,
      end: startAngle + 20,
      color: flagColors[i % flagColors.length],
    });
  }
  
  return { stars, flags };
}

/**
 * 테마별 특수 효과 스타일
 */
export function dartWheelGetThemeSpecialEffects(theme: string): {
  wheelBorder?: any;
  centerButton?: any;
  sectionStyle?: any;
  particleType?: 'default' | 'gold' | 'confetti' | 'stars' | 'sparks' | 'leaves';
} {
  switch (theme) {
    case 'casino':
      return {
        wheelBorder: {
          stroke: '#FFB300',
          strokeWidth: 6,
          shadowColor: '#FFB300',
          shadowBlur: 20,
          shadowOpacity: 0.6,
        },
        centerButton: {
          fill: 'radial-gradient(circle, #FFB300 0%, #FF8F00 100%)',
          stroke: '#2C2C2C',
          strokeWidth: 3,
        },
        sectionStyle: {
          strokeWidth: 2,
          stroke: '#FFB300',
        },
        particleType: 'gold',
      };
    case 'circus':
      return {
        wheelBorder: {
          stroke: '#E53935',
          strokeWidth: 8,
          dash: [10, 5],
          shadowColor: '#FB8C00',
          shadowBlur: 15,
          shadowOpacity: 0.4,
        },
        centerButton: {
          fill: '#E53935',
          stroke: '#FFFFFF',
          strokeWidth: 4,
        },
        sectionStyle: {
          strokeWidth: 3,
          stroke: '#FFFFFF',
          dash: [5, 3],
        },
        particleType: 'confetti',
      };
    case 'space':
      return {
        wheelBorder: {
          stroke: '#2196F3',
          strokeWidth: 4,
          shadowColor: '#64B5F6',
          shadowBlur: 30,
          shadowOpacity: 0.8,
        },
        particleType: 'stars',
      };
    case 'neon':
      return {
        wheelBorder: {
          stroke: '#FF006E',
          strokeWidth: 4,
          shadowColor: '#FF006E',
          shadowBlur: 40,
          shadowOpacity: 1,
        },
        particleType: 'sparks',
      };
    case 'forest':
      return {
        wheelBorder: {
          stroke: '#388E3C',
          strokeWidth: 6,
          dash: [15, 10],
        },
        particleType: 'leaves',
      };
    default:
      return {};
  }
}
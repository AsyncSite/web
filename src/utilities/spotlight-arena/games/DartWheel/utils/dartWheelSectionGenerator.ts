import { DartWheelSection, DartWheelGameSettings } from '../types/dartWheel';

// 섹션 색상 팔레트
const DART_WHEEL_SECTION_COLORS = {
  normal: [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#DDA0DD', '#F7DC6F', '#85C1E2', '#F8B500'
  ],
  bonus: '#FFD700', // 골드 색상
  jackpot: '#FF1744', // 레드 색상
};

// 가중치 프리셋
export const DART_WHEEL_WEIGHT_PRESETS = {
  balanced: [1, 1, 1, 1, 1, 1, 1, 1], // 균등 분배
  lowValueFavored: [3, 3, 2, 2, 1, 1, 0.5, 0.5], // 낮은 점수 우대
  highValueFavored: [0.5, 0.5, 1, 1, 2, 2, 3, 3], // 높은 점수 우대
  extremesFavored: [3, 1, 0.5, 0.5, 0.5, 0.5, 1, 3], // 극단값 우대
  custom: [], // 사용자 정의
};

/**
 * 가중치 기반 다트휠 섹션 생성
 */
export function dartWheelGenerateWeightedSections(
  settings: DartWheelGameSettings,
  weightPreset: keyof typeof DART_WHEEL_WEIGHT_PRESETS = 'balanced',
  customWeights?: number[]
): DartWheelSection[] {
  const sectionCount = settings.dartWheelSectionCount;
  const enableBonus = settings.dartWheelEnableBonus;
  const bonusCount = settings.dartWheelBonusSectionCount;
  
  // 가중치 배열 준비
  let weights: number[];
  if (weightPreset === 'custom' && customWeights) {
    weights = customWeights;
  } else {
    weights = DART_WHEEL_WEIGHT_PRESETS[weightPreset];
  }
  
  // 기본 섹션 생성
  const sections: DartWheelSection[] = [];
  const normalSectionCount = enableBonus ? sectionCount - bonusCount : sectionCount;
  
  // 일반 섹션 생성
  for (let i = 0; i < normalSectionCount; i++) {
    const baseValue = (i + 1) * 10;
    const weight = settings.dartWheelEnableWeights 
      ? (weights[i] || 1) 
      : 1;
    
    sections.push({
      id: `dartwheel-section-${i}`,
      label: `${baseValue}점`,
      value: baseValue,
      color: DART_WHEEL_SECTION_COLORS.normal[i % DART_WHEEL_SECTION_COLORS.normal.length],
      angle: 0, // 나중에 계산
      angleSize: 0, // 나중에 계산
      weight: weight,
      isBonus: false,
    });
  }
  
  // 보너스 섹션 추가
  if (enableBonus && bonusCount > 0) {
    const bonusTypes: DartWheelSection['bonusType'][] = ['double', 'triple', 'respin'];
    
    for (let i = 0; i < bonusCount; i++) {
      const bonusType = bonusTypes[i % bonusTypes.length];
      const bonusLabel = dartWheelGetBonusLabel(bonusType);
      
      sections.push({
        id: `dartwheel-bonus-${i}`,
        label: bonusLabel,
        value: 0, // 보너스는 특별 처리
        color: bonusType === 'jackpot' 
          ? DART_WHEEL_SECTION_COLORS.jackpot 
          : DART_WHEEL_SECTION_COLORS.bonus,
        angle: 0,
        angleSize: 0,
        weight: 0.5, // 보너스 섹션은 낮은 확률
        isBonus: true,
        bonusType: bonusType,
      });
    }
  }
  
  // 가중치 기반 각도 계산
  return dartWheelCalculateWeightedAngles(sections);
}

/**
 * 가중치를 고려한 각도 계산
 */
export function dartWheelCalculateWeightedAngles(
  sections: DartWheelSection[]
): DartWheelSection[] {
  const totalWeight = sections.reduce((sum, section) => sum + (section.weight || 1), 0);
  let currentAngle = 0;
  
  return sections.map(section => {
    const weight = section.weight || 1;
    const angleSize = (weight / totalWeight) * 360;
    
    const updatedSection = {
      ...section,
      angle: currentAngle,
      angleSize: angleSize,
    };
    
    currentAngle += angleSize;
    return updatedSection;
  });
}

/**
 * 보너스 타입에 따른 라벨 생성
 */
function dartWheelGetBonusLabel(bonusType?: DartWheelSection['bonusType']): string {
  switch (bonusType) {
    case 'double':
      return '2배!';
    case 'triple':
      return '3배!';
    case 'respin':
      return '다시!';
    case 'jackpot':
      return '잭팟!';
    default:
      return '보너스';
  }
}

/**
 * 섹션 위치를 랜덤하게 섞기
 */
export function dartWheelShuffleSections(
  sections: DartWheelSection[]
): DartWheelSection[] {
  const shuffled = [...sections];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // 섞인 후 각도 재계산
  return dartWheelCalculateWeightedAngles(shuffled);
}
import { DartWheelSection } from '../types/dartWheel';

/**
 * 현재 회전 각도에 따른 이징 함수 적용
 */
export function dartWheelApplyEasing(
  progress: number, 
  easingType: 'linear' | 'easeOut' | 'easeInOut'
): number {
  switch (easingType) {
    case 'linear':
      return progress;
    case 'easeOut':
      return 1 - Math.pow(1 - progress, 3);
    case 'easeInOut':
      return progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    default:
      return progress;
  }
}

/**
 * 주어진 각도에서 어떤 섹션에 위치하는지 계산
 */
export function dartWheelCalculateCurrentSection(
  rotation: number, 
  sections: DartWheelSection[]
): DartWheelSection {
  const normalizedAngle = ((360 - (rotation % 360) + 90) % 360);
  const sectionAngleSize = 360 / sections.length;
  const sectionIndex = Math.floor(normalizedAngle / sectionAngleSize);
  
  return sections[sectionIndex] || sections[0];
}

/**
 * 회전 애니메이션을 위한 현재 각도 계산
 */
export function dartWheelCalculateCurrentRotation(
  startRotation: number,
  targetRotation: number,
  elapsedTime: number,
  duration: number,
  easingType: 'linear' | 'easeOut' | 'easeInOut' = 'easeOut'
): number {
  const progress = Math.min(elapsedTime / duration, 1);
  const easedProgress = dartWheelApplyEasing(progress, easingType);
  
  return startRotation + (targetRotation - startRotation) * easedProgress;
}

/**
 * 포인터가 가리키는 섹션의 하이라이트 여부 계산
 */
export function dartWheelIsPointerInSection(
  rotation: number,
  section: DartWheelSection,
  tolerance: number = 5
): boolean {
  const normalizedAngle = (360 - (rotation % 360) + 90) % 360;
  const sectionStart = section.angle;
  const sectionEnd = (section.angle + section.angleSize) % 360;
  
  if (sectionStart <= sectionEnd) {
    return normalizedAngle >= sectionStart - tolerance && 
           normalizedAngle <= sectionEnd + tolerance;
  } else {
    // 섹션이 0도를 걸쳐있는 경우
    return normalizedAngle >= sectionStart - tolerance || 
           normalizedAngle <= sectionEnd + tolerance;
  }
}

/**
 * 랜덤 회전 각도 생성 (최소 회전수 보장)
 */
export function dartWheelGenerateRandomRotation(
  minRotations: number = 5,
  maxRotations: number = 10
): number {
  const rotations = minRotations + Math.random() * (maxRotations - minRotations);
  const finalAngle = Math.random() * 360;
  
  return rotations * 360 + finalAngle;
}

/**
 * 섹션별 확률에 따른 가중치 적용 회전 각도 생성
 */
export function dartWheelGenerateWeightedRotation(
  sections: DartWheelSection[],
  minRotations: number = 5,
  useWeights: boolean = true
): number {
  if (!useWeights) {
    return dartWheelGenerateRandomRotation(minRotations, minRotations + 5);
  }
  
  // 섹션별 가중치 사용
  const sectionWeights = sections.map(section => section.weight || 1);
  const totalWeight = sectionWeights.reduce((sum, weight) => sum + weight, 0);
  
  let randomValue = Math.random() * totalWeight;
  let accumulatedAngle = 0;
  let selectedSection: DartWheelSection | null = null;
  
  for (let i = 0; i < sections.length; i++) {
    randomValue -= sectionWeights[i];
    if (randomValue <= 0) {
      selectedSection = sections[i];
      break;
    }
    accumulatedAngle += sections[i].angleSize;
  }
  
  if (!selectedSection) {
    selectedSection = sections[sections.length - 1];
  }
  
  // 선택된 섹션 내에서 랜덤한 위치 선택
  const sectionStartAngle = selectedSection.angle;
  const randomPositionInSection = Math.random() * selectedSection.angleSize;
  const targetAngle = sectionStartAngle + randomPositionInSection;
  
  const baseRotations = minRotations * 360;
  
  // 포인터가 선택된 위치를 가리키도록 조정 (포인터는 위쪽에 있으므로 90도 보정)
  const finalAngle = (360 - targetAngle + 90) % 360;
  
  return baseRotations + finalAngle;
}
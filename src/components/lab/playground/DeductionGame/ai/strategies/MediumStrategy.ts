import { BaseStrategy } from './BaseStrategy';

export class MediumStrategy extends BaseStrategy {
  // Medium AI는 현재 Easy가 사용하던 BaseStrategy의 논리적 추론을 그대로 사용합니다.
  // 이는 공개된 정답과 오답을 활용하고, 이전 추측을 분석하며,
  // 제약 조건을 검사하여 효율적으로 정답을 찾는 방식입니다.

  getStrategyName(): string {
    return 'Medium AI';
  }

  getDescription(): string {
    return '논리적 추론과 제약 조건 분석을 통해 정답을 찾습니다. 공개된 정보를 적극적으로 활용합니다.';
  }
}

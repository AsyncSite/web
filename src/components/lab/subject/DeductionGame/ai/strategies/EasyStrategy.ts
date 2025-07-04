import { BaseStrategy } from './BaseStrategy';

export class EasyStrategy extends BaseStrategy {
  getStrategyName(): string {
    return 'Easy AI';
  }

  getDescription(): string {
    return '논리적 추론과 제약 조건 분석을 통해 정답을 찾습니다.';
  }
}

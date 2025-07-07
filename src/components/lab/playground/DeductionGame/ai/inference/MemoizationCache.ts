/**
 * 추론 결과 캐싱을 위한 메모이제이션 유틸리티
 */

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  hits: number;
}

export class MemoizationCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private maxSize: number;
  private ttl: number; // Time to live in milliseconds

  constructor(maxSize: number = 100, ttl: number = 60000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  /**
   * 캐시 키 생성
   */
  static generateKey(params: any): string {
    return JSON.stringify(params, (key, value) => {
      // Set과 Map을 배열로 변환
      if (value instanceof Set) {
        return { _type: 'Set', values: Array.from(value).sort() };
      }
      if (value instanceof Map) {
        return { _type: 'Map', entries: Array.from(value.entries()).sort() };
      }
      return value;
    });
  }

  /**
   * 캐시에서 값 가져오기
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined;
    }

    // TTL 체크
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    // 히트 카운트 증가
    entry.hits++;
    return entry.value;
  }

  /**
   * 캐시에 값 저장
   */
  set(key: string, value: T): void {
    // 캐시 크기 제한 체크
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      // LRU 정책: 가장 오래되고 적게 사용된 항목 제거
      this.evictLRU();
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      hits: 0,
    });
  }

  /**
   * LRU 제거
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestScore = Infinity;

    this.cache.forEach((entry, key) => {
      // 점수 = 현재시간 - 타임스탬프 - (히트수 * 가중치)
      const score = Date.now() - entry.timestamp - entry.hits * 10000;

      if (score > oldestScore) {
        oldestScore = score;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * 캐시 비우기
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 캐시 통계
   */
  getStats(): {
    size: number;
    hitRate: number;
    avgHits: number;
  } {
    let totalHits = 0;
    let entriesWithHits = 0;

    this.cache.forEach((entry) => {
      totalHits += entry.hits;
      if (entry.hits > 0) entriesWithHits++;
    });

    return {
      size: this.cache.size,
      hitRate: this.cache.size > 0 ? entriesWithHits / this.cache.size : 0,
      avgHits: this.cache.size > 0 ? totalHits / this.cache.size : 0,
    };
  }
}

/**
 * 추론 결과 캐싱을 위한 특화된 캐시
 */
export class InferenceCache {
  private logicalCache: MemoizationCache<any>;
  private probabilisticCache: MemoizationCache<any>;

  constructor() {
    // 논리적 추론은 결정적이므로 더 오래 캐싱
    this.logicalCache = new MemoizationCache(50, 120000); // 2분
    // 확률적 추론은 더 자주 업데이트
    this.probabilisticCache = new MemoizationCache(30, 30000); // 30초
  }

  /**
   * 논리적 추론 결과 캐싱
   */
  memoizeLogical<T>(key: string, compute: () => T): T {
    const cached = this.logicalCache.get(key);
    if (cached !== undefined) {
      return cached;
    }

    const result = compute();
    this.logicalCache.set(key, result);
    return result;
  }

  /**
   * 확률적 추론 결과 캐싱
   */
  memoizeProbabilistic<T>(key: string, compute: () => T): T {
    const cached = this.probabilisticCache.get(key);
    if (cached !== undefined) {
      return cached;
    }

    const result = compute();
    this.probabilisticCache.set(key, result);
    return result;
  }

  /**
   * 캐시 초기화
   */
  clear(): void {
    this.logicalCache.clear();
    this.probabilisticCache.clear();
  }

  /**
   * 전체 캐시 통계
   */
  getStats(): {
    logical: ReturnType<MemoizationCache<any>['getStats']>;
    probabilistic: ReturnType<MemoizationCache<any>['getStats']>;
  } {
    return {
      logical: this.logicalCache.getStats(),
      probabilistic: this.probabilisticCache.getStats(),
    };
  }
}

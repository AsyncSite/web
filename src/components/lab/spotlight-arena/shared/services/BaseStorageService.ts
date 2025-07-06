export abstract class BaseStorageService {
  protected storageKey: string;

  constructor(storageKey: string) {
    this.storageKey = storageKey;
  }

  // 데이터 읽기
  protected getData<T>(): T | null {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error reading from localStorage (${this.storageKey}):`, error);
      return null;
    }
  }

  // 데이터 저장
  protected setData<T>(data: T): boolean {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage (${this.storageKey}):`, error);
      // 스토리지 용량 초과 시 오래된 데이터 정리
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.handleQuotaExceeded();
        // 재시도
        try {
          localStorage.setItem(this.storageKey, JSON.stringify(data));
          return true;
        } catch (retryError) {
          console.error('Failed to save after cleanup:', retryError);
          return false;
        }
      }
      return false;
    }
  }

  // 데이터 삭제
  protected clearData(): void {
    localStorage.removeItem(this.storageKey);
  }

  // 스토리지 용량 초과 처리
  protected abstract handleQuotaExceeded(): void;

  // 스토리지 사용량 확인 (대략적인 크기)
  protected getStorageSize(): number {
    const data = localStorage.getItem(this.storageKey);
    return data ? new Blob([data]).size : 0;
  }

  // 데이터 유효성 검증
  protected abstract validateData(data: any): boolean;
}
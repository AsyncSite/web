# Editor Integration 에러 처리 및 복구 전략

## Executive Summary

Rich Text Editor 운영 중 발생 가능한 모든 에러 시나리오와 복구 전략을 다룹니다. 사용자 경험을 최우선으로 하는 우아한 에러 처리와 자동 복구 메커니즘을 제시합니다.

## 1. 에러 분류 체계

### 1.1 에러 심각도 레벨

| 레벨 | 설명 | 사용자 영향 | 대응 방식 |
|------|------|------------|-----------|
| **CRITICAL** | 시스템 전체 장애 | 서비스 사용 불가 | 즉시 알림, 자동 롤백 |
| **ERROR** | 기능 장애 | 특정 기능 사용 불가 | 에러 로깅, 대체 경로 제공 |
| **WARNING** | 부분적 문제 | 성능 저하, 일부 기능 제한 | 모니터링, 사용자 안내 |
| **INFO** | 경미한 이슈 | 사용자 경험 미미한 영향 | 로깅, 선택적 알림 |

### 1.2 에러 카테고리

```typescript
enum ErrorCategory {
  // 네트워크 관련
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  OFFLINE_ERROR = 'OFFLINE_ERROR',
  
  // 데이터 관련
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PARSING_ERROR = 'PARSING_ERROR',
  SERIALIZATION_ERROR = 'SERIALIZATION_ERROR',
  
  // 보안 관련
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  XSS_DETECTION = 'XSS_DETECTION',
  
  // 에디터 관련
  EDITOR_INIT_ERROR = 'EDITOR_INIT_ERROR',
  PLUGIN_LOAD_ERROR = 'PLUGIN_LOAD_ERROR',
  CONTENT_CORRUPT = 'CONTENT_CORRUPT',
  
  // 리소스 관련
  MEMORY_LIMIT = 'MEMORY_LIMIT',
  STORAGE_FULL = 'STORAGE_FULL',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  
  // 브라우저 관련
  BROWSER_UNSUPPORTED = 'BROWSER_UNSUPPORTED',
  WEBGL_UNAVAILABLE = 'WEBGL_UNAVAILABLE',
  PERMISSION_DENIED = 'PERMISSION_DENIED'
}
```

## 2. 에러 처리 아키텍처

### 2.1 중앙 에러 핸들러

```typescript
class ErrorHandler {
  private errorQueue: ErrorEvent[] = [];
  private retryMap = new Map<string, number>();
  private maxRetries = 3;
  private errorHandlers = new Map<ErrorCategory, ErrorHandlerFunction>();
  
  constructor() {
    this.setupGlobalHandlers();
    this.registerDefaultHandlers();
  }
  
  // 전역 에러 핸들러 설정
  private setupGlobalHandlers() {
    // 일반 JavaScript 에러
    window.addEventListener('error', (event) => {
      this.handleError({
        category: ErrorCategory.RUNTIME_ERROR,
        message: event.message,
        stack: event.error?.stack,
        severity: ErrorSeverity.ERROR
      });
    });
    
    // Promise 거부
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        category: ErrorCategory.PROMISE_REJECTION,
        message: event.reason?.message || 'Unhandled promise rejection',
        severity: ErrorSeverity.WARNING
      });
      event.preventDefault();
    });
    
    // 네트워크 오프라인
    window.addEventListener('offline', () => {
      this.handleError({
        category: ErrorCategory.OFFLINE_ERROR,
        message: '네트워크 연결이 끊어졌습니다',
        severity: ErrorSeverity.WARNING
      });
    });
  }
  
  // 에러 처리 로직
  handleError(error: ErrorEvent): void {
    // 1. 에러 큐에 추가
    this.errorQueue.push({
      ...error,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
    
    // 2. 카테고리별 핸들러 실행
    const handler = this.errorHandlers.get(error.category);
    if (handler) {
      handler(error);
    }
    
    // 3. 심각도에 따른 처리
    this.handleBySeverity(error);
    
    // 4. 로깅 및 리포팅
    this.logError(error);
    
    // 5. 사용자 알림
    if (error.severity >= ErrorSeverity.ERROR) {
      this.notifyUser(error);
    }
  }
  
  // 재시도 로직
  async retry<T>(
    operation: () => Promise<T>,
    errorCategory: ErrorCategory,
    context?: any
  ): Promise<T> {
    const key = `${errorCategory}-${JSON.stringify(context)}`;
    const attempts = this.retryMap.get(key) || 0;
    
    try {
      const result = await operation();
      this.retryMap.delete(key); // 성공 시 재시도 카운트 초기화
      return result;
    } catch (error) {
      if (attempts >= this.maxRetries) {
        this.retryMap.delete(key);
        throw new MaxRetriesExceededError(errorCategory, error);
      }
      
      this.retryMap.set(key, attempts + 1);
      
      // 지수 백오프
      const delay = Math.min(1000 * Math.pow(2, attempts), 10000);
      await this.sleep(delay);
      
      return this.retry(operation, errorCategory, context);
    }
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### 2.2 React Error Boundary

```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

class EditorErrorBoundary extends Component<
  { children: ReactNode; fallback?: ComponentType<any> },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }
  
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 에러 로깅
    console.error('Editor Error:', error, errorInfo);
    
    // 에러 리포팅
    this.reportError(error, errorInfo);
    
    // 에러 카운트 증가
    this.setState(prev => ({ 
      errorCount: prev.errorCount + 1,
      errorInfo 
    }));
    
    // 에러가 반복되면 상위로 전파
    if (this.state.errorCount > 3) {
      throw error;
    }
  }
  
  private reportError(error: Error, errorInfo: ErrorInfo) {
    // Sentry 또는 다른 에러 트래킹 서비스로 전송
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack
          }
        }
      });
    }
  }
  
  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    });
  };
  
  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.handleReset}
          errorInfo={this.state.errorInfo}
        />
      );
    }
    
    return this.props.children;
  }
}

// 기본 에러 폴백 컴포넌트
function DefaultErrorFallback({ error, resetError }: any) {
  return (
    <div className="error-fallback">
      <h2>에디터 로드 중 문제가 발생했습니다</h2>
      <details style={{ whiteSpace: 'pre-wrap' }}>
        {error && error.toString()}
      </details>
      <button onClick={resetError}>다시 시도</button>
    </div>
  );
}
```

## 3. 구체적 에러 시나리오 및 복구

### 3.1 네트워크 에러

```typescript
class NetworkErrorHandler {
  private offlineQueue: Array<() => Promise<any>> = [];
  private isOnline = navigator.onLine;
  
  constructor() {
    this.setupNetworkListeners();
  }
  
  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processOfflineQueue();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyOffline();
    });
  }
  
  // 오프라인 큐 처리
  private async processOfflineQueue() {
    while (this.offlineQueue.length > 0) {
      const operation = this.offlineQueue.shift()!;
      try {
        await operation();
      } catch (error) {
        console.error('Failed to process offline operation:', error);
        // 실패한 작업은 다시 큐에 추가
        this.offlineQueue.push(operation);
        break;
      }
    }
  }
  
  // 네트워크 요청 래퍼
  async request<T>(
    operation: () => Promise<T>,
    options: { 
      queueIfOffline?: boolean;
      timeout?: number;
      retryCount?: number;
    } = {}
  ): Promise<T> {
    const { queueIfOffline = true, timeout = 30000, retryCount = 3 } = options;
    
    if (!this.isOnline) {
      if (queueIfOffline) {
        return new Promise((resolve, reject) => {
          this.offlineQueue.push(async () => {
            try {
              const result = await operation();
              resolve(result);
            } catch (error) {
              reject(error);
            }
          });
        });
      } else {
        throw new NetworkError('오프라인 상태입니다');
      }
    }
    
    // 타임아웃 처리
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new TimeoutError('요청 시간 초과')), timeout);
    });
    
    // 재시도 로직
    let lastError: any;
    for (let i = 0; i < retryCount; i++) {
      try {
        return await Promise.race([operation(), timeoutPromise]);
      } catch (error) {
        lastError = error;
        if (i < retryCount - 1) {
          await this.sleep(1000 * Math.pow(2, i)); // 지수 백오프
        }
      }
    }
    
    throw lastError;
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### 3.2 콘텐츠 손실 방지

```typescript
class ContentRecoveryManager {
  private autoSaveInterval = 30000; // 30초
  private autoSaveTimer: NodeJS.Timeout | null = null;
  private localStorage = window.localStorage;
  private sessionStorage = window.sessionStorage;
  
  // 자동 저장 시작
  startAutoSave(
    editorId: string,
    getContent: () => any,
    onSave?: (content: any) => Promise<void>
  ) {
    // 기존 타이머 정리
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
    
    this.autoSaveTimer = setInterval(async () => {
      try {
        const content = getContent();
        
        // 로컬 스토리지에 저장
        this.saveToLocal(editorId, content);
        
        // 서버에 저장 (옵션)
        if (onSave) {
          await onSave(content);
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, this.autoSaveInterval);
    
    // 페이지 언로드 시 저장
    window.addEventListener('beforeunload', (e) => {
      const content = getContent();
      this.saveToLocal(editorId, content);
      
      // 저장되지 않은 변경사항이 있으면 경고
      if (this.hasUnsavedChanges(editorId, content)) {
        e.preventDefault();
        e.returnValue = '저장되지 않은 변경사항이 있습니다. 페이지를 떠나시겠습니까?';
      }
    });
  }
  
  // 로컬 스토리지 저장
  private saveToLocal(editorId: string, content: any) {
    try {
      const data = {
        content,
        timestamp: Date.now(),
        version: 1
      };
      
      // 메인 스토리지
      this.localStorage.setItem(`editor-backup-${editorId}`, JSON.stringify(data));
      
      // 세션 스토리지 (임시 백업)
      this.sessionStorage.setItem(`editor-session-${editorId}`, JSON.stringify(data));
      
    } catch (error) {
      // 스토리지 용량 초과 처리
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.cleanupOldBackups();
        // 재시도
        try {
          this.localStorage.setItem(`editor-backup-${editorId}`, JSON.stringify({
            content,
            timestamp: Date.now()
          }));
        } catch {
          console.error('Failed to save backup after cleanup');
        }
      }
    }
  }
  
  // 복구 시도
  async attemptRecovery(editorId: string): Promise<any | null> {
    // 1. 세션 스토리지 확인 (가장 최근)
    const sessionData = this.sessionStorage.getItem(`editor-session-${editorId}`);
    if (sessionData) {
      try {
        const parsed = JSON.parse(sessionData);
        if (Date.now() - parsed.timestamp < 3600000) { // 1시간 이내
          return parsed.content;
        }
      } catch {}
    }
    
    // 2. 로컬 스토리지 확인
    const localData = this.localStorage.getItem(`editor-backup-${editorId}`);
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        if (Date.now() - parsed.timestamp < 86400000) { // 24시간 이내
          return parsed.content;
        }
      } catch {}
    }
    
    // 3. IndexedDB 확인 (대용량 데이터)
    try {
      return await this.recoverFromIndexedDB(editorId);
    } catch {}
    
    return null;
  }
  
  // IndexedDB에서 복구
  private async recoverFromIndexedDB(editorId: string): Promise<any | null> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('EditorBackup', 1);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['backups'], 'readonly');
        const store = transaction.objectStore('backups');
        const getRequest = store.get(editorId);
        
        getRequest.onsuccess = () => {
          const data = getRequest.result;
          if (data && Date.now() - data.timestamp < 604800000) { // 7일 이내
            resolve(data.content);
          } else {
            resolve(null);
          }
        };
        
        getRequest.onerror = () => reject(getRequest.error);
      };
      
      request.onerror = () => reject(request.error);
    });
  }
  
  // 오래된 백업 정리
  private cleanupOldBackups() {
    const keys = Object.keys(this.localStorage);
    const editorBackups = keys.filter(key => key.startsWith('editor-backup-'));
    
    const backups = editorBackups.map(key => {
      try {
        const data = JSON.parse(this.localStorage.getItem(key) || '{}');
        return { key, timestamp: data.timestamp || 0 };
      } catch {
        return { key, timestamp: 0 };
      }
    });
    
    // 타임스탬프 순으로 정렬
    backups.sort((a, b) => a.timestamp - b.timestamp);
    
    // 오래된 것부터 절반 삭제
    const toDelete = backups.slice(0, Math.floor(backups.length / 2));
    toDelete.forEach(item => {
      this.localStorage.removeItem(item.key);
    });
  }
}
```

### 3.3 에디터 초기화 실패

```typescript
class EditorInitializationHandler {
  private maxInitAttempts = 3;
  private initAttempts = 0;
  
  async initializeEditor(config: EditorConfig): Promise<EditorInstance> {
    try {
      return await this.tryInitialize(config);
    } catch (error) {
      return await this.handleInitError(error, config);
    }
  }
  
  private async tryInitialize(config: EditorConfig): Promise<EditorInstance> {
    // 브라우저 호환성 체크
    this.checkBrowserCompatibility();
    
    // 필수 리소스 로드 확인
    await this.ensureResourcesLoaded();
    
    // 에디터 인스턴스 생성
    const editor = await this.createEditorInstance(config);
    
    // 초기화 검증
    if (!this.validateEditor(editor)) {
      throw new EditorInitError('Editor validation failed');
    }
    
    return editor;
  }
  
  private async handleInitError(
    error: any,
    config: EditorConfig
  ): Promise<EditorInstance> {
    this.initAttempts++;
    
    if (this.initAttempts >= this.maxInitAttempts) {
      // 폴백 에디터로 전환
      return this.createFallbackEditor(config);
    }
    
    // 에러 타입별 처리
    if (error instanceof BrowserIncompatibleError) {
      return this.createFallbackEditor(config);
    }
    
    if (error instanceof ResourceLoadError) {
      // CDN 폴백
      await this.loadFromAlternativeCDN();
      return this.initializeEditor(config);
    }
    
    if (error instanceof PluginLoadError) {
      // 플러그인 없이 재시도
      const minimalConfig = this.createMinimalConfig(config);
      return this.initializeEditor(minimalConfig);
    }
    
    // 일반적인 에러는 재시도
    await this.sleep(1000 * this.initAttempts);
    return this.initializeEditor(config);
  }
  
  private checkBrowserCompatibility() {
    const required = {
      localStorage: typeof Storage !== 'undefined',
      indexedDB: 'indexedDB' in window,
      serviceWorker: 'serviceWorker' in navigator,
      webWorker: typeof Worker !== 'undefined'
    };
    
    const missing = Object.entries(required)
      .filter(([_, supported]) => !supported)
      .map(([feature]) => feature);
    
    if (missing.length > 0) {
      throw new BrowserIncompatibleError(
        `Missing required features: ${missing.join(', ')}`
      );
    }
  }
  
  private async ensureResourcesLoaded(): Promise<void> {
    const resources = [
      { type: 'script', src: '/js/editor.js' },
      { type: 'style', src: '/css/editor.css' }
    ];
    
    const loadPromises = resources.map(resource => {
      return new Promise((resolve, reject) => {
        if (resource.type === 'script') {
          const script = document.createElement('script');
          script.src = resource.src;
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        } else {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = resource.src;
          link.onload = resolve;
          link.onerror = reject;
          document.head.appendChild(link);
        }
      });
    });
    
    await Promise.all(loadPromises);
  }
  
  private createFallbackEditor(config: EditorConfig): EditorInstance {
    // 간단한 textarea 기반 폴백 에디터
    return {
      container: config.container,
      getValue: () => (document.querySelector('#fallback-editor') as HTMLTextAreaElement)?.value,
      setValue: (value: string) => {
        const textarea = document.querySelector('#fallback-editor') as HTMLTextAreaElement;
        if (textarea) textarea.value = value;
      },
      destroy: () => {
        // Cleanup
      },
      isFallback: true
    };
  }
}
```

### 3.4 파일 업로드 에러

```typescript
class FileUploadErrorHandler {
  private uploadQueue: Map<string, File> = new Map();
  private failedUploads: Map<string, number> = new Map();
  
  async handleFileUpload(
    file: File,
    uploadFn: (file: File) => Promise<string>
  ): Promise<string> {
    const fileId = this.generateFileId(file);
    
    try {
      // 파일 검증
      this.validateFile(file);
      
      // 업로드 시도
      const url = await this.uploadWithRetry(file, uploadFn, fileId);
      
      // 성공 시 큐에서 제거
      this.uploadQueue.delete(fileId);
      this.failedUploads.delete(fileId);
      
      return url;
      
    } catch (error) {
      return this.handleUploadError(error, file, fileId);
    }
  }
  
  private validateFile(file: File) {
    // 파일 크기 검증
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new FileTooLargeError(
        `파일 크기가 ${maxSize / 1024 / 1024}MB를 초과합니다`
      );
    }
    
    // 파일 타입 검증
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new InvalidFileTypeError(
        `지원하지 않는 파일 형식입니다: ${file.type}`
      );
    }
    
    // 파일명 검증
    const invalidChars = /[<>:"/\\|?*]/g;
    if (invalidChars.test(file.name)) {
      throw new InvalidFileNameError('파일명에 사용할 수 없는 문자가 포함되어 있습니다');
    }
  }
  
  private async uploadWithRetry(
    file: File,
    uploadFn: (file: File) => Promise<string>,
    fileId: string,
    maxRetries = 3
  ): Promise<string> {
    const attempts = this.failedUploads.get(fileId) || 0;
    
    if (attempts >= maxRetries) {
      throw new MaxUploadRetriesError('최대 재시도 횟수를 초과했습니다');
    }
    
    try {
      // 청크 업로드 시도
      if (file.size > 1024 * 1024) { // 1MB 이상
        return await this.uploadInChunks(file, uploadFn);
      } else {
        return await uploadFn(file);
      }
    } catch (error) {
      this.failedUploads.set(fileId, attempts + 1);
      
      // 네트워크 에러인 경우 큐에 추가
      if (this.isNetworkError(error)) {
        this.uploadQueue.set(fileId, file);
        throw new UploadQueuedError('네트워크가 복구되면 자동으로 업로드됩니다');
      }
      
      // 재시도
      await this.sleep(1000 * Math.pow(2, attempts));
      return this.uploadWithRetry(file, uploadFn, fileId, maxRetries);
    }
  }
  
  private async uploadInChunks(
    file: File,
    uploadFn: (file: File) => Promise<string>
  ): Promise<string> {
    const chunkSize = 512 * 1024; // 512KB
    const chunks = Math.ceil(file.size / chunkSize);
    const uploadId = this.generateUploadId();
    
    for (let i = 0; i < chunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);
      
      // 청크 업로드
      await this.uploadChunk(chunk, uploadId, i, chunks);
      
      // 진행률 업데이트
      this.updateProgress(file.name, (i + 1) / chunks * 100);
    }
    
    // 청크 병합 요청
    return await this.mergeChunks(uploadId, file.name);
  }
  
  private handleUploadError(error: any, file: File, fileId: string): string {
    // 에러 타입별 처리
    if (error instanceof FileTooLargeError) {
      // 이미지 압축 시도
      if (file.type.startsWith('image/')) {
        return this.compressAndUpload(file);
      }
      throw error;
    }
    
    if (error instanceof InvalidFileTypeError) {
      // 파일 변환 시도
      return this.convertAndUpload(file);
    }
    
    if (error instanceof UploadQueuedError) {
      // 임시 URL 반환
      return this.createTemporaryUrl(file);
    }
    
    throw error;
  }
  
  private createTemporaryUrl(file: File): string {
    // Blob URL 생성 (임시)
    const url = URL.createObjectURL(file);
    
    // 나중에 실제 URL로 교체하기 위해 매핑 저장
    this.tempUrlMap.set(url, file);
    
    return url;
  }
}
```

## 4. 사용자 경험 최적화

### 4.1 에러 알림 UI

```typescript
// 토스트 알림 시스템
class ToastNotificationSystem {
  private container: HTMLElement;
  private toasts: Map<string, ToastInstance> = new Map();
  
  show(options: ToastOptions) {
    const toast = this.createToast(options);
    this.container.appendChild(toast.element);
    
    // 애니메이션
    requestAnimationFrame(() => {
      toast.element.classList.add('show');
    });
    
    // 자동 숨김
    if (options.duration !== 0) {
      setTimeout(() => {
        this.hide(toast.id);
      }, options.duration || 5000);
    }
    
    return toast.id;
  }
  
  private createToast(options: ToastOptions): ToastInstance {
    const id = this.generateId();
    const element = document.createElement('div');
    element.className = `toast toast-${options.type || 'info'}`;
    
    element.innerHTML = `
      <div class="toast-icon">${this.getIcon(options.type)}</div>
      <div class="toast-content">
        <div class="toast-title">${options.title}</div>
        ${options.message ? `<div class="toast-message">${options.message}</div>` : ''}
        ${options.action ? `
          <button class="toast-action" data-action="${id}">
            ${options.action.label}
          </button>
        ` : ''}
      </div>
      <button class="toast-close" data-close="${id}">×</button>
    `;
    
    // 이벤트 핸들러
    if (options.action) {
      element.querySelector(`[data-action="${id}"]`)?.addEventListener('click', () => {
        options.action!.onClick();
        this.hide(id);
      });
    }
    
    element.querySelector(`[data-close="${id}"]`)?.addEventListener('click', () => {
      this.hide(id);
    });
    
    const toast = { id, element, options };
    this.toasts.set(id, toast);
    
    return toast;
  }
  
  private getIcon(type?: string): string {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type || 'info'] || icons.info;
  }
}

// 에러별 사용자 메시지
const UserFriendlyMessages = {
  [ErrorCategory.NETWORK_ERROR]: {
    title: '네트워크 연결 문제',
    message: '인터넷 연결을 확인해주세요',
    action: { label: '다시 시도', onClick: () => location.reload() }
  },
  [ErrorCategory.AUTHENTICATION_ERROR]: {
    title: '로그인이 필요합니다',
    message: '세션이 만료되었습니다',
    action: { label: '로그인', onClick: () => window.location.href = '/login' }
  },
  [ErrorCategory.FILE_TOO_LARGE]: {
    title: '파일이 너무 큽니다',
    message: '10MB 이하의 파일만 업로드 가능합니다',
    action: { label: '파일 압축', onClick: () => openCompressionTool() }
  }
};
```

### 4.2 복구 UI

```typescript
// 자동 복구 알림
function RecoveryNotification({ 
  onRecover, 
  onDiscard, 
  recoveredContent 
}: RecoveryNotificationProps) {
  const [preview, setPreview] = useState(false);
  
  return (
    <div className="recovery-notification">
      <div className="recovery-header">
        <Icon name="restore" />
        <h3>저장되지 않은 내용을 발견했습니다</h3>
      </div>
      
      <div className="recovery-body">
        <p>마지막 저장: {formatTimeAgo(recoveredContent.timestamp)}</p>
        
        {preview && (
          <div className="recovery-preview">
            <ContentPreview content={recoveredContent.data} />
          </div>
        )}
        
        <button 
          className="recovery-toggle"
          onClick={() => setPreview(!preview)}
        >
          {preview ? '미리보기 숨기기' : '미리보기 보기'}
        </button>
      </div>
      
      <div className="recovery-actions">
        <button className="btn-primary" onClick={onRecover}>
          복구하기
        </button>
        <button className="btn-secondary" onClick={onDiscard}>
          무시하고 새로 시작
        </button>
      </div>
    </div>
  );
}
```

## 5. 에러 모니터링 및 분석

### 5.1 에러 수집 및 리포팅

```typescript
class ErrorReporter {
  private endpoint = '/api/errors';
  private buffer: ErrorReport[] = [];
  private flushInterval = 10000; // 10초
  
  constructor() {
    // 주기적으로 버퍼 플러시
    setInterval(() => this.flush(), this.flushInterval);
    
    // 페이지 언로드 시 즉시 전송
    window.addEventListener('beforeunload', () => {
      this.flush(true);
    });
  }
  
  report(error: ErrorEvent) {
    const report: ErrorReport = {
      ...error,
      sessionId: this.getSessionId(),
      userId: this.getUserId(),
      timestamp: Date.now(),
      context: this.gatherContext()
    };
    
    this.buffer.push(report);
    
    // 심각한 에러는 즉시 전송
    if (error.severity === ErrorSeverity.CRITICAL) {
      this.flush();
    }
  }
  
  private gatherContext(): ErrorContext {
    return {
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      screen: {
        width: screen.width,
        height: screen.height
      },
      memory: (performance as any).memory,
      connection: (navigator as any).connection,
      localStorage: this.getLocalStorageSize(),
      editorState: this.getEditorState()
    };
  }
  
  private async flush(sync = false) {
    if (this.buffer.length === 0) return;
    
    const reports = [...this.buffer];
    this.buffer = [];
    
    if (sync) {
      // 동기 전송 (페이지 언로드 시)
      navigator.sendBeacon(this.endpoint, JSON.stringify(reports));
    } else {
      // 비동기 전송
      try {
        await fetch(this.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reports)
        });
      } catch (error) {
        // 전송 실패 시 버퍼에 다시 추가
        this.buffer.unshift(...reports);
      }
    }
  }
}
```

### 5.2 에러 대시보드

```typescript
// 에러 통계 및 분석
interface ErrorDashboard {
  totalErrors: number;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsByS everity: Record<ErrorSeverity, number>;
  errorTrend: Array<{ time: number; count: number }>;
  topErrors: Array<{ message: string; count: number }>;
  affectedUsers: number;
  errorRate: number; // errors per minute
}

class ErrorAnalytics {
  analyze(errors: ErrorReport[]): ErrorDashboard {
    return {
      totalErrors: errors.length,
      errorsByCategory: this.groupByCategory(errors),
      errorsBySeverity: this.groupBySeverity(errors),
      errorTrend: this.calculateTrend(errors),
      topErrors: this.getTopErrors(errors),
      affectedUsers: this.countAffectedUsers(errors),
      errorRate: this.calculateErrorRate(errors)
    };
  }
  
  private groupByCategory(errors: ErrorReport[]): Record<ErrorCategory, number> {
    return errors.reduce((acc, error) => {
      acc[error.category] = (acc[error.category] || 0) + 1;
      return acc;
    }, {} as Record<ErrorCategory, number>);
  }
  
  private calculateTrend(errors: ErrorReport[]): Array<{ time: number; count: number }> {
    // 시간별 에러 수 계산
    const hourly = new Map<number, number>();
    
    errors.forEach(error => {
      const hour = Math.floor(error.timestamp / 3600000) * 3600000;
      hourly.set(hour, (hourly.get(hour) || 0) + 1);
    });
    
    return Array.from(hourly.entries())
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => a.time - b.time);
  }
}
```

## 6. 에러 방지 전략

### 6.1 예방적 검증

```typescript
// 입력 검증
class InputValidator {
  validateEditorContent(content: any): ValidationResult {
    const errors: ValidationError[] = [];
    
    // 구조 검증
    if (!content || typeof content !== 'object') {
      errors.push({
        field: 'content',
        message: 'Invalid content structure'
      });
    }
    
    // 크기 검증
    const size = JSON.stringify(content).length;
    if (size > 1024 * 1024) { // 1MB
      errors.push({
        field: 'content',
        message: 'Content size exceeds limit'
      });
    }
    
    // XSS 검증
    if (this.containsXSS(content)) {
      errors.push({
        field: 'content',
        message: 'Potentially malicious content detected'
      });
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  private containsXSS(content: any): boolean {
    const dangerous = [
      '<script', 'javascript:', 'onerror=', 'onclick=',
      'onload=', 'eval(', 'document.write'
    ];
    
    const str = JSON.stringify(content);
    return dangerous.some(pattern => str.includes(pattern));
  }
}
```

### 6.2 회복력 있는 코드 패턴

```typescript
// Safe wrapper 패턴
function safeExecute<T>(
  fn: () => T,
  fallback: T,
  errorHandler?: (error: any) => void
): T {
  try {
    return fn();
  } catch (error) {
    if (errorHandler) {
      errorHandler(error);
    }
    return fallback;
  }
}

// Optional chaining과 nullish coalescing
function safeAccess(obj: any, path: string, defaultValue: any = null) {
  return path.split('.').reduce((acc, part) => acc?.[part], obj) ?? defaultValue;
}

// Defensive programming
class DefensiveEditor {
  private editor: EditorInstance | null = null;
  
  getValue(): string {
    // 다중 폴백
    return this.editor?.getValue?.() 
      ?? this.getCachedValue() 
      ?? this.getDefaultValue()
      ?? '';
  }
  
  setValue(value: string) {
    if (!this.editor) {
      console.warn('Editor not initialized, caching value');
      this.cacheValue(value);
      return;
    }
    
    try {
      this.editor.setValue(value);
    } catch (error) {
      console.error('Failed to set value:', error);
      this.cacheValue(value);
      this.scheduleRetry(() => this.editor?.setValue(value));
    }
  }
}
```

## 7. 체크리스트

### 개발 단계
- [ ] Error Boundary 구현
- [ ] 전역 에러 핸들러 설정
- [ ] 네트워크 에러 처리
- [ ] 자동 저장 메커니즘
- [ ] 콘텐츠 복구 시스템
- [ ] 입력 검증 로직
- [ ] 에러 리포팅 설정

### 테스트 단계
- [ ] 네트워크 끊김 시나리오
- [ ] 브라우저 크래시 복구
- [ ] 메모리 부족 처리
- [ ] 파일 업로드 실패
- [ ] 동시성 충돌 해결
- [ ] 에러 알림 UI 테스트

### 운영 단계
- [ ] 에러 모니터링 대시보드
- [ ] 알림 규칙 설정
- [ ] 에러 트렌드 분석
- [ ] 사용자 피드백 수집
- [ ] 정기적 에러 리뷰

## 8. 참고 자료

- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Sentry Error Tracking](https://docs.sentry.io/platforms/javascript/)
- [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Navigator.sendBeacon()](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon)

*최종 업데이트: 2025년 1월 6일*
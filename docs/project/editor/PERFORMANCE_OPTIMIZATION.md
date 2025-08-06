# Editor Integration 성능 최적화 전략

## Executive Summary

Rich Text Editor 도입 시 성능 최적화를 위한 종합적인 전략과 구현 방안입니다. 초기 로드, 런타임 성능, 메모리 관리, 네트워크 최적화 등 모든 측면을 다룹니다.

## 1. 초기 로드 최적화

### 1.1 번들 크기 최적화

#### 코드 분할 (Code Splitting)
```typescript
// 동적 임포트를 통한 에디터 지연 로딩
const EditorComponent = lazy(() => 
  import(/* webpackChunkName: "editor" */ './components/RichTextEditor')
);

// 사용 시점에만 로드
function ProfileEditPage() {
  const [showEditor, setShowEditor] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowEditor(true)}>Edit Profile</button>
      {showEditor && (
        <Suspense fallback={<EditorSkeleton />}>
          <EditorComponent />
        </Suspense>
      )}
    </>
  );
}
```

#### Tree Shaking 최적화
```javascript
// webpack.config.js
module.exports = {
  optimization: {
    usedExports: true,
    sideEffects: false,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        editor: {
          test: /[\\/]node_modules[\\/](@editorjs|@tiptap)/,
          name: 'editor-vendor',
          priority: 10
        },
        commons: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true
        }
      }
    }
  }
};
```

#### 플러그인 선택적 로딩
```typescript
// 필요한 플러그인만 동적 로딩
class EditorPluginManager {
  private plugins = new Map<string, Promise<any>>();
  
  async loadPlugin(name: string) {
    if (!this.plugins.has(name)) {
      this.plugins.set(name, this.importPlugin(name));
    }
    return this.plugins.get(name);
  }
  
  private async importPlugin(name: string) {
    switch(name) {
      case 'image':
        return import('@editorjs/image');
      case 'table':
        return import('@editorjs/table');
      case 'code':
        return import('@editorjs/code');
      default:
        throw new Error(`Unknown plugin: ${name}`);
    }
  }
}
```

### 1.2 Critical CSS 인라인화

```html
<!-- 초기 렌더링에 필요한 최소 CSS만 인라인 -->
<style>
  /* Critical Editor CSS */
  .editor-container { 
    min-height: 200px; 
    border: 1px solid #e0e0e0; 
  }
  .editor-loading { 
    display: flex; 
    justify-content: center; 
    align-items: center; 
  }
</style>

<!-- 나머지 CSS는 비동기 로드 -->
<link rel="preload" href="/css/editor.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
```

### 1.3 Resource Hints

```html
<!-- DNS Prefetch -->
<link rel="dns-prefetch" href="https://cdn.jsdelivr.net">
<link rel="dns-prefetch" href="https://s3.amazonaws.com">

<!-- Preconnect -->
<link rel="preconnect" href="https://api.asyncsite.com">

<!-- Prefetch -->
<link rel="prefetch" href="/js/editor-vendor.js">

<!-- Preload -->
<link rel="preload" href="/fonts/editor-icons.woff2" as="font" type="font/woff2" crossorigin>
```

## 2. 런타임 성능 최적화

### 2.1 Virtual Scrolling

```typescript
// 대용량 콘텐츠를 위한 가상 스크롤링
class VirtualEditor {
  private visibleBlocks: Set<number> = new Set();
  private blockHeight = 50; // 평균 블록 높이
  private viewportHeight = 600;
  
  calculateVisibleBlocks(scrollTop: number, blocks: EditorBlock[]) {
    const startIndex = Math.floor(scrollTop / this.blockHeight);
    const endIndex = Math.ceil((scrollTop + this.viewportHeight) / this.blockHeight);
    
    // 버퍼 영역 추가 (위아래 5개 블록)
    const bufferSize = 5;
    const visibleStart = Math.max(0, startIndex - bufferSize);
    const visibleEnd = Math.min(blocks.length, endIndex + bufferSize);
    
    return blocks.slice(visibleStart, visibleEnd);
  }
  
  renderVisibleBlocks(blocks: EditorBlock[]) {
    return (
      <div style={{ height: blocks.length * this.blockHeight }}>
        {this.calculateVisibleBlocks(scrollTop, blocks).map(block => (
          <BlockComponent key={block.id} {...block} />
        ))}
      </div>
    );
  }
}
```

### 2.2 Debouncing & Throttling

```typescript
// 입력 이벤트 최적화
class OptimizedEditor {
  private saveDebounceTimer: NodeJS.Timeout | null = null;
  private lastScrollTime = 0;
  
  // Debounce: 자동 저장
  handleContentChange = (content: string) => {
    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer);
    }
    
    this.saveDebounceTimer = setTimeout(() => {
      this.saveContent(content);
    }, 1000); // 1초 후 저장
  };
  
  // Throttle: 스크롤 이벤트
  handleScroll = (event: ScrollEvent) => {
    const now = Date.now();
    if (now - this.lastScrollTime < 16) { // 60fps
      return;
    }
    
    this.lastScrollTime = now;
    this.updateVisibleBlocks(event.scrollTop);
  };
  
  // RequestAnimationFrame: 렌더링 최적화
  updateEditorLayout = () => {
    requestAnimationFrame(() => {
      this.measureBlocks();
      this.repositionToolbar();
      this.updateScrollbar();
    });
  };
}
```

### 2.3 React 최적화

```typescript
// Memoization을 통한 불필요한 리렌더링 방지
const EditorToolbar = memo(({ tools, activeTools, onToolClick }) => {
  return (
    <div className="editor-toolbar">
      {tools.map(tool => (
        <ToolButton
          key={tool.id}
          tool={tool}
          active={activeTools.includes(tool.id)}
          onClick={onToolClick}
        />
      ))}
    </div>
  );
}, (prevProps, nextProps) => {
  // 커스텀 비교 로직
  return (
    prevProps.tools === nextProps.tools &&
    JSON.stringify(prevProps.activeTools) === JSON.stringify(nextProps.activeTools)
  );
});

// useMemo를 통한 비용이 큰 계산 캐싱
function useEditorStats(blocks: EditorBlock[]) {
  const stats = useMemo(() => {
    return {
      wordCount: blocks.reduce((sum, block) => sum + countWords(block.text), 0),
      charCount: blocks.reduce((sum, block) => sum + block.text.length, 0),
      readingTime: Math.ceil(wordCount / 200) // 분당 200단어 기준
    };
  }, [blocks]);
  
  return stats;
}

// useCallback을 통한 함수 재생성 방지
function Editor({ initialContent, onSave }) {
  const handleSave = useCallback((content) => {
    onSave(content);
  }, [onSave]);
  
  const handleFormat = useCallback((format: FormatType) => {
    applyFormat(format);
  }, []); // 의존성이 없으면 한 번만 생성
  
  return <EditorCore onSave={handleSave} onFormat={handleFormat} />;
}
```

## 3. 메모리 관리

### 3.1 메모리 누수 방지

```typescript
class EditorMemoryManager {
  private listeners: Map<string, EventListener[]> = new Map();
  private timers: Set<NodeJS.Timeout> = new Set();
  private observers: Set<IntersectionObserver | MutationObserver> = new Set();
  
  // 이벤트 리스너 관리
  addEventListener(element: Element, event: string, handler: EventListener) {
    element.addEventListener(event, handler);
    
    const key = `${element.id}-${event}`;
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    this.listeners.get(key)!.push(handler);
  }
  
  // 타이머 관리
  setTimeout(callback: () => void, delay: number): NodeJS.Timeout {
    const timer = setTimeout(() => {
      callback();
      this.timers.delete(timer);
    }, delay);
    
    this.timers.add(timer);
    return timer;
  }
  
  // Observer 관리
  createIntersectionObserver(callback: IntersectionObserverCallback): IntersectionObserver {
    const observer = new IntersectionObserver(callback);
    this.observers.add(observer);
    return observer;
  }
  
  // 정리 메서드
  cleanup() {
    // 모든 이벤트 리스너 제거
    this.listeners.forEach((handlers, key) => {
      const [elementId, event] = key.split('-');
      const element = document.getElementById(elementId);
      if (element) {
        handlers.forEach(handler => {
          element.removeEventListener(event, handler);
        });
      }
    });
    this.listeners.clear();
    
    // 모든 타이머 정리
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    
    // 모든 Observer 정리
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// React Hook으로 구현
function useEditorCleanup() {
  const manager = useRef(new EditorMemoryManager());
  
  useEffect(() => {
    return () => {
      manager.current.cleanup();
    };
  }, []);
  
  return manager.current;
}
```

### 3.2 이미지 최적화

```typescript
class ImageOptimizer {
  private imageCache = new Map<string, HTMLImageElement>();
  private loadingQueue: string[] = [];
  private maxConcurrentLoads = 3;
  private currentLoads = 0;
  
  // 이미지 지연 로딩
  lazyLoadImage(src: string): Promise<HTMLImageElement> {
    if (this.imageCache.has(src)) {
      return Promise.resolve(this.imageCache.get(src)!);
    }
    
    return new Promise((resolve, reject) => {
      this.loadingQueue.push(src);
      this.processQueue();
    });
  }
  
  private async processQueue() {
    if (this.currentLoads >= this.maxConcurrentLoads || this.loadingQueue.length === 0) {
      return;
    }
    
    this.currentLoads++;
    const src = this.loadingQueue.shift()!;
    
    try {
      const img = await this.loadImage(src);
      this.imageCache.set(src, img);
      this.currentLoads--;
      this.processQueue();
    } catch (error) {
      this.currentLoads--;
      this.processQueue();
    }
  }
  
  // 이미지 압축
  async compressImage(file: File, maxWidth = 1920, quality = 0.8): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      img.onload = () => {
        // 비율 유지하며 리사이징
        const ratio = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        // 이미지 그리기
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Blob으로 변환
        canvas.toBlob(
          blob => blob ? resolve(blob) : reject(new Error('Compression failed')),
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }
  
  // 메모리 정리
  clearCache() {
    this.imageCache.forEach(img => {
      img.src = ''; // 메모리 해제
    });
    this.imageCache.clear();
  }
}
```

## 4. 네트워크 최적화

### 4.1 API 호출 최적화

```typescript
// Request Batching
class APIBatcher {
  private queue: Map<string, Promise<any>> = new Map();
  private batchTimer: NodeJS.Timeout | null = null;
  private batchDelay = 50; // 50ms
  
  async batchRequest<T>(key: string, request: () => Promise<T>): Promise<T> {
    if (this.queue.has(key)) {
      return this.queue.get(key) as Promise<T>;
    }
    
    const promise = new Promise<T>((resolve, reject) => {
      this.queue.set(key, { request, resolve, reject });
      this.scheduleBatch();
    });
    
    return promise;
  }
  
  private scheduleBatch() {
    if (this.batchTimer) return;
    
    this.batchTimer = setTimeout(() => {
      this.executeBatch();
      this.batchTimer = null;
    }, this.batchDelay);
  }
  
  private async executeBatch() {
    const batch = Array.from(this.queue.entries());
    this.queue.clear();
    
    // 병렬 실행
    const results = await Promise.allSettled(
      batch.map(([key, { request }]) => request())
    );
    
    // 결과 전달
    batch.forEach(([key, { resolve, reject }], index) => {
      const result = results[index];
      if (result.status === 'fulfilled') {
        resolve(result.value);
      } else {
        reject(result.reason);
      }
    });
  }
}

// HTTP/2 Server Push 활용
app.use((req, res, next) => {
  if (req.url === '/editor') {
    // 에디터 페이지 요청 시 필요한 리소스 미리 푸시
    res.push('/js/editor-vendor.js', { 
      request: { accept: '*/*' },
      response: { 'content-type': 'application/javascript' }
    });
    res.push('/css/editor.css', {
      request: { accept: '*/*' },
      response: { 'content-type': 'text/css' }
    });
  }
  next();
});
```

### 4.2 캐싱 전략

```typescript
// Service Worker를 통한 캐싱
// sw.js
const CACHE_NAME = 'editor-v1';
const EDITOR_ASSETS = [
  '/js/editor-vendor.js',
  '/css/editor.css',
  '/fonts/editor-icons.woff2'
];

// 설치 시 에디터 자원 캐싱
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(EDITOR_ASSETS);
    })
  );
});

// Cache-First 전략
self.addEventListener('fetch', event => {
  if (event.request.url.includes('/editor/')) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).then(fetchResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
  }
});

// IndexedDB를 통한 콘텐츠 캐싱
class ContentCache {
  private db: IDBDatabase | null = null;
  
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('EditorCache', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('content')) {
          db.createObjectStore('content', { keyPath: 'id' });
        }
      };
    });
  }
  
  async saveContent(id: string, content: any) {
    const transaction = this.db!.transaction(['content'], 'readwrite');
    const store = transaction.objectStore('content');
    
    return new Promise((resolve, reject) => {
      const request = store.put({ 
        id, 
        content, 
        timestamp: Date.now(),
        version: 1
      });
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  async getContent(id: string) {
    const transaction = this.db!.transaction(['content'], 'readonly');
    const store = transaction.objectStore('content');
    
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      
      request.onsuccess = () => {
        const data = request.result;
        
        // 24시간 이상 오래된 캐시는 무효화
        if (data && Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
          resolve(data.content);
        } else {
          resolve(null);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }
}
```

## 5. 렌더링 최적화

### 5.1 CSS Containment

```css
/* 레이아웃 격리를 통한 리플로우 최소화 */
.editor-block {
  contain: layout style paint;
  will-change: transform;
}

.editor-container {
  contain: strict;
  content-visibility: auto;
  contain-intrinsic-size: 0 500px;
}

/* GPU 가속 활용 */
.editor-toolbar {
  transform: translateZ(0);
  will-change: transform, opacity;
}

.editor-cursor {
  animation: blink 1s infinite;
  transform: translateZ(0);
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
```

### 5.2 Web Workers 활용

```typescript
// worker.ts - 무거운 연산을 Worker에서 처리
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch(type) {
    case 'PARSE_CONTENT':
      const parsed = parseComplexContent(data);
      self.postMessage({ type: 'CONTENT_PARSED', data: parsed });
      break;
      
    case 'VALIDATE_CONTENT':
      const errors = validateContent(data);
      self.postMessage({ type: 'VALIDATION_COMPLETE', data: errors });
      break;
      
    case 'SEARCH_CONTENT':
      const results = searchInContent(data.content, data.query);
      self.postMessage({ type: 'SEARCH_RESULTS', data: results });
      break;
  }
});

// main.ts - Worker 사용
class EditorWorkerManager {
  private worker: Worker;
  private callbacks = new Map<string, (data: any) => void>();
  
  constructor() {
    this.worker = new Worker('/worker.js');
    this.worker.addEventListener('message', this.handleMessage);
  }
  
  private handleMessage = (event: MessageEvent) => {
    const { type, data } = event.data;
    const callback = this.callbacks.get(type);
    if (callback) {
      callback(data);
      this.callbacks.delete(type);
    }
  };
  
  parseContent(content: string): Promise<any> {
    return new Promise((resolve) => {
      this.callbacks.set('CONTENT_PARSED', resolve);
      this.worker.postMessage({ type: 'PARSE_CONTENT', data: content });
    });
  }
  
  validateContent(content: any): Promise<any[]> {
    return new Promise((resolve) => {
      this.callbacks.set('VALIDATION_COMPLETE', resolve);
      this.worker.postMessage({ type: 'VALIDATE_CONTENT', data: content });
    });
  }
}
```

## 6. 모니터링 및 프로파일링

### 6.1 Performance Monitoring

```typescript
class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  
  // 성능 측정
  measure(name: string, fn: () => void) {
    const start = performance.now();
    fn();
    const duration = performance.now() - start;
    
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(duration);
    
    // 임계값 초과 시 경고
    if (duration > 100) {
      console.warn(`Performance warning: ${name} took ${duration}ms`);
    }
  }
  
  // 통계 계산
  getStats(name: string) {
    const values = this.metrics.get(name) || [];
    if (values.length === 0) return null;
    
    const sorted = [...values].sort((a, b) => a - b);
    return {
      mean: values.reduce((a, b) => a + b, 0) / values.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
      min: sorted[0],
      max: sorted[sorted.length - 1]
    };
  }
  
  // Core Web Vitals 측정
  measureWebVitals() {
    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    
    // First Input Delay
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const delay = entry.processingStart - entry.startTime;
        console.log('FID:', delay);
      });
    }).observe({ type: 'first-input', buffered: true });
    
    // Cumulative Layout Shift
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      console.log('CLS:', clsValue);
    }).observe({ type: 'layout-shift', buffered: true });
  }
}
```

### 6.2 메모리 프로파일링

```typescript
class MemoryProfiler {
  private snapshots: Array<{ time: number; memory: any }> = [];
  
  startProfiling(interval = 5000) {
    setInterval(() => {
      if ('memory' in performance) {
        this.snapshots.push({
          time: Date.now(),
          memory: {
            usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
            totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
            jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
          }
        });
        
        // 메모리 누수 감지
        if (this.detectMemoryLeak()) {
          console.error('Potential memory leak detected!');
          this.reportMemoryLeak();
        }
      }
    }, interval);
  }
  
  detectMemoryLeak(): boolean {
    if (this.snapshots.length < 10) return false;
    
    // 최근 10개 스냅샷의 메모리 증가 추세 분석
    const recent = this.snapshots.slice(-10);
    const memoryGrowth = recent.map(s => s.memory.usedJSHeapSize);
    
    // 선형 회귀로 증가 추세 계산
    const trend = this.calculateTrend(memoryGrowth);
    
    // 지속적인 메모리 증가가 있으면 누수 의심
    return trend > 0.1; // 10% 이상 증가 추세
  }
  
  private calculateTrend(values: number[]): number {
    // 간단한 선형 회귀 구현
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope / (sumY / n); // 상대적 증가율
  }
}
```

## 7. 성능 벤치마크 목표

### 7.1 핵심 지표 목표치

| 지표 | 목표 | 최대 허용치 | 측정 방법 |
|------|------|------------|-----------|
| **Initial Load Time** | < 1.5s | 3s | FCP (First Contentful Paint) |
| **Time to Interactive** | < 2s | 4s | TTI 측정 |
| **Bundle Size (gzip)** | < 150KB | 250KB | webpack-bundle-analyzer |
| **Memory Usage** | < 50MB | 100MB | Chrome DevTools |
| **Typing Latency** | < 16ms | 50ms | Input → Render 시간 |
| **Save Latency** | < 500ms | 1s | 저장 버튼 → 완료 |
| **LCP** | < 2.5s | 4s | Largest Contentful Paint |
| **FID** | < 100ms | 300ms | First Input Delay |
| **CLS** | < 0.1 | 0.25 | Cumulative Layout Shift |

### 7.2 로드 테스트 시나리오

```typescript
// 성능 테스트 자동화
class PerformanceTestRunner {
  async runLoadTest() {
    const results = {
      small: await this.testDocument(100),    // 100 단어
      medium: await this.testDocument(5000),   // 5,000 단어
      large: await this.testDocument(20000),   // 20,000 단어
      huge: await this.testDocument(100000)    // 100,000 단어
    };
    
    return results;
  }
  
  private async testDocument(wordCount: number) {
    const start = performance.now();
    
    // 문서 생성
    const doc = this.generateDocument(wordCount);
    
    // 에디터 초기화
    const initTime = performance.now();
    const editor = await this.initEditor(doc);
    
    // 타이핑 시뮬레이션
    const typeTime = performance.now();
    await this.simulateTyping(editor, 100);
    
    // 저장 시뮬레이션
    const saveTime = performance.now();
    await editor.save();
    
    const endTime = performance.now();
    
    return {
      total: endTime - start,
      init: initTime - start,
      typing: typeTime - initTime,
      save: endTime - saveTime,
      memory: (performance as any).memory?.usedJSHeapSize
    };
  }
}
```

## 8. 최적화 체크리스트

### 개발 단계
- [ ] 코드 분할 구현
- [ ] Tree shaking 설정
- [ ] 동적 임포트 사용
- [ ] Critical CSS 분리
- [ ] Resource hints 추가
- [ ] 이미지 최적화 파이프라인
- [ ] Web Worker 구현
- [ ] Service Worker 캐싱
- [ ] Virtual scrolling 구현

### 테스트 단계
- [ ] Lighthouse 점수 확인 (> 90)
- [ ] 번들 크기 분석
- [ ] 메모리 프로파일링
- [ ] 네트워크 워터폴 분석
- [ ] 다양한 디바이스 테스트
- [ ] 느린 네트워크 시뮬레이션

### 배포 단계
- [ ] CDN 설정
- [ ] Gzip/Brotli 압축
- [ ] HTTP/2 활성화
- [ ] 캐시 헤더 설정
- [ ] 모니터링 도구 설정
- [ ] 성능 대시보드 구축

## 9. 도구 및 리소스

### 분석 도구
- **Chrome DevTools**: Performance, Memory, Network 탭
- **Lighthouse**: 웹 성능 감사
- **WebPageTest**: 실제 환경 테스트
- **Bundle Analyzer**: webpack-bundle-analyzer
- **React DevTools Profiler**: React 컴포넌트 성능

### 모니터링 도구
- **Sentry**: 에러 및 성능 모니터링
- **New Relic**: APM 솔루션
- **DataDog**: 인프라 및 애플리케이션 모니터링
- **Google Analytics**: 실사용자 성능 데이터

### 참고 자료
- [Web.dev Performance](https://web.dev/performance/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [React Performance](https://react.dev/learn/render-and-commit)
- [MDN Performance APIs](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API)

*최종 업데이트: 2025년 1월 6일*
/**
 * CheckoutService API Client
 * 
 * Checkout 백엔드와의 모든 통신을 담당하는 서비스 레이어
 * Mock과 Real 모드를 지원하여 개발/프로덕션 환경 대응
 */

import {
  CheckoutRequest,
  CheckoutResponse,
  CheckoutResult,
  CheckoutError,
  CheckoutErrorCode,
  CheckoutStatus,
  ApiResponse
} from '../types/checkout';
import toast from 'react-hot-toast';
import type { Currency, PaymentPayMethod } from '@portone/browser-sdk/v2';

// PortOne SDK payload (server-provided)
export interface PortOneSdkPayload {
  storeId: string;
  channelKey: string;
  paymentId: string;
  orderName: string;
  totalAmount: number;
  currency: Currency;
  payMethod: PaymentPayMethod;
  redirectUrl: string;
}

// PaymentIntent 타입 정의
export interface PaymentIntent {
  intentId: string;
  userId: string;
  domainId: string;
  domain: string;
  reservations: Record<string, string>; // {domainName: reservationId}
  status: 'CREATED' | 'RESERVED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'NOT_COMPLETED';
  totalAmount: number;
  expiresAt: string;
  createdAt: string;
  paymentUrl?: string;
  correlationId: string;
  requestId: string;
  // New fields for SDK-first flow
  invocationType?: 'SDK' | 'URL';
  portOneSdkPayload?: PortOneSdkPayload | null;
}

// 결제 상태 확인 응답
export interface PaymentStatusResponse {
  intentId: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED' | 'NOT_COMPLETED' | 'EXPIRED';
  result?: CheckoutResult;
  message?: string;
  updatedAt: string;
}

// 도메인 검증 응답
export interface ValidationResponse {
  canPurchase: boolean;
  reason?: string;
  constraints?: string[];
}

// 예약 응답
export interface ReservationResponse {
  reservationId: string;
  domain: string;
  domainId: string;
  expiresAt: string;
}

// 세션 저장 타입
interface SessionData {
  intentId: string;
  domain: string;
  domainId: string;
  reservations: Record<string, string>;
  expiresAt: string;
  correlationId: string;
}

// API 설정
interface CheckoutServiceConfig {
  baseUrl: string;
  timeout?: number;
}

// PG 리턴 파라미터 타입
interface PGReturnParams {
  success: boolean;
  paymentId?: string;
  pgToken?: string;
  tid?: string;
  paymentKey?: string;
  orderId?: string;
  message?: string;
}

class CheckoutService {
  private config: CheckoutServiceConfig;
  private abortControllers: Map<string, AbortController> = new Map();
  private pendingRequests: Set<string> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;

  constructor(config?: Partial<CheckoutServiceConfig>) {
    this.config = {
      baseUrl: config?.baseUrl || process.env.REACT_APP_CHECKOUT_API_URL || 'http://localhost:8080/api/checkout',
      timeout: config?.timeout || 30000 // 30초 타임아웃
    };
    
    // BroadcastChannel 초기화 (브라우저 지원 확인)
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel('payment-session');
        this.setupBroadcastListener();
      } catch {
        // BroadcastChannel 지원하지 않는 브라우저
        this.broadcastChannel = null;
      }
    }
  }

  /**
   * BroadcastChannel 리스너 설정
   */
  private setupBroadcastListener(): void {
    if (!this.broadcastChannel) return;
    
    this.broadcastChannel.addEventListener('message', (event) => {
      // 다른 탭에서 결제 시작 알림을 받음
      if (event.data.type === 'PAYMENT_START') {
        const { orderId, tabId } = event.data;
        
        // 현재 탭에서 같은 주문의 결제가 진행 중이면 충돌 감지
        if (this.pendingRequests.has(`checkout_${orderId}`)) {
          // 탭 ID가 다르면 충돌
          if (tabId !== this.getTabId()) {
            // 사용자에게 Toast 알림
            toast.error('다른 탭에서 동일한 상품의 결제가 진행 중입니다.', {
              duration: 5000,
              position: 'top-center',
              style: {
                background: '#EF4444',
                color: '#fff',
                padding: '16px',
                borderRadius: '8px',
              },
            });
            // 현재 진행 중인 요청 취소
            const controller = this.abortControllers.get(`checkout_${orderId}`);
            if (controller) {
              controller.abort();
            }
          }
        }
      }
      
      // 다른 탭에서 결제 완료 알림
      if (event.data.type === 'PAYMENT_COMPLETE') {
        const { orderId } = event.data;
        // 해당 주문의 pending 상태 제거
        this.pendingRequests.delete(`checkout_${orderId}`);
      }
    });
  }
  
  /**
   * 탭 고유 ID 생성
   */
  private getTabId(): string {
    if (!sessionStorage.getItem('tabId')) {
      sessionStorage.setItem('tabId', `tab_${Date.now()}_${Math.random()}`);
    }
    return sessionStorage.getItem('tabId') || '';
  }
  
  /**
   * 다른 탭에 결제 시작 알림
   */
  private broadcastPaymentStart(orderId: string): void {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'PAYMENT_START',
        orderId,
        tabId: this.getTabId(),
        timestamp: Date.now()
      });
    }
  }
  
  /**
   * 다른 탭에 결제 완료 알림
   */
  private broadcastPaymentComplete(orderId: string): void {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'PAYMENT_COMPLETE',
        orderId,
        tabId: this.getTabId(),
        timestamp: Date.now()
      });
    }
  }

  /**
   * 안전한 localStorage 접근
   */
  private safeGetFromStorage(key: string, storage: Storage = localStorage): string | null {
    try {
      return storage.getItem(key);
    } catch (error) {
      // Private browsing mode 등에서 실패할 수 있음
      return null;
    }
  }

  /**
   * 안전한 localStorage 저장
   */
  private safeSetToStorage(key: string, value: string, storage: Storage = localStorage): void {
    try {
      storage.setItem(key, value);
    } catch (error) {
      // Quota exceeded 등의 에러 무시
    }
  }

  /**
   * 안전한 JSON 파싱
   */
  private safeJsonParse<T>(json: string | null, fallback: T): T {
    if (!json) return fallback;
    try {
      return JSON.parse(json);
    } catch {
      return fallback;
    }
  }

  /**
   * 인증 토큰 가져오기
   */
  private getAuthToken(): string {
    const token = this.safeGetFromStorage('authToken');
    if (!token) {
      throw this.createCheckoutError({
        code: 'AUTH_REQUIRED',
        message: '로그인이 필요한 서비스입니다.'
      });
    }
    return token;
  }

  /**
   * AbortController 생성 및 관리
   */
  private createAbortController(key: string): AbortController {
    // 이전 요청 취소
    const existingController = this.abortControllers.get(key);
    if (existingController) {
      existingController.abort();
    }

    const controller = new AbortController();
    this.abortControllers.set(key, controller);

    // 타임아웃 설정
    setTimeout(() => {
      controller.abort();
      this.abortControllers.delete(key);
    }, this.config.timeout!);

    return controller;
  }

  /**
   * 중복 요청 방지
   */
  private checkDuplicateRequest(key: string): void {
    if (this.pendingRequests.has(key)) {
      throw this.createCheckoutError({
        code: 'DUPLICATE_REQUEST',
        message: '이미 처리 중인 요청입니다.'
      });
    }
    this.pendingRequests.add(key);
  }

  /**
   * 요청 완료 처리
   */
  private completeRequest(key: string): void {
    this.pendingRequests.delete(key);
    this.abortControllers.delete(key);
    
    // 결제 완료 알림 (checkout 요청인 경우)
    if (key.startsWith('checkout_')) {
      const orderId = key.replace('checkout_', '');
      this.broadcastPaymentComplete(orderId);
    }
  }

  /**
   * 결제 세션 시작 - 도메인 검증, 예약, PaymentIntent 생성
   */
  async initiateCheckout(request: CheckoutRequest): Promise<PaymentIntent> {
    const requestKey = `checkout_${request.orderId}`;
    
    try {
      // 중복 요청 체크
      this.checkDuplicateRequest(requestKey);
      
      // 다른 탭에 결제 시작 알림
      this.broadcastPaymentStart(request.orderId);

      // Mock 모드 비활성화

      const token = this.getAuthToken();
      const controller = this.createAbortController(requestKey);

      const response = await fetch(`${this.config.baseUrl}/payment-intents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Request-Id': this.generateRequestId(),
          'X-Correlation-Id': this.generateCorrelationId()
        },
        body: JSON.stringify(request),
        signal: controller.signal
      });

      if (!response.ok) {
        const apiResponse: ApiResponse<any> = await response.json().catch(() => ({
          success: false,
          error: { code: 'PARSE_ERROR', message: '응답 파싱 실패' }
        }));
        // 사용자 친화적 메시지 처리
        let userMessage = '결제를 시작할 수 없습니다.';

        // HTTP 상태 코드별 메시지
        if (response.status === 500 || response.status === 502 || response.status === 503) {
          userMessage = '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.';
        } else if (response.status === 404) {
          userMessage = '결제 서비스를 찾을 수 없습니다. 관리자에게 문의해 주세요.';
        } else if (response.status === 401 || response.status === 403) {
          userMessage = '로그인이 필요하거나 권한이 없습니다.';
        } else if (response.status === 400) {
          userMessage = apiResponse.error?.message || '입력한 정보를 다시 확인해 주세요.';
        }

        throw this.createCheckoutError({
          code: apiResponse.error?.code || 'PAYMENT_INIT_ERROR',
          message: userMessage,
          details: {
            originalMessage: apiResponse.error?.message,
            statusCode: response.status,
            ...apiResponse.error?.details
          }
        });
      }

      const apiResponse: ApiResponse<PaymentIntent> = await response.json();
      
      // API 응답 검증
      if (!apiResponse.success || !apiResponse.data) {
        throw this.createCheckoutError({
          code: apiResponse.error?.code || 'INVALID_RESPONSE',
          message: apiResponse.error?.message || '서버 응답이 올바르지 않습니다.'
        });
      }
      
      const intent = apiResponse.data;
      
      // 타입 검증 (SDK 또는 URL 중 하나는 유효해야 함)
      if (!intent.intentId || (!intent.paymentUrl && !(intent.invocationType === 'SDK' && intent.portOneSdkPayload))) {
        throw this.createCheckoutError({
          code: 'INVALID_RESPONSE',
          message: '서버 응답이 올바르지 않습니다.'
        });
      }
      
      // 세션 정보 로컬 저장 (브라우저 새로고침 대응)
      this.saveSession(intent);

      // SDK 모드인 경우: PortOne SDK 호출 (redirect형 포함)
      if (intent.invocationType === 'SDK' && intent.portOneSdkPayload) {
        // 결제 요청 직전 페이로드 로깅 (민감정보 마스킹)
        try {
          const pl = intent.portOneSdkPayload;
          const masked = {
            ...pl,
            channelKey: pl.channelKey ? `*${pl.channelKey.slice(-6)}` : undefined,
            storeId: pl.storeId ? `*${pl.storeId.slice(-6)}` : undefined,
          };
          console.info('[PortOne SDK] requestPayment payload', masked);
          console.info('[PortOne SDK] redirectUrl typeof/value', typeof pl.redirectUrl, pl.redirectUrl);
        } catch {}
        try {
          const PortOne = await import('@portone/browser-sdk/v2');
          const response = await PortOne.requestPayment(intent.portOneSdkPayload);

          // SDK 응답이 없는 경우 (리디렉션 또는 팝업 닫힘)
          if (!response) {
            throw this.createCheckoutError({
              code: 'PAYMENT_SDK_ERROR',
              message: '결제 응답을 받지 못했습니다. 다시 시도해 주세요.'
            });
          }

          // SDK 응답 체크 (문서 기반)
          if (response.code !== undefined) {
            // 오류 발생 (취소, 실패 등)
            console.log('[PortOne SDK] Payment cancelled or failed:', {
              code: response.code,
              message: response.message,
              pgCode: response.pgCode,
              pgMessage: response.pgMessage
            });

            // 사용자 친화적 메시지로 변환
            let userMessage = '결제를 처리할 수 없습니다.';
            if (response.code === 'USER_CANCEL' || response.message?.includes('취소')) {
              userMessage = '결제가 취소되었습니다.';
            } else if (response.code === 'NETWORK_ERROR') {
              userMessage = '네트워크 연결을 확인해 주세요.';
            } else if (response.message) {
              userMessage = response.message;
            }

            throw this.createCheckoutError({
              code: response.code === 'USER_CANCEL' ? 'USER_CANCEL' : 'PAYMENT_SDK_ERROR',
              message: userMessage,
              details: {
                originalCode: response.code,
                originalMessage: response.message,
                pgCode: response.pgCode,
                pgMessage: response.pgMessage
              }
            });
          }

          // 성공한 경우만 플래그 설정
          console.log('[PortOne SDK] Payment request succeeded, paymentId:', response.paymentId);
          (intent as any).sdkCompleted = true;
          (intent as any).paymentId = response.paymentId;
        } catch (e: any) {
          // SDK import 실패 또는 기타 에러
          console.error('[PortOne SDK] Unexpected error:', { code: e?.code, message: e?.message, err: e });

          // 이미 CheckoutError인 경우 그대로 throw
          if (e?.code && e?.message && e?.details) {
            throw e;
          }

          // 새로운 에러 생성
          throw this.createCheckoutError({
            code: 'PAYMENT_SDK_ERROR',
            message: e?.message || '결제 SDK를 로드할 수 없습니다.',
            details: { originalError: e?.message, originalCode: e?.code }
          });
        }
      }
      
      return intent;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw this.createCheckoutError({
            code: 'REQUEST_TIMEOUT',
            message: '요청 시간이 초과되었습니다.'
          });
        }
      }
      throw error;
    } finally {
      this.completeRequest(requestKey);
    }
  }

  /**
   * 결제 상태 확인 (폴링용)
   */
  async checkPaymentStatus(intentId: string): Promise<PaymentStatusResponse> {
    if (!intentId) {
      throw this.createCheckoutError({
        code: 'INVALID_PARAM',
        message: 'Intent ID가 필요합니다.'
      });
    }

    try {
      // Mock 모드 비활성화

      const token = this.getAuthToken();
      const controller = this.createAbortController(`status_${intentId}`);

      const response = await fetch(`${this.config.baseUrl}/payment-intents/${intentId}/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        signal: controller.signal
      });

      if (!response.ok) {
        const apiResponse: ApiResponse<any> = await response.json().catch(() => ({
          success: false,
          error: { code: 'STATUS_CHECK_FAILED', message: '결제 상태 확인 실패' }
        }));
        throw this.createCheckoutError({
          code: apiResponse.error?.code || 'STATUS_CHECK_FAILED',
          message: apiResponse.error?.message || '결제 상태 확인 실패'
        });
      }

      const apiResponse: ApiResponse<PaymentStatusResponse> = await response.json();

      if (!apiResponse.success || !apiResponse.data) {
        console.error('[CheckoutService] Payment status check failed:', {
          intentId,
          success: apiResponse.success,
          error: apiResponse.error,
          data: apiResponse.data
        });
        throw this.createCheckoutError({
          code: apiResponse.error?.code || 'INVALID_RESPONSE',
          message: apiResponse.error?.message || '서버 응답이 올바르지 않습니다.'
        });
      }

      // 폴링 상태 로깅
      console.log('[CheckoutService] Payment status check:', {
        intentId,
        status: apiResponse.data.status,
        message: apiResponse.data.message,
        updatedAt: apiResponse.data.updatedAt
      });

      return apiResponse.data;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw this.createCheckoutError({
          code: 'REQUEST_TIMEOUT',
          message: '상태 확인 시간 초과'
        });
      }
      throw error;
    }
  }

  /**
   * 결제 검증 (Success 페이지에서 호출)
   */
  async verifyPayment(orderId: string, paymentKey: string, amount: number): Promise<CheckoutResult> {
    const requestKey = `verify_${orderId}`;
    
    try {
      this.checkDuplicateRequest(requestKey);

      // Mock 모드 비활성화

      const token = this.getAuthToken();
      const controller = this.createAbortController(requestKey);

      const response = await fetch(`${this.config.baseUrl}/payment-intents/verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId, paymentKey, amount }),
        signal: controller.signal
      });

      if (!response.ok) {
        const apiResponse: ApiResponse<any> = await response.json().catch(() => ({
          success: false,
          error: { code: 'VERIFY_FAILED', message: '결제 검증 실패' }
        }));
        throw this.createCheckoutError({
          code: apiResponse.error?.code || 'VERIFY_FAILED',
          message: apiResponse.error?.message || '결제 검증 실패'
        });
      }

      const apiResponse: ApiResponse<CheckoutResult> = await response.json();
      
      if (!apiResponse.success || !apiResponse.data) {
        throw this.createCheckoutError({
          code: apiResponse.error?.code || 'INVALID_RESPONSE',
          message: apiResponse.error?.message || '결제 검증 응답이 올바르지 않습니다.'
        });
      }
      
      return apiResponse.data;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw this.createCheckoutError({
          code: 'REQUEST_TIMEOUT',
          message: '검증 요청 시간 초과'
        });
      }
      throw error;
    } finally {
      this.completeRequest(requestKey);
    }
  }

  /**
   * 예약 취소 (결제 실패/취소 시)
   */
  async cancelReservation(intentId: string): Promise<void> {
    if (!intentId) return;

    try {
      // Mock 모드 비활성화

      const token = this.safeGetFromStorage('authToken');
      if (!token) return; // 토큰 없으면 조용히 실패

      const controller = this.createAbortController(`cancel_${intentId}`);

      await fetch(`${this.config.baseUrl}/payment-intents/${intentId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        signal: controller.signal
      });
      // 취소는 실패해도 무시
    } catch (error) {
      // 예약 취소 실패는 조용히 처리하되, 개발 환경에서는 로깅
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[CheckoutService] Failed to cancel reservation ${intentId}:`, error);
      }
    }
  }

  /**
   * 결제 상태 폴링 (최대 20초)
   */
  async pollPaymentStatus(
    intentId: string,
    maxAttempts: number = 20,
    intervalMs: number = 1000
  ): Promise<PaymentStatusResponse> {
    let attempts = 0;
    const abortController = this.createAbortController(`poll_${intentId}`);

    console.log('[CheckoutService] Starting payment status polling:', {
      intentId,
      maxAttempts,
      intervalMs
    });

    try {
      while (attempts < maxAttempts) {
        // Abort 체크
        if (abortController.signal.aborted) {
          console.log('[CheckoutService] Polling aborted:', { intentId, attempts });
          throw this.createCheckoutError({
            code: 'POLLING_ABORTED',
            message: '폴링이 중단되었습니다.'
          });
        }

        console.log('[CheckoutService] Polling attempt:', {
          intentId,
          attempt: attempts + 1,
          maxAttempts
        });

        const status = await this.checkPaymentStatus(intentId);

        if (status.status === 'CONFIRMED' || status.status === 'FAILED' || status.status === 'NOT_COMPLETED') {
          console.log('[CheckoutService] Polling completed:', {
            intentId,
            finalStatus: status.status,
            attempts: attempts + 1,
            message: status.message
          });
          return status;
        }

        // PENDING 또는 EXPIRED 체크
        if (status.status === 'EXPIRED') {
          console.error('[CheckoutService] Payment expired:', { intentId, attempts });
          throw this.createCheckoutError({
            code: 'CHECKOUT_EXPIRED',
            message: '결제 시간이 만료되었습니다.'
          });
        }

        // 대기
        await this.sleep(intervalMs);
        attempts++;
      }

      // 타임아웃
      console.error('[CheckoutService] Polling timeout:', {
        intentId,
        totalAttempts: attempts,
        totalTime: `${attempts * intervalMs}ms`
      });
      throw this.createCheckoutError({
        code: 'PAYMENT_TIMEOUT',
        message: '결제 확인 시간이 초과되었습니다.'
      });
    } finally {
      this.abortControllers.delete(`poll_${intentId}`);
    }
  }

  /**
   * 세션 정보 저장 (브라우저 저장소)
   */
  private saveSession(intent: PaymentIntent): void {
    try {
      const sessionData: SessionData = {
        intentId: intent.intentId,
        domain: intent.domain,
        domainId: intent.domainId,
        reservations: intent.reservations,
        expiresAt: intent.expiresAt,
        correlationId: intent.correlationId
      };
      
      this.safeSetToStorage('currentPaymentSession', JSON.stringify(sessionData), sessionStorage);
      
      // 진행중인 세션 목록 관리
      const sessions = this.safeJsonParse<SessionData[]>(
        this.safeGetFromStorage('paymentSessions'),
        []
      );
      sessions.push(sessionData);
      this.safeSetToStorage('paymentSessions', JSON.stringify(sessions));
    } catch (error) {
      // 저장 실패는 치명적이지 않으므로 경고만
      if (process.env.NODE_ENV === 'development') {
        console.warn('[CheckoutService] Failed to save session:', error);
      }
    }
  }

  /**
   * 세션 정보 조회
   */
  getSession(intentId?: string): SessionData | null {
    try {
      if (intentId) {
        const sessions = this.safeJsonParse<SessionData[]>(
          this.safeGetFromStorage('paymentSessions'),
          []
        );
        return sessions.find((s) => s.intentId === intentId) || null;
      }
      
      const current = this.safeGetFromStorage('currentPaymentSession', sessionStorage);
      return this.safeJsonParse<SessionData | null>(current, null);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[CheckoutService] Failed to get session:', error);
      }
      return null;
    }
  }

  /**
   * 세션 정보 삭제
   */
  clearSession(intentId: string): void {
    try {
      sessionStorage.removeItem('currentPaymentSession');
      
      const sessions = this.safeJsonParse<SessionData[]>(
        this.safeGetFromStorage('paymentSessions'),
        []
      );
      const filtered = sessions.filter((s) => s.intentId !== intentId);
      this.safeSetToStorage('paymentSessions', JSON.stringify(filtered));
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[CheckoutService] Failed to clear session:', error);
      }
    }
  }

  /**
   * 도메인별 성공 후 리다이렉트 URL 결정
   */
  getSuccessRedirectUrl(intent: PaymentIntent | SessionData): string {
    const domain = intent.domain || 'study';
    const domainId = intent.domainId;

    switch (domain) {
      case 'study':
        return `/study/${domainId || ''}`;
      case 'documento':
        return `/documento/dashboard`;
      case 'job-navigator':
        return `/job-navigator/premium`;
      default:
        return '/';
    }
  }

  /**
   * 모든 진행중인 요청 취소
   */
  cancelAllRequests(): void {
    this.abortControllers.forEach(controller => controller.abort());
    this.abortControllers.clear();
    this.pendingRequests.clear();
  }

  // ===== Mock 구현 제거됨 =====

  // ===== 유틸리티 =====

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createCheckoutError(error: {
    code?: string;
    message?: string;
    details?: any;
  }): CheckoutError {
    return {
      code: (error.code || 'UNKNOWN_ERROR') as CheckoutErrorCode,
      message: error.message || '알 수 없는 오류가 발생했습니다.',
      details: error.details
    };
  }

  /**
   * PG사별 리턴 파라미터 파싱
   */
  parsePGReturnParams(params: URLSearchParams, paymentMethod: string): PGReturnParams {
    switch (paymentMethod) {
      case 'naverpay':
        return {
          success: params.get('resultCode') === 'Success',
          paymentId: params.get('paymentId') || undefined,
          message: params.get('resultMessage') || undefined
        };
      
      case 'kakaopay':
        return {
          success: params.get('status') === 'success',
          pgToken: params.get('pg_token') || undefined,
          tid: params.get('tid') || undefined
        };
      
      default:
        return {
          success: params.get('status') === 'success',
          paymentKey: params.get('paymentKey') || undefined,
          orderId: params.get('orderId') || undefined
        };
    }
  }
}

// 싱글톤 인스턴스 export
export const checkoutService = new CheckoutService();

export default CheckoutService;
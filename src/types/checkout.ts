/**
 * Unified Checkout System Types
 * 
 * 통합 결제 시스템을 위한 타입 정의
 * - 모든 도메인(study, documento, job-navigator)을 지원
 * - 네이버페이/카카오페이 전용
 * - Checkout Service와 통신하기 위한 인터페이스
 */

// ===== API Response Wrapper =====
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

// ===== 도메인 정의 =====
export type CheckoutDomain = 'study' | 'documento' | 'job-navigator';

// ===== 결제 수단 (네이버페이/카카오페이/이니시스/계좌이체) =====
export type CheckoutPaymentMethod = 'naverpay' | 'kakaopay' | 'inicis' | 'ACCOUNT_TRANSFER';

// ===== 구매 유형 =====
export type CheckoutItemType = 
  | 'enrollment'     // 스터디 참가
  | 'subscription'   // 구독 (월간/연간)
  | 'one-time'       // 단건 구매
  | 'credit'         // 크레딧 충전
  | 'service';       // 서비스 이용

// ===== 금액 정보 =====
export interface CheckoutAmount {
  original: number;      // 원가
  discount: number;      // 할인액
  final: number;         // 최종 결제액
  currency?: 'KRW';      // 한국 원화만 지원 (선택적)
  vatIncluded?: boolean; // VAT 포함 여부 (선택적)
}

// ===== 고객 정보 =====
export interface CheckoutCustomer {
  userId?: string;       // 사용자 ID (선택적)
  name: string;
  email: string;
  phone?: string;
}

// ===== 도메인별 특화 데이터 =====

// 스터디 도메인 데이터
export interface StudyCheckoutData {
  studyId: string;
  studyName: string;
  cohort?: string;        // 기수 (예: "3기")
  cohortId?: string;      // 코호트 ID
  cohortName?: string;    // 코호트명
  startDate: string;
  endDate: string;
  participationType: 'regular' | 'audit' | 'mentor';
}

// Documento 도메인 데이터
export interface DocumentoCheckoutData {
  planId: string;
  planName: string;
  planType: 'free' | 'starter' | 'professional' | 'enterprise';
  billingCycle: 'monthly' | 'yearly';
  autoRenewal: boolean;
  trialDays?: number;
  features?: string[];    // 포함된 기능 목록
}

// Job Navigator 도메인 데이터
export interface JobNavigatorCheckoutData {
  serviceId: string;
  serviceName: string;
  serviceType: 'basic' | 'premium' | 'enterprise';
  duration: number;       // 이용 기간 (일)
  features: string[];     // 포함된 기능 목록
}

// 도메인 데이터 유니온 타입
export type DomainSpecificData = 
  | StudyCheckoutData 
  | DocumentoCheckoutData 
  | JobNavigatorCheckoutData;

// ===== 메인 Checkout Request 타입 =====
export interface CheckoutRequest {
  // 필수 정보
  domain: CheckoutDomain;
  domainId: string;              // 도메인 내 고유 ID
  itemType: CheckoutItemType;
  orderName: string;             // 주문명 (예: "테코테코 3기 참가 신청")
  orderId: string;               // 주문 ID
  amount: CheckoutAmount;
  customer: CheckoutCustomer;
  paymentMethod: CheckoutPaymentMethod;
  
  // 도메인별 특화 데이터
  domainData: DomainSpecificData;
  
  // 선택적 정보
  metadata?: Record<string, any>;
  returnUrl?: string;            // 결제 완료 후 리턴 URL
  notificationUrl?: string;      // 웹훅 URL
  
  // 추적 정보
  requestId?: string;            // 요청 고유 ID (멱등성 보장)
  correlationId?: string;        // 전체 플로우 추적 ID
}

// ===== Checkout Response 타입 =====
export interface CheckoutResponse {
  checkoutId: string;            // Checkout 세션 ID
  paymentUrl: string;            // PG사 결제 페이지 URL
  expiresAt: string;             // 결제 URL 만료 시간
  status: CheckoutStatus;
}

export type CheckoutStatus =
  | 'pending'          // 결제 대기
  | 'processing'       // 결제 진행중
  | 'completed'        // 결제 완료
  | 'failed'           // 결제 실패 (deprecated - use not_completed)
  | 'cancelled'        // 사용자 취소 (deprecated - use not_completed)
  | 'not_completed'    // 완료되지 않음 (실패/취소 통합)
  | 'expired';         // 만료

// ===== 결제 결과 타입 =====
export interface CheckoutResult {
  checkoutId: string;
  orderId: string;
  status: CheckoutStatus;
  paidAt?: string;
  failureReason?: string;
  paymentKey?: string;           // PG사 결제 키
  receiptUrl?: string;           // 영수증 URL

  // NOT_COMPLETED 상태 추적 필드
  userAction?: string;           // "cancelled" or null
  userActionAt?: string;         // ISO 8601 timestamp
  webhookResult?: string;        // "failed", "cancelled" or null
  webhookAt?: string;            // ISO 8601 timestamp
  cancellationReason?: string;   // 취소 사유
  finalSource?: string;          // "user" or "webhook" (first-win)
}

// ===== 에러 타입 =====
export interface CheckoutError {
  code: CheckoutErrorCode;
  message: string;
  details?: any;
}

export type CheckoutErrorCode =
  | 'INVALID_DOMAIN'
  | 'INVALID_AMOUNT'
  | 'USER_NOT_ELIGIBLE'          // 구매 자격 없음
  | 'ITEM_NOT_AVAILABLE'          // 품절/마감
  | 'PAYMENT_METHOD_NOT_SUPPORTED'
  | 'CHECKOUT_EXPIRED'
  | 'CHECKOUT_FAILED'             // 체크아웃 실패
  | 'PAYMENT_FAILED'
  | 'USER_CANCEL'                 // 사용자 취소
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

// ===== UI 관련 타입 =====
export interface CheckoutUIConfig {
  theme?: 'light' | 'dark';
  locale?: 'ko' | 'en';
  showOrderSummary?: boolean;
  showCustomerInfo?: boolean;
  customTexts?: {
    title?: string;
    submitButton?: string;
    cancelButton?: string;
    termsAgreement?: string;
  };
}

// ===== Helper 타입 가드 함수 =====
export const isStudyCheckoutData = (data: DomainSpecificData): data is StudyCheckoutData => {
  return 'studyId' in data && 'participationType' in data;
};

export const isDocumentoCheckoutData = (data: DomainSpecificData): data is DocumentoCheckoutData => {
  return 'planId' in data && 'billingCycle' in data;
};

export const isJobNavigatorCheckoutData = (data: DomainSpecificData): data is JobNavigatorCheckoutData => {
  return 'serviceId' in data && 'serviceType' in data;
};

// ===== 도메인별 기본값 생성 함수 =====
export const createStudyCheckoutRequest = (
  data: {
    studyId: string;
    studyName: string;
    price: number;
    discountRate?: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    cohortId: string;
    cohortName: string;
    startDate: string;
    endDate: string;
  }
): Omit<CheckoutRequest, 'paymentMethod'> => {
  const discountAmount = data.discountRate ? data.price * (data.discountRate / 100) : 0;
  return {
    domain: 'study',
    domainId: data.studyId,
    itemType: 'enrollment',
    orderName: data.studyName,
    orderId: `study-${data.studyId}-${Date.now()}`,
    amount: {
      original: data.price,
      discount: discountAmount,
      final: data.price - discountAmount
    },
    customer: {
      name: data.customerName,
      email: data.customerEmail,
      phone: data.customerPhone
    },
    domainData: {
      studyId: data.studyId,
      studyName: data.studyName,
      startDate: data.startDate,
      endDate: data.endDate,
      participationType: 'regular',
      cohortId: data.cohortId,
      cohortName: data.cohortName
    } as StudyCheckoutData
  };
};

export const createDocumentoCheckoutRequest = (
  data: {
    planId: string;
    planName: string;
    price: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    billingCycle: 'monthly' | 'yearly';
    features: string[];
  }
): Omit<CheckoutRequest, 'paymentMethod'> => ({
  domain: 'documento',
  domainId: data.planId,
  itemType: 'subscription',
  orderName: data.planName,
  orderId: `documento-${data.planId}-${Date.now()}`,
  amount: {
    original: data.price,
    discount: 0,
    final: data.price
  },
  customer: {
    name: data.customerName,
    email: data.customerEmail,
    phone: data.customerPhone
  },
  domainData: {
    planId: data.planId,
    planName: data.planName,
    planType: data.planName.toLowerCase().includes('pro') ? 'professional' : 'basic',
    billingCycle: data.billingCycle,
    autoRenewal: true,
    features: data.features
  } as DocumentoCheckoutData
});
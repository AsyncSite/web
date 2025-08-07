// Payment System Type Definitions
// 프로덕션 수준의 결제 시스템 타입 정의

export type PaymentProvider = 'toss' | 'kakaopay' | 'naverpay' | 'payco' | 'samsungpay';

export type PaymentMethod = 
  | 'card'           // 신용/체크카드
  | 'transfer'       // 계좌이체
  | 'virtualAccount' // 가상계좌
  | 'phone'          // 휴대폰
  | 'easyPay';       // 간편결제

export type PaymentStatus = 
  | 'idle'
  | 'preparing'
  | 'ready'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'partial_refunded';

export type CardCompany = 
  | 'samsung'
  | 'shinhan'
  | 'kb'
  | 'hyundai'
  | 'lotte'
  | 'bc'
  | 'nh'
  | 'hana'
  | 'woori'
  | 'citi'
  | 'kakaobank'
  | 'kbank';

export interface PaymentAmount {
  original: number;
  discount: number;
  final: number;
  currency: 'KRW' | 'USD';
}

export interface PaymentItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  category?: string;
}

export interface PaymentCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface PaymentRequest {
  orderId: string;
  orderName: string;
  amount: PaymentAmount;
  items: PaymentItem[];
  customer: PaymentCustomer;
  metadata?: Record<string, any>;
  returnUrl?: string;
  notificationUrl?: string;
}

export interface PaymentResponse {
  paymentKey: string;
  orderId: string;
  status: PaymentStatus;
  amount: PaymentAmount;
  method?: PaymentMethod;
  provider?: PaymentProvider;
  approvedAt?: string;
  cardInfo?: {
    company: CardCompany;
    number: string; // 마스킹된 번호
    installmentMonth?: number;
  };
  receipt?: {
    url: string;
  };
  errorCode?: string;
  errorMessage?: string;
}

export interface PaymentConfig {
  clientKey: string;
  secretKey?: string;
  mode: 'test' | 'production';
  providers: {
    [key in PaymentProvider]?: {
      enabled: boolean;
      clientKey?: string;
      priority?: number;
    };
  };
  ui?: {
    theme?: 'light' | 'dark' | 'auto';
    primaryColor?: string;
    fontFamily?: string;
  };
}

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (payment: PaymentResponse) => void;
  onError?: (error: PaymentError) => void;
  request: PaymentRequest;
  config?: Partial<PaymentConfig>;
  allowedMethods?: PaymentMethod[];
  defaultMethod?: PaymentMethod;
}

export interface PaymentError {
  code: string;
  message: string;
  details?: any;
}

// 간편결제 프로바이더별 설정
export interface EasyPayProvider {
  id: PaymentProvider;
  name: string;
  logo: string;
  color: string;
  enabled: boolean;
  supportedMethods: PaymentMethod[];
}

// 프로모션 및 할인
export interface PaymentPromotion {
  id: string;
  type: 'percentage' | 'fixed';
  value: number;
  code?: string;
  description: string;
  validUntil?: Date;
  minAmount?: number;
  maxDiscount?: number;
}

// 결제 컨텍스트
export interface PaymentContextValue {
  config: PaymentConfig;
  currentPayment: PaymentRequest | null;
  status: PaymentStatus;
  error: PaymentError | null;
  initiatePayment: (request: PaymentRequest) => Promise<void>;
  confirmPayment: (paymentKey: string) => Promise<PaymentResponse>;
  cancelPayment: () => void;
  refundPayment: (paymentKey: string, amount?: number) => Promise<void>;
}

// 결제 훅 반환 타입
export interface UsePaymentReturn {
  status: PaymentStatus;
  error: PaymentError | null;
  isLoading: boolean;
  initiatePayment: (request: PaymentRequest) => Promise<void>;
  reset: () => void;
}

// 결제 이벤트
export type PaymentEvent = 
  | { type: 'PAYMENT_INITIATED'; payload: PaymentRequest }
  | { type: 'PAYMENT_READY'; payload: { paymentKey: string } }
  | { type: 'PAYMENT_COMPLETED'; payload: PaymentResponse }
  | { type: 'PAYMENT_FAILED'; payload: PaymentError }
  | { type: 'PAYMENT_CANCELLED' };
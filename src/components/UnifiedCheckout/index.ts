/**
 * UnifiedCheckout 컴포넌트 모듈
 * 
 * 통합 결제 시스템 컴포넌트들을 export
 * 네이버페이/카카오페이 전용
 */

export { default as CheckoutButton } from './CheckoutButton';
export { default as UnifiedCheckoutModal } from './UnifiedCheckoutModal';
export { default as CheckoutSummary } from './CheckoutSummary';
export { default as PaymentMethodSelector } from './PaymentMethodSelector';

// Re-export types for convenience
export type {
  CheckoutRequest,
  CheckoutResponse,
  CheckoutError,
  CheckoutDomain,
  CheckoutPaymentMethod,
  CheckoutItemType,
  CheckoutAmount,
  CheckoutCustomer,
  CheckoutStatus,
  StudyCheckoutData,
  DocumentoCheckoutData,
  JobNavigatorCheckoutData,
  CheckoutUIConfig
} from '../../types/checkout';

// Re-export helper functions
export {
  createStudyCheckoutRequest,
  createDocumentoCheckoutRequest,
  isStudyCheckoutData,
  isDocumentoCheckoutData,
  isJobNavigatorCheckoutData
} from '../../types/checkout';
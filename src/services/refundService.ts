import toast from 'react-hot-toast';

// Refund request and response types
export interface RefundRequest {
  intentId?: string;
  studyId: string;
  reason: string;
  refundAmount?: number;
}

export interface RefundResponse {
  success: boolean;
  transactionId?: string;
  status?: string;
  message?: string;
  refundedAmount?: number;
  failureReason?: string;
}

export interface RefundEligibilityResponse {
  canRefund: boolean;
  reasonCode?: string;
  reasonMessage?: string;
  refundableAmount?: number;
}

class RefundService {
  private baseUrl: string;

  constructor() {
    // Use checkout API URL from environment
    this.baseUrl = process.env.REACT_APP_CHECKOUT_API_URL ||
                   process.env.REACT_APP_API_URL ||
                   'http://localhost:8080/api/checkout';
  }

  /**
   * Check if a study enrollment can be refunded
   */
  async checkRefundEligibility(studyId: string, reservationId?: string): Promise<RefundEligibilityResponse> {
    try {
      // First check with study service
      const studyUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/studies/${studyId}/can-refund`;
      const params = reservationId ? `?reservationId=${reservationId}` : '';

      const response = await fetch(`${studyUrl}${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to check refund eligibility');
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error checking refund eligibility:', error);
      // Return default eligibility for now
      return {
        canRefund: true,
        reasonMessage: '환불 가능 여부를 확인할 수 없습니다.',
      };
    }
  }

  /**
   * Process refund for a payment intent
   */
  async processRefund(request: RefundRequest): Promise<RefundResponse> {
    try {
      // For now, we'll use a mock payment intent ID since we don't have it from the backend
      // In production, this should be retrieved from the study enrollment data
      const mockIntentId = `mock-intent-${request.studyId}-${Date.now()}`;
      const intentId = request.intentId || mockIntentId;

      const response = await fetch(`${this.baseUrl}/payment-intents/${intentId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          reason: request.reason,
          refundAmount: request.refundAmount, // null for full refund
          additionalInfo: `Study ID: ${request.studyId}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Refund request failed');
      }

      const data = await response.json();

      // Notify study service about successful refund
      if (data.success || data.data?.success) {
        await this.notifyStudyService(request.studyId, intentId);
      }

      return data.data || data;
    } catch (error: any) {
      console.error('Error processing refund:', error);

      // For now, return a mock successful response for testing
      // Remove this in production
      if (process.env.NODE_ENV === 'development') {
        toast.success('(개발 모드) 환불이 요청되었습니다.', {
          duration: 4000,
          position: 'top-center',
        });
        return {
          success: true,
          transactionId: `mock-txn-${Date.now()}`,
          status: 'REFUNDED',
          message: '환불이 처리되었습니다 (개발 모드)',
          refundedAmount: 50000,
        };
      }

      throw error;
    }
  }

  /**
   * Notify study service about refund completion
   */
  private async notifyStudyService(studyId: string, reservationId: string): Promise<void> {
    try {
      const studyUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/studies/${studyId}/refund-processed`;

      await fetch(`${studyUrl}?reservationId=${reservationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
    } catch (error) {
      console.error('Failed to notify study service about refund:', error);
      // Don't throw - this is a best effort notification
    }
  }

  /**
   * Get payment intent ID for a study enrollment
   * This would normally be stored with the enrollment data
   */
  async getPaymentIntentId(studyId: string, userId?: string): Promise<string | null> {
    try {
      // Try to retrieve from checkout service
      const params = new URLSearchParams({
        domain: 'study',
        domainId: studyId,
      });

      if (userId) {
        params.append('userId', userId);
      }

      const response = await fetch(`${this.baseUrl}/payment-intents/by-reference?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        console.warn('Could not retrieve payment intent ID');
        return null;
      }

      const data = await response.json();
      return data.data?.id || null;
    } catch (error) {
      console.error('Error getting payment intent ID:', error);
      return null;
    }
  }
}

// Export singleton instance
const refundService = new RefundService();
export default refundService;
/**
 * usePaymentSession Hook
 * 
 * 결제 세션 상태 관리 및 만료 시간 추적
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { checkoutService, PaymentIntent } from '../services/checkoutService';

export interface PaymentSessionState {
  session: PaymentIntent | null;
  isExpired: boolean;
  remainingTime: number; // seconds
  isActive: boolean;
}

export interface UsePaymentSessionReturn extends PaymentSessionState {
  startSession: (intent: PaymentIntent) => void;
  clearSession: () => void;
  restoreSession: () => PaymentIntent | null;
  updateSessionStatus: (status: PaymentIntent['status']) => void;
}

export const usePaymentSession = (): UsePaymentSessionReturn => {
  const [session, setSession] = useState<PaymentIntent | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 세션 시작
  const startSession = useCallback((intent: PaymentIntent) => {
    setSession(intent);
    setIsActive(true);
    setIsExpired(false);
    
    // 만료 시간 계산
    const expiresAt = new Date(intent.expiresAt).getTime();
    const now = Date.now();
    const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
    setRemainingTime(remaining);
    
    // 기존 인터벌 정리
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // 매초마다 남은 시간 업데이트
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setRemainingTime(remaining);
      
      if (remaining === 0) {
        setIsExpired(true);
        setIsActive(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    }, 1000);
  }, []);

  // 세션 정리
  const clearSession = useCallback(() => {
    if (session) {
      checkoutService.clearSession(session.intentId);
    }
    
    setSession(null);
    setIsActive(false);
    setIsExpired(false);
    setRemainingTime(0);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [session]);

  // 세션 복구 (페이지 새로고침 등)
  const restoreSession = useCallback((): PaymentIntent | null => {
    const savedSession = checkoutService.getSession();
    
    if (savedSession && !isExpired) {
      const expiresAt = new Date(savedSession.expiresAt).getTime();
      const now = Date.now();
      
      if (expiresAt > now) {
        // SessionData를 PaymentIntent로 변환 (필요한 필드만 있으면 됨)
        const mockIntent: PaymentIntent = {
          intentId: savedSession.intentId,
          userId: 'restored_user', // 복구시 기본값
          domain: savedSession.domain,
          domainId: savedSession.domainId,
          reservations: savedSession.reservations,
          status: 'RESERVED', // 복구시 기본 상태
          totalAmount: 0, // 복구시 기본값
          expiresAt: savedSession.expiresAt,
          createdAt: new Date().toISOString(), // 복구시 현재 시간
          correlationId: savedSession.correlationId,
          requestId: 'restored_request' // 복구시 기본값
        };
        startSession(mockIntent);
        return mockIntent;
      }
    }
    
    return null;
  }, [startSession, isExpired]);

  // 세션 상태 업데이트
  const updateSessionStatus = useCallback((status: PaymentIntent['status']) => {
    if (session) {
      const updatedSession = { ...session, status };
      setSession(updatedSession);
      
      // 완료/실패/취소 상태면 세션 종료
      if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(status)) {
        setIsActive(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    }
  }, [session]);

  // 컴포넌트 마운트 시 세션 복구 시도
  useEffect(() => {
    restoreSession();
    
    // 클린업
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // 만료 시 자동 처리
  useEffect(() => {
    if (isExpired && session && isActive) {
      // 예약 취소 API 호출
      checkoutService.cancelReservation(session.intentId).catch(console.error);
      
      // 세션 정리
      clearSession();
    }
  }, [isExpired, session, isActive, clearSession]);

  return {
    session,
    isExpired,
    remainingTime,
    isActive,
    startSession,
    clearSession,
    restoreSession,
    updateSessionStatus
  };
};

/**
 * 시간 포맷팅 유틸리티
 */
export const formatRemainingTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};
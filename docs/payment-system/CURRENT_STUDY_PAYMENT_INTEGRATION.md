# 현재 스터디 시스템에 결제 기능 통합 가이드

## 현재 상황 분석

### 기존 시스템 구조
```
- 스터디 목록: STUDY_LIST 상수 (하드코딩)
- 스터디 상태: recruiting, ongoing, closed
- 스터디 페이지: StudyPage.tsx (목록), StudyDetailPage.tsx (상세)
- 참가 기능: 미구현
- 결제: 없음 (무료)
```

### 핵심 요구사항
1. **최소한의 변경**으로 기존 스터디에 결제 기능 추가
2. **점진적 마이그레이션** - 일부 스터디만 유료화
3. **백엔드 API 준비 전**까지 프론트 MVP 구현

---

## 1. 데이터 모델 확장

### 1.1 StudyInfo 인터페이스 수정
```typescript
// src/constants/studies.ts 수정
export interface StudyInfo {
  // ... 기존 필드들
  
  // 결제 관련 필드 추가
  pricing?: {
    type: 'free' | 'paid' | 'freemium';
    amount?: number;           // 유료인 경우 금액
    earlyBirdDiscount?: {       // 조기 할인
      rate: number;             // 할인율 (0.2 = 20%)
      deadline: Date;
    };
    installment?: boolean;      // 할부 가능 여부
  };
  
  // 참가 관련 필드
  participants?: string[];      // 참가자 ID 목록 (임시)
  waitingList?: string[];      // 대기자 명단
}
```

### 1.2 스터디 데이터 업데이트
```typescript
export const STUDY_LIST: StudyInfo[] = [
  {
    id: 1,
    slug: 'tecoteco',
    name: '테코테코',
    // ... 기존 필드
    
    // 유료화 시작
    pricing: {
      type: 'paid',
      amount: 50000,
      earlyBirdDiscount: {
        rate: 0.2,
        deadline: new Date('2024-12-20')
      },
      installment: true
    }
  },
  {
    id: 2,
    slug: '11routine',
    name: '11루틴',
    // ... 기존 필드
    
    // 무료 유지
    pricing: {
      type: 'free'
    }
  }
  // ...
];
```

---

## 2. UI 컴포넌트 수정

### 2.1 StudyCard에 가격 표시
```typescript
// src/pages/StudyPage.tsx 수정
<div className="study-card">
  <div className="study-header">
    <h3>{study.name} <span className="generation">{study.generation}기</span></h3>
    <span className="status-badge recruiting">모집중</span>
  </div>
  <p className="study-tagline">{study.tagline}</p>
  
  {/* 가격 정보 추가 */}
  {study.pricing && (
    <div className="pricing-info">
      {study.pricing.type === 'free' ? (
        <span className="price-badge free">무료</span>
      ) : (
        <span className="price-badge paid">
          {study.pricing.earlyBirdDiscount && new Date() < study.pricing.earlyBirdDiscount.deadline ? (
            <>
              <span className="original-price">₩{study.pricing.amount?.toLocaleString()}</span>
              <span className="discounted-price">
                ₩{(study.pricing.amount! * (1 - study.pricing.earlyBirdDiscount.rate)).toLocaleString()}
              </span>
              <span className="discount-rate">-{study.pricing.earlyBirdDiscount.rate * 100}%</span>
            </>
          ) : (
            <span>₩{study.pricing.amount?.toLocaleString()}</span>
          )}
        </span>
      )}
    </div>
  )}
  
  <div className="study-meta">
    <span>📅 {study.schedule}</span>
    <span>👥 {study.enrolled}/{study.capacity}명</span>
  </div>
</div>
```

### 2.2 StudyDetailPage에 참가 신청 버튼 추가
```typescript
// src/pages/StudyDetailPage.tsx 전면 재작성
import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { getStudyByIdOrSlug } from '../constants/studies';
import PaymentModal from '../components/payment/PaymentModal';

const StudyDetailPage: React.FC = () => {
  const { studyIdentifier } = useParams();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  
  const study = getStudyByIdOrSlug(studyIdentifier!);
  if (!study) return <Navigate to="/study" replace />;
  
  // 임시: localStorage에서 참가 여부 확인
  React.useEffect(() => {
    const enrolledStudies = JSON.parse(localStorage.getItem('enrolledStudies') || '[]');
    setIsEnrolled(enrolledStudies.includes(study.id));
  }, [study.id]);
  
  const handleEnrollClick = () => {
    if (study.pricing?.type === 'free') {
      // 무료 스터디는 바로 참가
      enrollInStudy(study.id);
    } else {
      // 유료 스터디는 결제 모달 표시
      setShowPaymentModal(true);
    }
  };
  
  const enrollInStudy = (studyId: number) => {
    const enrolledStudies = JSON.parse(localStorage.getItem('enrolledStudies') || '[]');
    enrolledStudies.push(studyId);
    localStorage.setItem('enrolledStudies', JSON.stringify(enrolledStudies));
    setIsEnrolled(true);
    alert('참가 신청이 완료되었습니다!');
  };
  
  const calculatePrice = () => {
    if (!study.pricing || study.pricing.type === 'free') return 0;
    
    const basePrice = study.pricing.amount || 0;
    const discount = study.pricing.earlyBirdDiscount;
    
    if (discount && new Date() < discount.deadline) {
      return basePrice * (1 - discount.rate);
    }
    return basePrice;
  };
  
  return (
    <div className="study-detail-page">
      <main className="page-content">
        <div className="container">
          {/* 스터디 헤더 */}
          <section className="study-header-section">
            <div className="study-title-area">
              <h1>{study.name} <span className="generation">{study.generation}기</span></h1>
              <p className="tagline">{study.tagline}</p>
            </div>
            
            <div className="study-meta-info">
              <div className="meta-item">
                <span className="label">일정</span>
                <span className="value">{study.schedule} {study.duration}</span>
              </div>
              <div className="meta-item">
                <span className="label">리더</span>
                <span className="value">{study.leader.name}</span>
              </div>
              <div className="meta-item">
                <span className="label">정원</span>
                <span className="value">{study.enrolled}/{study.capacity}명</span>
              </div>
            </div>
          </section>
          
          {/* 참가 신청 섹션 */}
          <section className="enrollment-section">
            <div className="enrollment-card">
              <h3>참가 신청</h3>
              
              {/* 가격 정보 */}
              <div className="price-section">
                {study.pricing?.type === 'free' ? (
                  <div className="price-free">
                    <span className="label">참가비</span>
                    <span className="value">무료</span>
                  </div>
                ) : (
                  <div className="price-paid">
                    <span className="label">참가비</span>
                    <div className="price-display">
                      {study.pricing?.earlyBirdDiscount && new Date() < study.pricing.earlyBirdDiscount.deadline ? (
                        <>
                          <span className="original">₩{study.pricing.amount?.toLocaleString()}</span>
                          <span className="discounted">₩{calculatePrice().toLocaleString()}</span>
                          <span className="badge">얼리버드 -{study.pricing.earlyBirdDiscount.rate * 100}%</span>
                        </>
                      ) : (
                        <span className="regular">₩{study.pricing?.amount?.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* 신청 버튼 */}
              <div className="action-section">
                {isEnrolled ? (
                  <button className="btn-enrolled" disabled>
                    ✅ 참가 신청 완료
                  </button>
                ) : study.enrolled >= study.capacity ? (
                  <button className="btn-full" disabled>
                    🚫 정원 마감
                  </button>
                ) : study.status !== 'recruiting' ? (
                  <button className="btn-closed" disabled>
                    📚 모집 종료
                  </button>
                ) : (
                  <button className="btn-enroll" onClick={handleEnrollClick}>
                    {study.pricing?.type === 'free' ? '무료 참가 신청' : '참가 신청하기'}
                  </button>
                )}
              </div>
              
              {/* 추가 정보 */}
              <div className="additional-info">
                <p className="deadline">
                  모집 마감: {study.deadline.toLocaleDateString()}
                </p>
                {study.pricing?.installment && (
                  <p className="installment">💳 3개월 무이자 할부 가능</p>
                )}
              </div>
            </div>
          </section>
          
          {/* 스터디 상세 정보 */}
          <section className="study-details">
            <h2>스터디 소개</h2>
            <p>{study.description}</p>
            
            <h3>리더 인사말</h3>
            <blockquote>{study.leader.welcomeMessage}</blockquote>
            
            {study.recentTestimonial && (
              <>
                <h3>참가자 후기</h3>
                <div className="testimonial">
                  <p>"{study.recentTestimonial.content}"</p>
                  <span>- {study.recentTestimonial.author}</span>
                </div>
              </>
            )}
          </section>
        </div>
      </main>
      
      {/* 결제 모달 */}
      {showPaymentModal && study.pricing?.type === 'paid' && (
        <PaymentModal
          study={study}
          amount={calculatePrice()}
          onSuccess={() => {
            enrollInStudy(study.id);
            setShowPaymentModal(false);
          }}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
};
```

---

## 3. 결제 컴포넌트 구현

### 3.1 간단한 PaymentModal
```typescript
// src/components/payment/PaymentModal.tsx
import React, { useState } from 'react';
import { loadTossPayments } from '@tosspayments/payment-sdk';

interface PaymentModalProps {
  study: StudyInfo;
  amount: number;
  onSuccess: () => void;
  onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ 
  study, 
  amount, 
  onSuccess, 
  onClose 
}) => {
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handlePayment = async () => {
    if (!agreedToTerms) {
      alert('약관에 동의해주세요.');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // 토스페이먼츠 SDK 초기화
      const tossPayments = await loadTossPayments(
        process.env.REACT_APP_TOSS_CLIENT_KEY!
      );
      
      // 결제 요청
      await tossPayments.requestPayment(paymentMethod, {
        amount,
        orderId: `STUDY_${study.id}_${Date.now()}`,
        orderName: `${study.name} ${study.generation}기 참가비`,
        customerName: '테스트유저', // 실제로는 로그인한 사용자 정보
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
      
      // 성공 시 콜백
      onSuccess();
    } catch (error) {
      console.error('Payment failed:', error);
      alert('결제 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>결제하기</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body">
          {/* 주문 정보 */}
          <div className="order-info">
            <h3>주문 내역</h3>
            <div className="order-item">
              <span className="item-name">{study.name} {study.generation}기</span>
              <span className="item-price">₩{amount.toLocaleString()}</span>
            </div>
          </div>
          
          {/* 결제 수단 */}
          <div className="payment-methods">
            <h3>결제 수단</h3>
            <label>
              <input 
                type="radio" 
                value="CARD" 
                checked={paymentMethod === 'CARD'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              신용/체크카드
            </label>
            <label>
              <input 
                type="radio" 
                value="TRANSFER" 
                checked={paymentMethod === 'TRANSFER'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              계좌이체
            </label>
            <label>
              <input 
                type="radio" 
                value="VIRTUAL_ACCOUNT" 
                checked={paymentMethod === 'VIRTUAL_ACCOUNT'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              가상계좌
            </label>
          </div>
          
          {/* 약관 동의 */}
          <div className="terms-agreement">
            <label>
              <input 
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
              />
              결제 약관 및 환불 정책에 동의합니다
            </label>
          </div>
        </div>
        
        <div className="modal-footer">
          <button 
            className="btn-cancel" 
            onClick={onClose}
            disabled={isProcessing}
          >
            취소
          </button>
          <button 
            className="btn-pay" 
            onClick={handlePayment}
            disabled={!agreedToTerms || isProcessing}
          >
            {isProcessing ? '처리중...' : `₩${amount.toLocaleString()} 결제하기`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
```

---

## 4. 결제 성공/실패 처리

### 4.1 결제 성공 페이지
```typescript
// src/pages/payment/PaymentSuccessPage.tsx
import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    // URL 파라미터에서 결제 정보 추출
    const orderId = searchParams.get('orderId');
    const paymentKey = searchParams.get('paymentKey');
    const amount = searchParams.get('amount');
    
    // 백엔드가 없으므로 localStorage에 저장
    const payment = {
      orderId,
      paymentKey,
      amount,
      status: 'completed',
      paidAt: new Date().toISOString()
    };
    
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    payments.push(payment);
    localStorage.setItem('payments', JSON.stringify(payments));
    
    // 스터디 ID 파싱 (orderId: STUDY_1_timestamp)
    const studyId = orderId?.split('_')[1];
    if (studyId) {
      const enrolledStudies = JSON.parse(localStorage.getItem('enrolledStudies') || '[]');
      if (!enrolledStudies.includes(parseInt(studyId))) {
        enrolledStudies.push(parseInt(studyId));
        localStorage.setItem('enrolledStudies', JSON.stringify(enrolledStudies));
      }
    }
  }, [searchParams]);
  
  return (
    <div className="payment-success-page">
      <div className="container">
        <div className="success-content">
          <div className="success-icon">✅</div>
          <h1>결제가 완료되었습니다!</h1>
          <p>스터디 참가 신청이 정상적으로 처리되었습니다.</p>
          
          <div className="payment-info">
            <dl>
              <dt>주문번호</dt>
              <dd>{searchParams.get('orderId')}</dd>
              <dt>결제금액</dt>
              <dd>₩{parseInt(searchParams.get('amount') || '0').toLocaleString()}</dd>
            </dl>
          </div>
          
          <div className="actions">
            <button onClick={() => navigate('/my/studies')}>
              내 스터디 보기
            </button>
            <button onClick={() => navigate('/study')}>
              다른 스터디 둘러보기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## 5. 마이페이지 - 내 스터디 관리

### 5.1 내 스터디 목록
```typescript
// src/pages/my/MyStudiesPage.tsx
import React, { useState, useEffect } from 'react';
import { STUDY_LIST } from '../../constants/studies';

const MyStudiesPage: React.FC = () => {
  const [enrolledStudies, setEnrolledStudies] = useState<StudyInfo[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  
  useEffect(() => {
    // localStorage에서 참가한 스터디 목록 가져오기
    const enrolledIds = JSON.parse(localStorage.getItem('enrolledStudies') || '[]');
    const enrolled = STUDY_LIST.filter(study => enrolledIds.includes(study.id));
    setEnrolledStudies(enrolled);
    
    // 결제 내역 가져오기
    const paymentHistory = JSON.parse(localStorage.getItem('payments') || '[]');
    setPayments(paymentHistory);
  }, []);
  
  return (
    <div className="my-studies-page">
      <div className="container">
        <h1>내 스터디</h1>
        
        <section className="enrolled-studies">
          <h2>참가 중인 스터디</h2>
          {enrolledStudies.length === 0 ? (
            <p>아직 참가한 스터디가 없습니다.</p>
          ) : (
            <div className="study-list">
              {enrolledStudies.map(study => (
                <div key={study.id} className="study-item">
                  <h3>{study.name} {study.generation}기</h3>
                  <p>{study.tagline}</p>
                  <div className="study-info">
                    <span>📅 {study.schedule}</span>
                    <span>👤 {study.leader.name}</span>
                    <span className={`status ${study.status}`}>
                      {study.status === 'ongoing' ? '진행중' : 
                       study.status === 'recruiting' ? '모집중' : '종료'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        
        <section className="payment-history">
          <h2>결제 내역</h2>
          {payments.length === 0 ? (
            <p>결제 내역이 없습니다.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>주문번호</th>
                  <th>금액</th>
                  <th>상태</th>
                  <th>결제일</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment, index) => (
                  <tr key={index}>
                    <td>{payment.orderId}</td>
                    <td>₩{parseInt(payment.amount).toLocaleString()}</td>
                    <td>{payment.status === 'completed' ? '완료' : '처리중'}</td>
                    <td>{new Date(payment.paidAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
};
```

---

## 6. 환경 변수 설정

### 6.1 .env 파일 추가
```bash
# .env
REACT_APP_TOSS_CLIENT_KEY=test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq
REACT_APP_API_URL=http://localhost:8080/api
```

### 6.2 package.json 의존성 추가
```json
{
  "dependencies": {
    "@tosspayments/payment-sdk": "^1.8.0"
  }
}
```

---

## 7. 단계별 구현 계획

### Phase 1: MVP (1주)
✅ 프론트엔드 전용 구현 (localStorage 사용)
- [ ] StudyInfo에 pricing 필드 추가
- [ ] StudyDetailPage에 참가 신청 버튼
- [ ] PaymentModal 컴포넌트
- [ ] 토스페이먼츠 테스트 결제
- [ ] 결제 성공/실패 페이지

### Phase 2: 백엔드 연동 (2주)
🔄 실제 API 연동
- [ ] 스터디 API 연동
- [ ] 결제 API 연동
- [ ] 사용자 인증 연동
- [ ] 참가 내역 DB 저장

### Phase 3: 고도화 (3주)
🚀 추가 기능
- [ ] 환불 기능
- [ ] 영수증 발급
- [ ] 정산 시스템
- [ ] 관리자 대시보드

---

## 8. 핵심 포인트

### 💡 MVP 전략
1. **localStorage 활용**: 백엔드 없이도 동작하는 프로토타입
2. **점진적 유료화**: 일부 스터디만 먼저 유료 전환
3. **간단한 플로우**: 복잡한 기능 없이 핵심만 구현

### 🎯 중요한 것
- **기존 시스템 호환성**: 현재 코드 최소 수정
- **사용자 경험**: 간단하고 직관적인 결제 플로우
- **안전성**: 토스페이먼츠 SDK로 안전한 결제

### ⚠️ 주의사항
- 실제 결제는 백엔드 API 필수
- PCI DSS 준수 (카드 정보 저장 금지)
- 환불 정책 명확히 표시

---

*작성일: 2025년 8월 7일*  
*작성자: AsyncSite Development Team*  
*문서 버전: 2.0*
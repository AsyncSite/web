import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLoginRedirect } from '../hooks/useLoginRedirect';
import studyService, { Study, ApplicationRequest } from '../api/studyService';
import { getStudyDisplayInfo } from '../utils/studyStatusUtils';
import Modal from '../components/common/Modal/Modal';
import PaymentMethodSelector from '../components/UnifiedCheckout/PaymentMethodSelector';
import type { CheckoutPaymentMethod } from '../types/checkout';
import './StudyApplicationPage.css';


const StudyApplicationPage: React.FC = () => {
  const navigate = useNavigate();
  const { studyId } = useParams<{ studyId: string }>();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { redirectToLogin } = useLoginRedirect();
  const [study, setStudy] = useState<Study | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isPaidStudy, setIsPaidStudy] = useState(false);
  const [studyPrice, setStudyPrice] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<CheckoutPaymentMethod | null>(null);
  const [modalConfig, setModalConfig] = useState<{
    title?: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    onConfirm?: () => void;
  }>({
    message: '',
    type: 'info'
  });
  
  // Application form state
  const [answers, setAnswers] = useState<Record<string, string>>({
    motivation: '',
    experience: '',
    availability: '',
    expectations: '',
    commitment: ''
  });

  useEffect(() => {
    const fetchStudy = async () => {
      if (!studyId) {
        navigate('/study');
        return;
      }

      // Check authentication first
      if (!authLoading && !isAuthenticated) {
        setModalConfig({
          title: '로그인 필요',
          message: '스터디 참가 신청을 위해서는 로그인이 필요합니다.',
          type: 'info',
          onConfirm: () => {
            redirectToLogin(`/study/${studyId}/apply`);
          }
        });
        setShowModal(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const studyData = await studyService.getStudyById(studyId);
        
        if (!studyData) {
          alert('존재하지 않는 스터디입니다.');
          navigate('/study');
          return;
        }

        const displayInfo = getStudyDisplayInfo(
          studyData.status,
          studyData.deadline?.toISOString(),
          studyData.startDate instanceof Date ? studyData.startDate.toISOString() : studyData.startDate,
          studyData.endDate instanceof Date ? studyData.endDate.toISOString() : studyData.endDate,
          studyData.capacity,
          studyData.enrolled,
          studyData.isRecruiting
        );

        if (!displayInfo.canApply) {
          alert('현재 모집 중이지 않은 스터디입니다.');
          navigate('/study');
          return;
        }

        setStudy(studyData);
        
        // 유료 스터디 여부 확인 (PAID, FREE_WITH_VENUE 모두 유료로 처리)
        const isPaid = studyData.costType === 'PAID' || studyData.costType === 'FREE_WITH_VENUE';
        setIsPaidStudy(isPaid);
        
        // 실제 스터디 가격 설정
        if (isPaid && studyData.cost) {
          setStudyPrice(studyData.cost);
        } else if (isPaid) {
          // 가격 정보가 없는 경우 에러 처리
          console.error('유료 스터디인데 가격 정보가 없습니다:', studyData);
          alert('스터디 가격 정보를 확인할 수 없습니다.\n관리자에게 문의해주세요.');
          navigate('/study');
          return;
        }
      } catch (error) {
        console.error('스터디 정보 로딩 실패:', error);
        alert('스터디 정보를 불러올 수 없습니다.');
        navigate('/study');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchStudy();
    }
  }, [studyId, navigate, authLoading, isAuthenticated]);

  const handleInputChange = (key: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleStudyApplicationValidate = () => {
    // Skip check during auth loading
    if (authLoading) {
      return true;
    }

    // Check for user after loading is complete
    if (!user) {
      alert('스터디 참여 신청을 위해서는 로그인이 필요합니다.');
      navigate('/login', { state: { from: `/study/${studyId}/apply` } });
      return true;
    }

    if (!studyId) {
      return true;
    }

    // Validation
    const requiredFields = ['motivation', 'experience', 'availability'];
    const missingFields = requiredFields.filter(field => !answers[field]?.trim());

    if (missingFields.length > 0) {
      alert('필수 항목을 모두 입력해주세요.');
      return true;
    }

    // 유료 스터디인 경우 결제 수단 필수
    if (isPaidStudy && !selectedPaymentMethod) {
      alert('결제 수단을 선택해주세요.');
      return true;
    }

    return false;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // validation
    if(handleStudyApplicationValidate()) return;

    // 유료 스터디: 결제 먼저 → 결제 성공 시 신청 저장
    // 무료 스터디: 바로 신청 저장
    if (isPaidStudy && studyPrice > 0 && selectedPaymentMethod) {
      await processPaymentFirst();
    } else {
      await submitFreeApplication();
    }
  };

  // 무료 스터디 신청 (기존 플로우)
  const submitFreeApplication = async () => {
    if (!user || !studyId || !study) {
      return;
    }
    setIsSubmitting(true);

    try {
      const applicationRequest: ApplicationRequest = {
        applicantId: user.email,
        answers: Object.fromEntries(
          Object.entries(answers).filter(([_, value]) => value.trim())
        )
      };

      await studyService.applyToStudy(studyId, applicationRequest);

      setModalConfig({
        title: '신청 완료',
        message: '스터디 참여 신청이 완료되었습니다!\n스터디 호스트가 검토 후 연락드릴 예정입니다.',
        type: 'success',
        onConfirm: () => navigate(`/study/${study?.slug || studyId}`)
      });
      setShowModal(true);
    } catch (error: any) {
      console.error('스터디 신청 실패:', error);

      if (error.response?.status === 409) {
        setModalConfig({
          title: '중복 신청',
          message: '이미 이 스터디에 참가 신청을 하셨습니다.\n마이페이지에서 신청 상태를 확인해주세요.',
          type: 'warning',
          onConfirm: () => navigate(`/users/me`)
        });
        setShowModal(true);
        return;
      }

      const errorMessage = error.response?.data?.message || '스터디 신청 중 오류가 발생했습니다.\n다시 시도해주세요.';
      setModalConfig({
        title: '오류',
        message: errorMessage,
        type: 'error'
      });
      setShowModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 유료 스터디: 결제 먼저 처리 후 신청 저장
  const processPaymentFirst = async () => {
    if (!user || !studyId || !study || !selectedPaymentMethod) {
      return;
    }
    setIsSubmitting(true);

    try {
      // 1. 임시 신청 생성 (결제 연동을 위해 필요)
      const applicationRequest: ApplicationRequest = {
        applicantId: user.email,
        answers: Object.fromEntries(
          Object.entries(answers).filter(([_, value]) => value.trim())
        )
      };

      const applicationResponse = await studyService.applyToStudy(studyId, applicationRequest);
      const applicationId = applicationResponse.id;

      // 2. 결제 생성
      const paymentResponse = await studyService.createPayment(study.id, applicationId, {
        paymentMethod: selectedPaymentMethod
      });

      // 3. 계좌이체인 경우 계좌 정보 페이지로 이동 (결제 완료 후 백엔드에서 신청 확정)
      if (paymentResponse.portOneSdkPayload?.payMethod === 'ACCOUNT_TRANSFER' ||
          selectedPaymentMethod === 'ACCOUNT_TRANSFER') {
        const paymentSessionData = {
          intentId: paymentResponse.checkoutId,
          studyId: study.id,
          applicationId: applicationId,
          studyName: study.name,
          amount: studyPrice,
          userName: user?.name || ''
        };
        sessionStorage.setItem('currentPaymentSession', JSON.stringify(paymentSessionData));

        window.location.href = `/payment/account-info?intentId=${paymentResponse.checkoutId}`;
        return;
      }

      // 4. SDK 모드인 경우 PortOne SDK 호출 (이니시스 카드결제)
      if (paymentResponse.invocationType === 'SDK' && paymentResponse.portOneSdkPayload) {
        const portOneModule = await import('@portone/browser-sdk/v2');
        const PortOne = portOneModule.default;

        const sdkResponse = await PortOne.requestPayment({
          storeId: paymentResponse.portOneSdkPayload.storeId,
          channelKey: paymentResponse.portOneSdkPayload.channelKey,
          paymentId: paymentResponse.portOneSdkPayload.paymentId,
          orderName: paymentResponse.portOneSdkPayload.orderName,
          totalAmount: paymentResponse.portOneSdkPayload.totalAmount,
          currency: paymentResponse.portOneSdkPayload.currency as any,
          payMethod: paymentResponse.portOneSdkPayload.payMethod as any,
          customer: {
            fullName: paymentResponse.portOneSdkPayload.customer.fullName,
            email: paymentResponse.portOneSdkPayload.customer.email,
            phoneNumber: paymentResponse.portOneSdkPayload.customer.phoneNumber
          },
          redirectUrl: paymentResponse.portOneSdkPayload.redirectUrl,
          noticeUrls: paymentResponse.portOneSdkPayload.noticeUrls,
          customData: paymentResponse.portOneSdkPayload.customData
        });

        // SDK 응답 처리
        if (sdkResponse && sdkResponse.code) {
          // 결제 실패 or 취소 → 신청 취소 처리
          try {
            await studyService.cancelApplication(studyId, applicationId, user.email);
          } catch (cancelError) {
            console.error('신청 취소 실패:', cancelError);
          }

          setModalConfig({
            title: '결제 취소',
            message: sdkResponse.message || '결제가 취소되었습니다.\n다시 시도해주세요.',
            type: 'warning'
          });
          setShowModal(true);
        } else {
          // 결제 성공 → 리더 승인 대기 상태로 전환
          setModalConfig({
            title: '결제 완료',
            message: '결제가 완료되었습니다!\n스터디 리더의 승인 후 참여가 확정됩니다.\n마이페이지에서 신청 상태를 확인할 수 있습니다.',
            type: 'success',
            onConfirm: () => navigate(`/users/me`)
          });
          setShowModal(true);
        }
        return;
      }

      // 5. URL 모드인 경우 리다이렉트
      if (paymentResponse.checkoutUrl) {
        window.location.href = paymentResponse.checkoutUrl;
        return;
      }

      throw new Error('Invalid payment response: missing SDK payload or checkout URL');
    } catch (error: any) {
      console.error('결제 처리 실패:', error);

      // 중복 신청 체크 (409 Conflict)
      if (error.response?.status === 409) {
        setModalConfig({
          title: '중복 신청',
          message: '이미 이 스터디에 참가 신청을 하셨습니다.\n마이페이지에서 신청 상태를 확인해주세요.',
          type: 'warning',
          onConfirm: () => navigate(`/users/me`)
        });
        setShowModal(true);
        return;
      }

      const errorMessage = error.response?.data?.message || '결제 처리 중 오류가 발생했습니다.\n다시 시도해주세요.';
      setModalConfig({
        title: '오류',
        message: errorMessage,
        type: 'error'
      });
      setShowModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="study-application-page">
        <div className="loading-state">
          <div className="loading-spinner">⏳</div>
          <p>스터디 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 로그인 확인 모달을 보여주기 위해 study가 없어도 렌더링
  if (!study && !showModal) {
    return (
      <div className="study-application-page">
        <div className="loading-state">
          <p>스터디 정보를 확인하고 있습니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="study-application-page">
      {study ? (
      <div className="application-container">
        <div className="application-header">
          <button 
            onClick={() => navigate('/study')} 
            className="back-button"
          >
            ← 돌아가기
          </button>
          <h1>스터디 참여 신청</h1>
          <div className="study-info">
            <h2>{study.name} {study.generation > 1 && `${study.generation}기`}</h2>
            <p className="study-tagline">{study.tagline}</p>
            <div className="study-details">
              {study.schedule && <span>📅 {study.schedule}</span>}
              {study.duration && <span>⏱️ {study.duration}</span>}
              {study.capacity && study.capacity > 0 && (
                <span>👥 {study.enrolled}/{study.capacity}명</span>
              )}
              {isPaidStudy && (
                <span className="price-info">💰 {studyPrice.toLocaleString()}원</span>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="application-form">
          <div className="form-section">
            <h3>지원서 작성</h3>
            <p className="section-description">
              스터디 참여에 대한 의지와 목표를 알려주세요. 성실하게 작성해주신 지원서를 바탕으로 스터디 호스트가 검토합니다.
            </p>

            <div className="form-group">
              <label htmlFor="motivation">참여 동기 *</label>
              <textarea
                id="motivation"
                name="motivation"
                value={answers.motivation}
                onChange={(e) => handleInputChange('motivation', e.target.value)}
                placeholder="이 스터디에 참여하고 싶은 이유를 알려주세요."
                required
                rows={4}
                maxLength={500}
              />
              <span className="char-count">{answers.motivation.length}/500</span>
            </div>

            <div className="form-group">
              <label htmlFor="experience">관련 경험 *</label>
              <textarea
                id="experience"
                name="experience"
                value={answers.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                placeholder="스터디 주제와 관련된 경험이나 배경지식을 알려주세요."
                required
                rows={4}
                maxLength={500}
              />
              <span className="char-count">{answers.experience.length}/500</span>
            </div>

            <div className="form-group">
              <label htmlFor="availability">참여 가능 시간 *</label>
              <textarea
                id="availability"
                name="availability"
                value={answers.availability}
                onChange={(e) => handleInputChange('availability', e.target.value)}
                placeholder="스터디 일정에 참여 가능한 요일과 시간대를 알려주세요."
                required
                rows={3}
                maxLength={300}
              />
              <span className="char-count">{answers.availability.length}/300</span>
            </div>

            <div className="form-group">
              <label htmlFor="expectations">기대하는 점</label>
              <textarea
                id="expectations"
                name="expectations"
                value={answers.expectations}
                onChange={(e) => handleInputChange('expectations', e.target.value)}
                placeholder="이 스터디를 통해 얻고 싶은 것이나 기대하는 것을 알려주세요."
                rows={3}
                maxLength={300}
              />
              <span className="char-count">{answers.expectations.length}/300</span>
            </div>

            <div className="form-group">
              <label htmlFor="commitment">각오 한마디</label>
              <textarea
                id="commitment"
                name="commitment"
                value={answers.commitment}
                onChange={(e) => handleInputChange('commitment', e.target.value)}
                placeholder="스터디 참여에 대한 각오나 다짐을 한마디로 표현해주세요."
                rows={2}
                maxLength={200}
              />
              <span className="char-count">{answers.commitment.length}/200</span>
            </div>
          </div>

          {/* 유료 스터디인 경우 결제 수단 선택 */}
          {isPaidStudy && (
            <div className="form-section payment-method-section">
              <PaymentMethodSelector
                selectedMethod={selectedPaymentMethod}
                onMethodSelect={setSelectedPaymentMethod}
                disabled={isSubmitting}
              />
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/study')}
              className="cancel-button"
            >
              취소
            </button>

            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? '처리 중...' : isPaidStudy ? `신청 및 결제하기 (${studyPrice.toLocaleString()}원)` : '참여 신청하기'}
            </button>
          </div>
        </form>

        <div className="application-info">
          <h3>📋 신청 프로세스</h3>
          {isPaidStudy ? (
            <ol>
              <li>지원서를 작성하여 제출합니다.</li>
              <li><strong>결제 페이지로 이동하여 {studyPrice.toLocaleString()}원을 결제합니다.</strong></li>
              <li>결제 완료 후 스터디 리더가 신청을 검토합니다.</li>
              <li>승인되면 스터디 멤버로 등록되고 이메일로 안내받습니다.</li>
              <li>스터디 시작일에 맞춰 활동을 시작합니다.</li>
            </ol>
          ) : (
            <ol>
              <li>지원서를 작성하여 제출합니다.</li>
              <li>스터디 호스트가 지원서를 검토합니다. (1-3일 소요)</li>
              <li>승인되면 이메일로 안내를 받습니다.</li>
              <li>스터디 멤버로 활동을 시작합니다.</li>
            </ol>
          )}
          <p className="info-note">
            {isPaidStudy
              ? '* 결제 후 환불 정책은 스터디 상세 페이지를 확인해주세요.'
              : '* 지원서는 스터디 호스트에게만 공개되며, 성실하게 작성해주시면 선발에 도움이 됩니다.'
            }
          </p>
        </div>
      </div>
      ) : (
        <div className="loading-state">
          <p>로그인 확인 중...</p>
        </div>
      )}
      
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          if (modalConfig.onConfirm && modalConfig.type === 'success') {
            modalConfig.onConfirm();
          }
        }}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        confirmText="확인"
        cancelText="취소"
        showCancel={modalConfig.type === 'info' && !!modalConfig.onConfirm}
        onConfirm={modalConfig.onConfirm}
      />
    </div>
  );
};

export default StudyApplicationPage;
import React, { useState } from 'react';
import { JobItemResponse } from '../../../api/jobNavigatorService';
import jobNavigatorService from '../../../api/jobNavigatorService';
import './SuggestionModal.css';

export type SuggestionType = 'DATA_ERROR' | 'JOB_CLOSED' | 'ADD_COMPANY' | 'OTHER';

interface SuggestionModalProps {
  job?: JobItemResponse;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const SuggestionModal: React.FC<SuggestionModalProps> = ({ job, isOpen, onClose, onSuccess }) => {
  // job이 없으면 OTHER 타입을 기본값으로
  const [type, setType] = useState<SuggestionType>(job ? 'DATA_ERROR' : 'OTHER');
  const [content, setContent] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allSuggestionTypes = [
    { value: 'DATA_ERROR', label: '데이터 오류 신고', description: '잘못된 정보가 있어요', requiresJob: true },
    { value: 'JOB_CLOSED', label: '마감된 공고', description: '이미 마감된 공고예요', requiresJob: true },
    { value: 'ADD_COMPANY', label: '회사 추가 요청', description: '이 회사도 추가해주세요', requiresJob: false },
    { value: 'OTHER', label: '기타 제안', description: '다른 개선사항이 있어요', requiresJob: false }
  ];

  // job이 있으면 모든 타입, 없으면 requiresJob이 false인 타입만 표시
  const suggestionTypeOptions = job 
    ? allSuggestionTypes 
    : allSuggestionTypes.filter(option => !option.requiresJob);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('제안 내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        type,
        jobPostingId: job?.id || null,
        userEmail: userEmail.trim() || null,
        content: content.trim()
      };

      await jobNavigatorService.createSuggestion(payload);
      
      // 성공 시 초기화
      setContent('');
      setUserEmail('');
      setType('DATA_ERROR');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || '제안을 전송하는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="suggestion-modal-overlay" onClick={onClose}>
      <div className="suggestion-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="suggestion-modal-header">
          <h2>제안하기</h2>
          <button className="suggestion-modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="suggestion-modal-body">
            {job && (
              <div className="suggestion-context">
                <div className="suggestion-context-label">제안 대상</div>
                <div className="suggestion-context-content">
                  <strong>{job.company}</strong> - {job.title}
                </div>
              </div>
            )}

            <div className="suggestion-form-group">
              <label className="suggestion-form-label">제안 유형</label>
              <div className="suggestion-type-options">
                {suggestionTypeOptions.map(option => (
                  <div
                    key={option.value}
                    className={`suggestion-type-option ${type === option.value ? 'selected' : ''}`}
                    onClick={() => setType(option.value as SuggestionType)}
                  >
                    <div className="suggestion-type-title">{option.label}</div>
                    <div className="suggestion-type-desc">{option.description}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="suggestion-form-group">
              <label className="suggestion-form-label" htmlFor="suggestion-content">
                제안 내용 <span className="required">*</span>
              </label>
              <textarea
                id="suggestion-content"
                className="suggestion-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="어떤 문제가 있나요? 자세히 설명해주세요."
                rows={5}
                maxLength={2000}
              />
              <div className="suggestion-char-count">{content.length} / 2000</div>
            </div>

            <div className="suggestion-form-group">
              <label className="suggestion-form-label" htmlFor="suggestion-email">
                이메일 <span className="optional">(선택)</span>
              </label>
              <input
                id="suggestion-email"
                type="email"
                className="suggestion-input"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="답변을 받으실 이메일 주소"
              />
              <div className="suggestion-email-hint">
                답변이 필요한 경우 이메일을 남겨주세요.
              </div>
            </div>

            {error && (
              <div className="suggestion-error">
                {error}
              </div>
            )}
          </div>

          <div className="suggestion-modal-footer">
            <button 
              type="button" 
              className="suggestion-btn secondary" 
              onClick={onClose}
              disabled={loading}
            >
              취소
            </button>
            <button 
              type="submit" 
              className="suggestion-btn primary" 
              disabled={loading || !content.trim()}
            >
              {loading ? '제출 중...' : '제안하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuggestionModal;
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import resumeService from '../../api/resumeService';
import type { ResumeRequestResponse, ResumeResponse } from '../../api/resumeService';
import styles from './ResumeResultPage.module.css';

const RESUME_REQUEST_STATUS_LABELS: Record<string, string> = {
  PENDING: '검토 대기',
  IN_PROGRESS: '첨삭 진행중',
  COMPLETED: '첨삭 완료',
  CANCELLED: '취소됨',
};

const RESUME_REQUEST_STATUS_CLASS: Record<string, string> = {
  PENDING: styles['resume-request-status-pending'],
  IN_PROGRESS: styles['resume-request-status-in-progress'],
  COMPLETED: styles['resume-request-status-completed'],
  CANCELLED: styles['resume-request-status-cancelled'],
};

function formatResumeResultDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatResumeFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function ResumeResultPage(): React.ReactNode {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [resumeRequests, setResumeRequests] = useState<ResumeRequestResponse[]>([]);
  const [resumesByRequestId, setResumesByRequestId] = useState<Record<number, ResumeResponse[]>>({});
  const [isResumeRequestsLoading, setIsResumeRequestsLoading] = useState(false);
  const [resumeRequestsError, setResumeRequestsError] = useState<string | null>(null);
  const [expandedRequestIds, setExpandedRequestIds] = useState<Set<number>>(new Set());

  const fetchResumeRequests = useCallback(async () => {
    if (!user?.email) return;
    setIsResumeRequestsLoading(true);
    setResumeRequestsError(null);
    try {
      const data = await resumeService.getMyResumeRequests(user.email);
      setResumeRequests(data);
    } catch {
      setResumeRequestsError('이력서 요청 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsResumeRequestsLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (!isAuthLoading && user?.email) {
      fetchResumeRequests();
    }
  }, [isAuthLoading, user?.email, fetchResumeRequests]);

  const handleToggleResumes = async (requestId: number) => {
    const newExpanded = new Set(expandedRequestIds);
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId);
      setExpandedRequestIds(newExpanded);
      return;
    }

    newExpanded.add(requestId);
    setExpandedRequestIds(newExpanded);

    if (!resumesByRequestId[requestId]) {
      try {
        const resumes = await resumeService.getResumesByRequestId(requestId);
        setResumesByRequestId((prev) => ({ ...prev, [requestId]: resumes }));
      } catch {
        setResumesByRequestId((prev) => ({ ...prev, [requestId]: [] }));
      }
    }
  };

  const handleDownloadResume = (resumeId: number) => {
    const url = resumeService.getResumeDownloadUrl(resumeId);
    window.open(url, '_blank');
  };

  if (isAuthLoading) {
    return (
      <div className={styles['resume-result-container']}>
        <div className={styles['resume-result-loading']}>로딩 중...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles['resume-result-container']}>
        <div className={styles['resume-result-error']}>로그인이 필요합니다.</div>
      </div>
    );
  }

  return (
    <div className={styles['resume-result-container']}>
      <h1 className={styles['resume-result-title']}>이력서 첨삭 결과</h1>
      <p className={styles['resume-result-subtitle']}>
        요청하신 이력서 첨삭 결과를 확인하고 다운로드할 수 있습니다.
      </p>

      {isResumeRequestsLoading && (
        <div className={styles['resume-result-loading']}>이력서 요청을 불러오는 중...</div>
      )}

      {resumeRequestsError && (
        <div className={styles['resume-result-error']}>{resumeRequestsError}</div>
      )}

      {!isResumeRequestsLoading && !resumeRequestsError && resumeRequests.length === 0 && (
        <div className={styles['resume-result-empty']}>
          <div className={styles['resume-result-empty-icon']}>📄</div>
          <div className={styles['resume-result-empty-text']}>
            아직 이력서 첨삭 요청이 없습니다
          </div>
          <div className={styles['resume-result-empty-desc']}>
            이력서 첨삭을 요청하시면 여기에서 결과를 확인할 수 있습니다.
          </div>
        </div>
      )}

      {!isResumeRequestsLoading && resumeRequests.length > 0 && (
        <div className={styles['resume-request-list']}>
          {resumeRequests.map((request) => (
            <div key={request.id} className={styles['resume-request-card']}>
              <div className={styles['resume-request-card-header']}>
                <span className={styles['resume-request-card-name']}>
                  {request.userName} 님의 이력서
                </span>
                <span
                  className={`${styles['resume-request-status-badge']} ${RESUME_REQUEST_STATUS_CLASS[request.status] || ''}`}
                >
                  {RESUME_REQUEST_STATUS_LABELS[request.status] || request.status}
                </span>
              </div>
              <div className={styles['resume-request-card-date']}>
                요청일: {formatResumeResultDate(request.createdAt)}
              </div>

              {request.status === 'COMPLETED' && (
                <div className={styles['resume-download-section']}>
                  <button
                    className={styles['resume-download-button']}
                    onClick={() => handleToggleResumes(request.id)}
                  >
                    {expandedRequestIds.has(request.id) ? '접기' : '첨삭 결과 보기'}
                  </button>

                  {expandedRequestIds.has(request.id) && (
                    <div className={styles['resume-file-list']}>
                      {resumesByRequestId[request.id] === undefined && (
                        <div className={styles['resume-result-loading']}>로딩 중...</div>
                      )}
                      {resumesByRequestId[request.id]?.length === 0 && (
                        <div className={styles['resume-file-meta']}>
                          아직 생성된 이력서가 없습니다.
                        </div>
                      )}
                      {resumesByRequestId[request.id]?.map((resume) => (
                        <div key={resume.id} className={styles['resume-file-item']}>
                          <div className={styles['resume-file-info']}>
                            <span className={styles['resume-file-title']}>{resume.title}</span>
                            <span className={styles['resume-file-meta']}>
                              {formatResumeFileSize(resume.fileSizeBytes)} ·{' '}
                              {formatResumeResultDate(resume.createdAt)}
                            </span>
                          </div>
                          {resume.pdfUrl && (
                            <button
                              className={styles['resume-file-download-link']}
                              onClick={() => handleDownloadResume(resume.id)}
                            >
                              다운로드
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ResumeResultPage;

import React, { useEffect, useState } from 'react';
import jobNavigatorService, { JobItemResponse } from '../../../api/jobNavigatorService';
import ShareButton from './ShareButton';
import SuggestionModal from './SuggestionModal';
import './JobDetailModal.css';

interface JobDetailModalProps {
  jobId: number | null;
  onClose: () => void;
}

const JobDetailModal: React.FC<JobDetailModalProps> = ({ jobId, onClose }) => {
  const [job, setJob] = useState<JobItemResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);

  useEffect(() => {
    if (jobId === null) {
      setJob(null);
      return;
    }

    const fetchJobDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const jobData = await jobNavigatorService.getJobDetail(jobId);
        setJob(jobData);
      } catch (err) {
        setError('채용공고를 불러오는데 실패했습니다.');
        console.error('Failed to fetch job detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetail();
  }, [jobId]);

  if (!jobId) return null;

  return (
    <div className="ignition-nav-modal-overlay" onClick={onClose}>
      <div className="ignition-nav-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="ignition-nav-modal-close" onClick={onClose}>×</button>
        
        {loading && (
          <div className="ignition-nav-modal-loading">
            <div className="ignition-nav-spinner"></div>
            <p>채용공고를 불러오는 중...</p>
          </div>
        )}

        {error && (
          <div className="ignition-nav-modal-error">
            <p>{error}</p>
          </div>
        )}

        {job && !loading && (
          <>
            <div className="ignition-nav-modal-header">
              <div className="ignition-nav-modal-company">
                <div className="ignition-nav-company-logo">{job.companyLogo}</div>
                <div>
                  <h3 className="ignition-nav-company-name">{job.company}</h3>
                  <p className="ignition-nav-job-location">📍 {job.location}</p>
                </div>
              </div>
              {/* 매칭 점수 임시 비활성화 - 서버 측 개인화 구현 후 활성화 예정 */}
              {/* <div className="ignition-nav-match-score">{job.matchScore}% 매칭</div> */}
            </div>

            <div className="ignition-nav-modal-body">
              <h2 className="ignition-nav-job-modal-title">{job.title}</h2>
              
              <div className="ignition-nav-job-meta-info">
                <span>🏢 {job.experience}</span>
                <span>📅 마감: {job.deadline}</span>
                {job.postedAt && <span>🕐 공고 일자: {job.postedAt}</span>}
              </div>

              <div className="ignition-nav-modal-section">
                <h3>업무 소개</h3>
                <p className="ignition-nav-job-modal-description">{job.description}</p>
              </div>

              <div className="ignition-nav-modal-section">
                <h3>요구 기술</h3>
                <div className="ignition-nav-modal-skills">
                  {job.skills.map((skill, index) => (
                    <span key={index} className="ignition-nav-skill-tag">{skill}</span>
                  ))}
                </div>
              </div>

              {job.hasWarRoom && (
                <div className="ignition-nav-war-room-section">
                  <div className="ignition-nav-war-room-info">
                    <span>👥</span>
                    <span>현재 {job.warRoomCount}명이 작전회의 중입니다</span>
                  </div>
                </div>
              )}
            </div>

            <div className="ignition-nav-modal-footer">
              <div className="ignition-nav-modal-footer-left">
                <ShareButton job={job} className="ignition-nav-modal-share-btn" />
                <button 
                  className="ignition-nav-modal-btn secondary"
                  onClick={() => setIsSuggestionModalOpen(true)}
                >
                  제안하기
                </button>
              </div>
              <div className="ignition-nav-modal-footer-right">
                <button className="ignition-nav-modal-btn secondary" onClick={onClose}>
                  닫기
                </button>
                <button 
                  className="ignition-nav-modal-btn primary"
                  onClick={() => {
                    if (job.sourceUrl) {
                      window.open(job.sourceUrl, '_blank', 'noopener,noreferrer');
                    } else {
                      alert('지원 링크가 없습니다.');
                    }
                  }}
                >
                  지원하기
                </button>
                {/* 로드맵 분석 버튼 임시 비활성화 - 서버 측 개인화 구현 후 활성화 예정 */}
                {/* <button className="ignition-nav-modal-btn primary">
                  로드맵 분석
                </button> */}
              </div>
            </div>
          </>
        )}
      </div>
      
      {job && (
        <SuggestionModal
          job={job}
          isOpen={isSuggestionModalOpen}
          onClose={() => setIsSuggestionModalOpen(false)}
          onSuccess={() => {
            setIsSuggestionModalOpen(false);
            alert('제안이 성공적으로 전송되었습니다. 감사합니다!');
          }}
        />
      )}
    </div>
  );
};

export default JobDetailModal;
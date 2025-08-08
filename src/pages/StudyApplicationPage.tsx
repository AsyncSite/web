import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import studyService, { Study, ApplicationRequest } from '../api/studyService';
import './StudyApplicationPage.css';

const StudyApplicationPage: React.FC = () => {
  const navigate = useNavigate();
  const { studyId } = useParams<{ studyId: string }>();
  const { user, isAuthenticated } = useAuth();
  const [study, setStudy] = useState<Study | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  
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

      try {
        setLoading(true);
        const studyData = await studyService.getStudyById(studyId);
        
        if (!studyData) {
          alert('존재하지 않는 스터디입니다.');
          navigate('/study');
          return;
        }

        if (studyData.status !== 'recruiting') {
          alert('현재 모집 중이지 않은 스터디입니다.');
          navigate('/study');
          return;
        }

        setStudy(studyData);
      } catch (error) {
        console.error('스터디 정보 로딩 실패:', error);
        alert('스터디 정보를 불러올 수 없습니다.');
        navigate('/study');
      } finally {
        setLoading(false);
      }
    };

    fetchStudy();
  }, [studyId, navigate]);

  const handleInputChange = (key: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      alert('스터디 참여 신청을 위해서는 로그인이 필요합니다.');
      navigate('/login', { state: { from: `/study/${studyId}/apply` } });
      return;
    }

    if (!studyId) {
      return;
    }

    // Validation
    const requiredFields = ['motivation', 'experience', 'availability'];
    const missingFields = requiredFields.filter(field => !answers[field]?.trim());
    
    if (missingFields.length > 0) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const applicationRequest: ApplicationRequest = {
        applicantId: user.email, // Use email as identifier like in proposal
        answers: Object.fromEntries(
          Object.entries(answers).filter(([_, value]) => value.trim())
        )
      };
      
      await studyService.applyToStudy(studyId, applicationRequest);
      
      alert('스터디 참여 신청이 완료되었습니다!\n스터디 호스트가 검토 후 연락드릴 예정입니다.');
      navigate(`/study/${study?.slug || studyId}`);
    } catch (error: any) {
      console.error('스터디 신청 실패:', error);
      
      // 중복 신청 체크 (409 Conflict)
      if (error.response?.status === 409) {
        alert('이미 이 스터디에 참가 신청을 하셨습니다.\n관리자가 검토 중이니 조금만 기다려주세요.');
        navigate(`/study/${study?.slug || studyId}`);
        return;
      }
      
      const errorMessage = error.response?.data?.message || '스터디 신청 중 오류가 발생했습니다. 다시 시도해주세요.';
      alert(errorMessage);
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

  if (!study) {
    return null;
  }

  return (
    <div className="study-application-page">
      <div className="application-container">
        <div className="application-header">
          <button 
            onClick={() => navigate(`/study/${study.slug}`)} 
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

          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate(`/study/${study.slug}`)}
              className="cancel-button"
            >
              취소
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? '신청 중...' : '참여 신청하기'}
            </button>
          </div>
        </form>

        <div className="application-info">
          <h3>📋 신청 프로세스</h3>
          <ol>
            <li>지원서를 작성하여 제출합니다.</li>
            <li>스터디 호스트가 지원서를 검토합니다. (1-3일 소요)</li>
            <li>승인되면 이메일로 안내를 받습니다.</li>
            <li>스터디 멤버로 활동을 시작합니다.</li>
          </ol>
          <p className="info-note">
            * 지원서는 스터디 호스트에게만 공개되며, 성실하게 작성해주시면 선발에 도움이 됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudyApplicationPage;
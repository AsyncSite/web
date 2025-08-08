import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { TemplateHeader } from '../components/layout';
import { Footer } from '../components/layout';
import studyService, { type Study } from '../api/studyService';

const StudyDetailPage: React.FC = () => {
  const { studyIdentifier } = useParams<{ studyIdentifier: string }>();
  const [study, setStudy] = useState<Study | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchStudy = async () => {
      if (!studyIdentifier) {
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // slug로 직접 조회
        const studyData = await studyService.getStudyBySlug(studyIdentifier);
        setStudy(studyData);
      } catch (err) {
        console.error('Failed to fetch study:', err);
        setError('스터디를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudy();
  }, [studyIdentifier]);
  
  if (!studyIdentifier) {
    return <Navigate to="/study" replace />;
  }
  
  if (loading) {
    return (
      <div className="study-detail-page">
        <TemplateHeader />
        <main className="page-content">
          <div className="container" style={{ paddingTop: '100px', paddingBottom: '100px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
              <p>스터디 정보를 불러오는 중...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (error || !study) {
    return <Navigate to="/study" replace />;
  }

  // 테코테코는 전용 페이지로 리다이렉트
  if (study.slug === 'tecoteco') {
    return <Navigate to="/study/1-tecoteco" replace />;
  }

  // 기본 스터디 상세 페이지 (향후 개발)
  return (
    <div className="study-detail-page">
      <TemplateHeader />
      <main className="page-content">
        <div className="container" style={{ paddingTop: '100px', paddingBottom: '100px' }}>
          <h1>{study.name} {study.generation > 1 ? `${study.generation}기` : ''}</h1>
          <p>{study.tagline}</p>
          {study.description && <p>{study.description}</p>}
          
          <div style={{ marginTop: '40px' }}>
            <h2>스터디 정보</h2>
            <ul>
              {(study.schedule || study.duration) && (
                <li>일정: {study.schedule} {study.duration}</li>
              )}
              {study.capacity > 0 && (
                <li>정원: {study.capacity}명 (현재 {study.enrolled}명 참여)</li>
              )}
              <li>리더: {study.leader.name}</li>
              <li>상태: {study.status === 'recruiting' ? '모집중' : study.status === 'ongoing' ? '진행중' : '종료'}</li>
            </ul>
          </div>
          
          <div style={{ marginTop: '40px' }}>
            <p>💡 이 페이지는 향후 각 스터디별 맞춤 페이지로 개발될 예정입니다.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StudyDetailPage;

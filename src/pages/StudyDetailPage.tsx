import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { TemplateHeader } from '../components/layout';
import { Footer } from '../components/layout';
import { getStudyByIdOrSlug } from '../constants/studies';

const StudyDetailPage: React.FC = () => {
  const { studyIdentifier } = useParams<{ studyIdentifier: string }>();
  
  if (!studyIdentifier) {
    return <Navigate to="/study" replace />;
  }

  const study = getStudyByIdOrSlug(studyIdentifier);
  
  if (!study) {
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
          <h1>{study.name} {study.generation}기</h1>
          <p>{study.tagline}</p>
          <p>{study.description}</p>
          
          <div style={{ marginTop: '40px' }}>
            <h2>스터디 정보</h2>
            <ul>
              <li>일정: {study.schedule} {study.duration}</li>
              <li>정원: {study.capacity}명 (현재 {study.enrolled}명 참여)</li>
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
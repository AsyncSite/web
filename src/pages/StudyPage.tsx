import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TabPage.css';

const StudyPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const handleHome = () => {
    navigate('/');
  };

  return (
    <div className="page-container">
      <main className="page-content">
        <div className="coming-soon">
          <h1>STUDY</h1>
          <p>Coming Soon...</p>
          <div className="description">
            스터디 관련 페이지가 곧 공개됩니다.
          </div>
          <div className="nav-buttons">
            <button onClick={handleBack} className="nav-btn back">
              ← 이전 페이지
            </button>
            <button onClick={handleHome} className="nav-btn home">
              🏠 홈으로 가기
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudyPage;

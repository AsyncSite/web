import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { STUDY_LIST, getStudyUrl } from '../constants/studies';
import StudyCalendar from '../components/study/StudyCalendar/StudyCalendar';
import './TabPage.css';

const StudyPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'list' | 'calendar'>(
    location.pathname.includes('/calendar') ? 'calendar' : 'list'
  );
  
  const recruitingStudies = STUDY_LIST.filter(study => study.status === 'recruiting');
  const ongoingStudies = STUDY_LIST.filter(study => study.status === 'ongoing');
  const closedStudies = STUDY_LIST.filter(study => study.status === 'closed');

  const handleTabChange = (tab: 'list' | 'calendar') => {
    setActiveTab(tab);
    navigate(tab === 'calendar' ? '/study/calendar' : '/study');
  };

  return (
    <div className="page-container">
      <main className="page-content">
        <div className="study-list-page">
          <h1>STUDY</h1>
          <p className="page-description">함께 성장하는 개발자들의 커뮤니티</p>
          
          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button
              className={`tab-button ${activeTab === 'list' ? 'active' : ''}`}
              onClick={() => handleTabChange('list')}
            >
              <span className="tab-icon">📚</span>
              스터디 목록
            </button>
            <button
              className={`tab-button ${activeTab === 'calendar' ? 'active' : ''}`}
              onClick={() => handleTabChange('calendar')}
            >
              <span className="tab-icon">📅</span>
              일정 캘린더
            </button>
          </div>
          
          {/* Tab Content */}
          {activeTab === 'list' ? (
            <>
              {recruitingStudies.length > 0 && (
                <section className="study-section">
                  <h2>📢 모집 중인 스터디</h2>
                  <div className="study-grid">
                    {recruitingStudies.map(study => (
                      <Link to={getStudyUrl(study)} key={study.id} className="study-card-link">
                        <div className="study-card">
                          <div className="study-header">
                            <h3>{study.name} <span className="generation">{study.generation}기</span></h3>
                            <span className="status-badge recruiting">모집중</span>
                          </div>
                          <p className="study-tagline">{study.tagline}</p>
                          <div className="study-meta">
                            <span>📅 {study.schedule}</span>
                            <span>👥 {study.enrolled}/{study.capacity}명</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {ongoingStudies.length > 0 && (
                <section className="study-section">
                  <h2>🚀 진행 중인 스터디</h2>
                  <div className="study-grid">
                    {ongoingStudies.map(study => (
                      <Link to={getStudyUrl(study)} key={study.id} className="study-card-link">
                        <div className="study-card">
                          <div className="study-header">
                            <h3>{study.name} <span className="generation">{study.generation}기</span></h3>
                            <span className="status-badge ongoing">진행중</span>
                          </div>
                          <p className="study-tagline">{study.tagline}</p>
                          <div className="study-meta">
                            <span>📅 {study.schedule}</span>
                            <span>👥 {study.enrolled}명 참여중</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {closedStudies.length > 0 && (
                <section className="study-section">
                  <h2>🏁 종료된 스터디</h2>
                  <div className="study-grid">
                    {closedStudies.map(study => (
                      <div key={study.id} className="study-card disabled">
                        <div className="study-header">
                          <h3>{study.name} <span className="generation">{study.generation}기</span></h3>
                          <span className="status-badge closed">종료</span>
                        </div>
                        <p className="study-tagline">{study.tagline}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <StudyCalendar />
          )}
        </div>
      </main>
    </div>
  );
};

export default StudyPage;

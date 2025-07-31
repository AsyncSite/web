import React from 'react';
import './NavigatorDashboard.css';

interface JobData {
  id: number;
  company: string;
  title: string;
  matchScore: number;
  skills: string[];
  location: string;
  experience: string;
  deadline: string;
  warRoomCount?: number;
}

const NavigatorDashboard: React.FC = () => {
  // Mock data
  const stats = {
    activeJobs: 152,
    newJobs: 48,
    avgMatchScore: 85,
    activeWarRooms: 23,
  };

  const recommendedJobs: JobData[] = [
    {
      id: 1,
      company: '네이버웹툰',
      title: '백엔드 서버 개발자',
      matchScore: 95,
      skills: ['Java', 'Spring Boot', 'Kotlin', 'MSA'],
      location: '분당',
      experience: '경력 3년+',
      deadline: '~08.31',
      warRoomCount: 12,
    },
    {
      id: 2,
      company: '카카오',
      title: '카카오페이 결제 서버 개발자',
      matchScore: 87,
      skills: ['Java', 'Spring Boot', 'MySQL', 'Kafka'],
      location: '판교',
      experience: '경력 5년+',
      deadline: '~09.15',
      warRoomCount: 8,
    },
    {
      id: 3,
      company: '토스',
      title: '금융 서비스 백엔드 개발자',
      matchScore: 82,
      skills: ['Kotlin', 'Spring', 'Redis', 'k8s'],
      location: '강남',
      experience: '경력 무관',
      deadline: '~09.30',
    },
  ];

  const techTrends = [
    { rank: 1, name: 'Kubernetes', change: 23 },
    { rank: 2, name: 'Kafka', change: 18 },
    { rank: 3, name: 'React', change: 15 },
    { rank: 4, name: 'TypeScript', change: 12 },
  ];

  return (
    <div className="ignition-nav-dashboard">
      {/* Personal Header */}
      <section className="ignition-nav-personal-header">
        <h2 className="ignition-nav-greeting">안녕하세요! 👋</h2>
        <p className="ignition-nav-sub-greeting">오늘도 당신의 커리어 성장을 응원합니다</p>
        
        <div className="ignition-nav-quick-stats">
          <div className="ignition-nav-stat-card">
            <div className="ignition-nav-stat-icon">🎯</div>
            <div className="ignition-nav-stat-content">
              <div className="ignition-nav-stat-value">{stats.avgMatchScore}%</div>
              <div className="ignition-nav-stat-label">평균 매칭률</div>
            </div>
          </div>
          <div className="ignition-nav-stat-card">
            <div className="ignition-nav-stat-icon">📈</div>
            <div className="ignition-nav-stat-content">
              <div className="ignition-nav-stat-value">{stats.newJobs}개</div>
              <div className="ignition-nav-stat-label">새로운 기회</div>
            </div>
          </div>
          <div className="ignition-nav-stat-card">
            <div className="ignition-nav-stat-icon">💼</div>
            <div className="ignition-nav-stat-content">
              <div className="ignition-nav-stat-value">{stats.activeJobs}개</div>
              <div className="ignition-nav-stat-label">활성 채용공고</div>
            </div>
          </div>
          <div className="ignition-nav-stat-card">
            <div className="ignition-nav-stat-icon">👥</div>
            <div className="ignition-nav-stat-content">
              <div className="ignition-nav-stat-value">{stats.activeWarRooms}개</div>
              <div className="ignition-nav-stat-label">활성 작전회의실</div>
            </div>
          </div>
        </div>
      </section>

      <div className="ignition-nav-dashboard-grid">
        {/* Recommended Jobs */}
        <section className="ignition-nav-recommended-section">
          <div className="ignition-nav-section-header">
            <h2 className="ignition-nav-section-title">
              <span>✨</span>
              <span>맞춤 추천 공고</span>
            </h2>
            <a href="#" className="ignition-nav-section-action">전체보기 →</a>
          </div>

          <div className="ignition-nav-job-list">
            {recommendedJobs.map((job) => (
              <article key={job.id} className="ignition-nav-job-card-compact">
                <div className="ignition-nav-job-compact-header">
                  <div className="ignition-nav-job-compact-info">
                    <div className="ignition-nav-company-info">
                      <div className="ignition-nav-company-logo-sm">
                        {job.company.charAt(0)}
                      </div>
                      <span className="ignition-nav-company-name-sm">{job.company}</span>
                    </div>
                    <h3 className="ignition-nav-job-title-compact">{job.title}</h3>
                  </div>
                  <div className="ignition-nav-match-indicator">
                    <div 
                      className="ignition-nav-match-circle" 
                      style={{ '--match': job.matchScore } as React.CSSProperties}
                    >
                      <span className="ignition-nav-match-value">{job.matchScore}%</span>
                    </div>
                    <span className="ignition-nav-match-label">매칭</span>
                  </div>
                </div>
                <div className="ignition-nav-job-tags-compact">
                  {job.skills.map((skill, index) => (
                    <span key={index} className="ignition-nav-tag-compact">{skill}</span>
                  ))}
                </div>
                <div className="ignition-nav-job-compact-footer">
                  <div className="ignition-nav-job-meta-compact">
                    <span>{job.experience}</span>
                    <span>{job.location}</span>
                    <span>{job.deadline}</span>
                  </div>
                  {job.warRoomCount && (
                    <a href="#" className="ignition-nav-war-room-link">
                      <span>👥</span>
                      <span>{job.warRoomCount}명 참여중</span>
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Sidebar */}
        <aside className="ignition-nav-sidebar">
          {/* Roadmap Widget */}
          <div className="ignition-nav-roadmap-widget">
            <div className="ignition-nav-roadmap-icon">🗺️</div>
            <h3 className="ignition-nav-roadmap-title">성장 로드맵</h3>
            <p className="ignition-nav-roadmap-desc">
              목표 공고까지의 최단 경로를<br />
              AI가 분석해드립니다
            </p>
            <button className="ignition-nav-roadmap-btn">내 로드맵 만들기</button>
          </div>

          {/* Tech Trends Widget */}
          <div className="ignition-nav-trend-widget">
            <div className="ignition-nav-trend-widget-header">
              <h3 className="ignition-nav-trend-widget-title">
                <span>📈</span>
                <span>실시간 기술 트렌드</span>
              </h3>
            </div>
            <div className="ignition-nav-trend-list">
              {techTrends.map((trend) => (
                <div key={trend.rank} className="ignition-nav-trend-item">
                  <div className="ignition-nav-trend-rank">#{trend.rank}</div>
                  <div className="ignition-nav-trend-info">
                    <div className="ignition-nav-trend-name">{trend.name}</div>
                    <div className="ignition-nav-trend-change">▲ {trend.change}% 상승</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default NavigatorDashboard;
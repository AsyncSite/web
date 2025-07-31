import React from 'react';
import './NavigatorList.css';

interface NavigatorListProps {
  searchQuery: string;
  filters: {
    companies: string[];
    skills: string[];
    experience: string[];
  };
}

interface JobItem {
  id: number;
  company: string;
  companyLogo: string;
  title: string;
  description: string;
  skills: string[];
  experience: string;
  location: string;
  deadline: string;
  matchScore: number;
  hasWarRoom: boolean;
  warRoomCount?: number;
}

const NavigatorList: React.FC<NavigatorListProps> = ({ searchQuery, filters }) => {
  // Mock data
  const jobList: JobItem[] = [
    {
      id: 1,
      company: '네이버웹툰',
      companyLogo: 'N',
      title: '백엔드 서버 개발자 (네이버웹툰)',
      description: '네이버웹툰의 글로벌 서비스를 함께 만들어갈 백엔드 개발자를 찾습니다. 대용량 트래픽 처리와 안정적인 서비스 운영에 관심이 있으신 분을 환영합니다.',
      skills: ['Java', 'Spring Boot', 'Kotlin', 'MSA', 'Kafka'],
      experience: '경력 3년 이상',
      location: '분당',
      deadline: '~2025.08.31',
      matchScore: 95,
      hasWarRoom: true,
      warRoomCount: 12,
    },
    {
      id: 2,
      company: '카카오',
      companyLogo: 'K',
      title: '카카오페이 결제 서버 개발자',
      description: '카카오페이 결제 시스템의 안정성과 확장성을 책임질 서버 개발자를 모십니다. 금융 서비스 개발 경험이 있으신 분을 우대합니다.',
      skills: ['Java', 'Spring Boot', 'MySQL', 'Redis', 'Kafka'],
      experience: '경력 5년 이상',
      location: '판교',
      deadline: '~2025.09.15',
      matchScore: 87,
      hasWarRoom: true,
      warRoomCount: 8,
    },
    {
      id: 3,
      company: '쿠팡',
      companyLogo: 'C',
      title: '물류 플랫폼 백엔드 개발자',
      description: '쿠팡의 혁신적인 물류 시스템을 개발하고 운영할 백엔드 개발자를 찾습니다. 대규모 분산 시스템 개발에 열정이 있는 분을 환영합니다.',
      skills: ['Go', 'Python', 'AWS', 'Docker', 'Kubernetes'],
      experience: '경력 무관',
      location: '송파',
      deadline: '~2025.09.30',
      matchScore: 82,
      hasWarRoom: true,
      warRoomCount: 15,
    },
    {
      id: 4,
      company: '배달의민족',
      companyLogo: 'B',
      title: '딜리버리 서비스 백엔드',
      description: '배달의민족 서비스의 핵심인 딜리버리 시스템을 개발할 백엔드 개발자를 모집합니다. 실시간 데이터 처리에 관심이 있으신 분을 찾습니다.',
      skills: ['Kotlin', 'Spring', 'Redis', 'k8s', 'gRPC'],
      experience: '경력 2년 이상',
      location: '송파',
      deadline: '~2025.08.25',
      matchScore: 78,
      hasWarRoom: false,
    },
    {
      id: 5,
      company: '토스',
      companyLogo: 'T',
      title: '금융 서비스 백엔드 개발자',
      description: '토스의 혁신적인 금융 서비스를 만들어갈 백엔드 개발자를 찾습니다. 대규모 금융 시스템 개발 경험이 있으신 분을 우대합니다.',
      skills: ['Java', 'Spring Boot', 'PostgreSQL', 'Kafka', 'AWS'],
      experience: '경력 4년 이상',
      location: '강남',
      deadline: '~2025.09.20',
      matchScore: 85,
      hasWarRoom: true,
      warRoomCount: 10,
    },
  ];

  // Simple filtering logic (in real app, this would be more sophisticated)
  const filteredJobs = jobList.filter(job => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!job.title.toLowerCase().includes(query) && 
          !job.company.toLowerCase().includes(query) &&
          !job.skills.some(skill => skill.toLowerCase().includes(query))) {
        return false;
      }
    }
    // Add more filter logic here based on filters prop
    return true;
  });

  return (
    <div className="ignition-nav-list">
      {/* List Controls */}
      <div className="ignition-nav-list-controls">
        <span className="ignition-nav-results-count">총 {filteredJobs.length}개의 채용공고</span>
        <div className="ignition-nav-view-options">
          <select className="ignition-nav-sort-dropdown">
            <option>매칭률 높은순</option>
            <option>최신순</option>
            <option>마감임박순</option>
            <option>인기순</option>
          </select>
        </div>
      </div>

      {/* Job List */}
      <div className="ignition-nav-job-items">
        {filteredJobs.map((job) => (
          <article key={job.id} className="ignition-nav-job-item">
            {job.hasWarRoom && <div className="ignition-nav-war-room-indicator"></div>}
            
            <div className="ignition-nav-job-item-header">
              <div className="ignition-nav-job-info">
                <div className="ignition-nav-job-company">
                  <div className="ignition-nav-company-logo">{job.companyLogo}</div>
                  <span className="ignition-nav-company-name">{job.company}</span>
                </div>
                <h3 className="ignition-nav-job-title">{job.title}</h3>
              </div>
              <div className="ignition-nav-job-badges">
                <div className="ignition-nav-match-badge">{job.matchScore}% 매칭</div>
                {job.hasWarRoom && (
                  <div className="ignition-nav-war-room-badge">
                    <span>👥</span>
                    <span>{job.warRoomCount}명 작전회의중</span>
                  </div>
                )}
              </div>
            </div>
            
            <p className="ignition-nav-job-description">{job.description}</p>
            
            <div className="ignition-nav-job-skills">
              {job.skills.map((skill, index) => (
                <span key={index} className="ignition-nav-skill-tag">{skill}</span>
              ))}
            </div>
            
            <div className="ignition-nav-job-footer">
              <div className="ignition-nav-job-meta">
                <div className="ignition-nav-job-meta-item">🏢 {job.experience}</div>
                <div className="ignition-nav-job-meta-item">📍 {job.location}</div>
                <div className="ignition-nav-job-meta-item">📅 {job.deadline}</div>
              </div>
              <div className="ignition-nav-job-action">
                <button className="ignition-nav-action-btn">상세보기</button>
                <button className="ignition-nav-action-btn primary">로드맵 분석</button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Pagination */}
      <div className="ignition-nav-pagination">
        <button className="ignition-nav-page-btn">&lt;</button>
        <button className="ignition-nav-page-btn active">1</button>
        <button className="ignition-nav-page-btn">2</button>
        <button className="ignition-nav-page-btn">3</button>
        <button className="ignition-nav-page-btn">4</button>
        <button className="ignition-nav-page-btn">5</button>
        <button className="ignition-nav-page-btn">&gt;</button>
      </div>
    </div>
  );
};

export default NavigatorList;
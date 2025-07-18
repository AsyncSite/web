import React from 'react';
import './Studies.css';

interface StudyGroup {
  id: number;
  type: string;
  title: string;
  subtitle: string;
  location: string;
  members: string;
  schedule: string;
  description: string;
  tags: string[];
  activityRate: string;
  image?: string;
}

const Studies: React.FC = () => {
  const studyGroups: StudyGroup[] = [
    {
      id: 1,
      type: '알고리즘',
      title: '테코테코',
      subtitle: '일요일의 코딩테스트',
      location: '온라인',
      members: '12/15명',
      schedule: '매주 일요일',
      description: '편안한 일요일 오전, 커피 한 잔과 함께하는 알고리즘 스터디. 백준, 프로그래머스 문제를 함께 풀고 코드 리뷰를 진행',
      tags: ['#백준', '#프로그래머스', '#코드리뷰'],
      activityRate: '🔥 활동률 95%',
      image: 'algorithm'
    },
    {
      id: 2,
      type: '개발블로그',
      title: 'DEVLOG',
      subtitle: '개발블로그 14일마다 쓰기',
      location: '온라인',
      members: '8/12명',
      schedule: '14일마다',
      description: '2주에 한 번씩 개발 블로그를 작성하는 챌린지입니다. 꾸준한 기록으로 성장 과정을 남기고 지식을 공유합니다.',
      tags: ['#블로그', '#기술글', '#꾸준함'],
      activityRate: '🔥 활동률 88%',
      image: 'blog'
    },
    {
      id: 3,
      type: '오픈소스',
      title: '디핑소스',
      subtitle: '오픈소스 기여',
      location: '온라인',
      members: '6/10명',
      schedule: '매월 1회',
      description: '오픈소스 프로젝트에 기여하며 실무 경험을 쌓습니다. 코드 리뷰부터 이슈 해결까지 다양한 방식으로 참여합니다.',
      tags: ['#오픈소스', '#기여', '#협업'],
      activityRate: '🔥 활동률 92%',
      image: 'opensource'
    }
  ];

  return (
    <section className="studies" id="studies">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">PRE-WAVE</h2>
          <p className="section-subtitle">다양한 분야의 스터디에 참여해보세요</p>
        </div>

        <div className="group-grid">
          {studyGroups.map((group) => (
            <div key={group.id} className="group-card">
              {/* 기본 이미지 영역 */}
              <div className={`group-image-placeholder ${group.image}`}>
                <div className="image-overlay">
                  <div className="image-title">
                    <h3 className="group-main-title">{group.title}</h3>
                    <p className="group-subtitle">{group.subtitle}</p>
                  </div>
                </div>
              </div>

              {/* 호버 시 나타나는 상세 정보 */}
              <div className="group-details">
                <div className="group-header">
                  <div className="group-type">{group.type}</div>
                  <h3 className="group-main-title">{group.title}</h3>
                </div>
                <div className="group-body">
                  <h4 className="group-title">{group.subtitle}</h4>
                  <div className="group-meta">
                    <span>📍 {group.location}</span>
                    <span>👥 {group.members}</span>
                    <span>📅 {group.schedule}</span>
                  </div>
                  <p className="group-desc">{group.description}</p>
                  <div className="group-tags">
                    {group.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                  <div className="group-footer">
                    <div className="members-info">
                      <span>{group.activityRate}</span>
                    </div>
                    <button className="join-button">참여 신청</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Studies;

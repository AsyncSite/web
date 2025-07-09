import React from 'react';
import './Activities.css';

interface ActivityItem {
  id: number;
  icon: string;
  title: string;
  schedule: string;
  description: string;
  participants: string[];
  totalParticipants: number;
}

const Activities: React.FC = () => {
  const activities: ActivityItem[] = [
    {
      id: 1,
      icon: '💻',
      title: '테코테코 - 알고리즘 스터디',
      schedule: '매주 일요일 오전 10시',
      description: '매주 일요일 아침, 함께 모여 알고리즘 문제를 풀고 토론합니다. 서로의 코드를 리뷰하며 더 나은 해결책을 찾아갑니다.',
      participants: ['김', '이', '박', '최'],
      totalParticipants: 28
    },
    {
      id: 2,
      icon: '🌙',
      title: '11루틴 - 온라인 모각코',
      schedule: '매주 수요일 밤 11시',
      description: '퇴근 후 온라인으로 모여 각자의 프로젝트를 진행합니다. 서로 진행 상황을 공유하며 동기부여를 받습니다.',
      participants: ['정', '강', '조', '윤'],
      totalParticipants: 35
    },
    {
      id: 3,
      icon: '📚',
      title: 'DEVLOG-14 - 블로그 챌린지',
      schedule: '격주 금요일',
      description: '2주에 한 번씩 기술 블로그를 작성하는 챌린지입니다. 꾸준한 기록으로 성장 과정을 남기고 공유합니다.',
      participants: ['한', '오', '서', '남'],
      totalParticipants: 22
    }
  ];

  return (
    <section className="activities" id="activities">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">정기 활동</h2>
          <p className="section-subtitle">다양한 활동을 통해 꾸준히 성장합니다</p>
        </div>

        <div className="activity-grid">
          {activities.map((activity) => (
            <div key={activity.id} className="activity-card">
              <div className="activity-icon">{activity.icon}</div>
              <h3 className="activity-title">{activity.title}</h3>
              <p className="activity-schedule">{activity.schedule}</p>
              <p className="activity-description">{activity.description}</p>
              <div className="activity-participants">
                <div className="participant-avatars">
                  {activity.participants.map((participant, index) => (
                    <div key={index} className="avatar">{participant}</div>
                  ))}
                </div>
                <span>+{activity.totalParticipants}명 참여중</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Activities;

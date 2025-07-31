import React, { useState } from 'react';

// MemberStory 인터페이스 정의
interface MemberStory {
  id: number;
  name: string;
  role: string;
  company?: string;
  beforeAfter: {
    before: string;
    after: string;
  };
  quote: string;
  duration: string;
  achievements: string[];
  profileImage?: string;
}

// 멤버 성장 스토리 데이터 (TecoTecoPage.tsx에서 가져옴)
const memberStories: MemberStory[] = [
  {
    id: 1,
    name: '김개발',
    role: '백엔드 개발자',
    company: '네카라쿠배',
    beforeAfter: {
      before: '알고리즘 문제만 보면 막막했던',
      after: '이제는 문제 패턴이 보이는',
    },
    quote:
      '혼자였다면 포기했을 문제들도 함께라서 해결할 수 있었어요. 특히 DP 문제는 이제 자신있게 접근할 수 있습니다.',
    duration: '6개월',
    achievements: ['코딩테스트 3사 합격', '리트코드 300문제 해결', '알고리즘 스터디 리더'],
    profileImage: process.env.PUBLIC_URL + '/images/face/member1.png',
  },
  {
    id: 2,
    name: '이프론트',
    role: '프론트엔드 개발자',
    beforeAfter: {
      before: '자료구조가 약했던',
      after: '최적화를 고민하는',
    },
    quote:
      'TecoTeco에서 배운 자료구조 지식이 실무에서도 큰 도움이 됐어요. 이제는 성능을 고려한 코드를 짤 수 있게 됐습니다.',
    duration: '4개월',
    achievements: ['Big-O 마스터', '트리/그래프 정복', '팀내 성능 개선 주도'],
    profileImage: process.env.PUBLIC_URL + '/images/face/member2.png',
  },
];

// 누락된 handleImgError 함수 (필요 시 TecoTecoPage.tsx에서 옮겨오거나 별도로 정의)
const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  e.currentTarget.src = process.env.PUBLIC_URL + '/images/default-profile.png'; // 대체 이미지 경로
  e.currentTarget.onerror = null; // 무한 루프 방지
};

const MemberStoryCarousel: React.FC = () => {
  const [currentStory, setCurrentStory] = useState(0);

  const nextStory = () => {
    setCurrentStory((prev) => (prev + 1) % memberStories.length);
  };

  const prevStory = () => {
    setCurrentStory((prev) => (prev - 1 + memberStories.length) % memberStories.length);
  };

  return (
    <div className="member-story-carousel">
      <h3 className="story-title">🌟 TecoTeco와 함께 성장한 이야기</h3>
      <div className="story-container">
        <button className="story-nav prev" onClick={prevStory}>
          ‹
        </button>
        <div className="story-content">
          {memberStories.map((story, index) => (
            <div
              key={story.id}
              className={`story-card ${index === currentStory ? 'active' : ''}`}
              style={{ display: index === currentStory ? 'block' : 'none' }}
            >
              <div className="story-header">
                <img
                  src={story.profileImage}
                  alt={story.name}
                  className="story-profile"
                  onError={handleImgError}
                />
                <div className="story-info">
                  <h4>{story.name}</h4>
                  <p>
                    {story.role} {story.company && `@ ${story.company}`}
                  </p>
                  <span className="story-duration">TecoTeco {story.duration}</span>
                </div>
              </div>
              <div className="story-transformation">
                <p className="before">{story.beforeAfter.before}</p>
                <span className="arrow">→</span>
                <p className="after">{story.beforeAfter.after}</p>
              </div>
              <blockquote className="story-quote">"{story.quote}"</blockquote>
              <div className="story-achievements">
                {story.achievements.map((achievement, idx) => (
                  <span key={idx} className="achievement-badge">
                    {achievement}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button className="story-nav next" onClick={nextStory}>
          ›
        </button>
      </div>
      <div className="story-dots">
        {memberStories.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === currentStory ? 'active' : ''}`}
            onClick={() => setCurrentStory(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default MemberStoryCarousel;

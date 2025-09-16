import { StudyTemplate } from './types';

export const mogakkoTemplate: StudyTemplate = {
  name: '모각코 스터디',
  icon: '☕',
  color: {
    primary: '#FF9B9B',
    secondary: '#FFC8A2',
    gradient: 'linear-gradient(135deg, rgba(255, 155, 155, 0.1), rgba(255, 200, 162, 0.1))'
  },
  sections: {
    hero: {
      title: '☕ 모각코<br/>함께 모여 각자 코딩',
      subtitle: '같은 공간, 다른 목표<br/><span class="highlight">함께하면 더 멀리 갈 수 있어요</span>',
      tagHeader: '모각코와 함께하는 성장',
      features: [
        {
          icon: '🎯',
          title: '자기 주도 학습',
          description: '각자의 목표를 향해 집중'
        },
        {
          icon: '🤝',
          title: '네트워킹',
          description: '다양한 분야 개발자들과 교류'
        },
        {
          icon: '☕',
          title: '편안한 분위기',
          description: '카페에서 함께하는 코딩 타임'
        }
      ]
    },
    faq: {
      tagHeader: '자주 묻는 질문',
      title: '모각코가 궁금하신가요?',
      subtitle: '모여서 각자 코딩, 함께하면 더 즐거운 개발 시간',
      faqs: [
        {
          id: 'mogakko-1',
          question: '모각코는 어떤 활동을 하나요?',
          answer: '정해진 시간과 장소에 모여 각자 개인 프로젝트나 공부를 진행해요. 중간중간 휴식 시간에는 서로 진행 상황을 공유하고 질문도 주고받습니다.'
        },
        {
          id: 'mogakko-2',
          question: '꼭 코딩만 해야 하나요?',
          answer: '아니에요! 개발 관련 공부라면 무엇이든 괜찮습니다. 알고리즘, 프로젝트, 강의 수강, 기술 블로그 작성 등 자유롭게 진행하시면 됩니다.'
        },
        {
          id: 'mogakko-3',
          question: '초보자도 참여할 수 있나요?',
          answer: '물론입니다! 모각코는 레벨 제한이 없어요. 각자 수준에 맞는 공부를 하면서 모르는 건 서로 물어보고 도와주는 분위기입니다.'
        }
      ]
    },
    review: {
      data: {
        enabled: true,
        tagHeader: '참여 후기',
        title: '모각코 참여 후기',
        subtitle: '함께한 개발자들의 생생한 이야기',
        showStats: true,
        keywords: ['집중력 향상', '네트워킹', '동기부여', '자유로운 분위기', '생산적'],
        showKeywords: true
      },
      reviews: []
    },
    leader: {
      name: '김모각',
      profileImage: 'https://example.com/profile.jpg',
      role: '모각코 매니저',
      motivation: '혼자 코딩하면 늘어지기 쉬운데, 함께 모여서 하니 집중도 잘 되고 동기부여가 되더라구요. 이런 좋은 경험을 더 많은 분들과 나누고 싶어 시작했습니다.',
      philosophy: '강제하지 않아요. 각자의 속도와 목표를 존중하면서도, 함께하는 시너지를 만들어가는 것이 목표입니다.',
      welcomeMessage: '편하게 오셔서 각자 할 일 하시면 됩니다! 막히는 부분이 있으면 언제든 물어보세요 ☕',
      expertise: ['프론트엔드', '백엔드', '모바일'],
      since: '2024년 1월부터',
      totalStudies: 5,
      totalMembers: 67,
      email: 'mogakko@example.com',
      github: 'https://github.com/mogakko',
      blog: 'https://mogakko.blog'
    },
    experience: {
      tagHeader: '모각코 프로세스',
      title: '모각코 하루 일정',
      subtitle: '효율적인 시간 관리와 네트워킹',
      steps: [
        {
          number: '1',
          title: '오프닝 (10분)',
          description: '간단한 인사와 오늘 목표 공유'
        },
        {
          number: '2',
          title: '집중 코딩 1부 (50분)',
          description: '각자 집중해서 코딩하는 시간'
        },
        {
          number: '3',
          title: '휴식 & 네트워킹 (20분)',
          description: '커피 한 잔 하며 자유롭게 대화'
        },
        {
          number: '4',
          title: '집중 코딩 2부 (50분)',
          description: '다시 집중! 목표 달성을 향해'
        },
        {
          number: '5',
          title: '마무리 (10분)',
          description: '오늘 진행 사항 공유 및 다음 모임 안내'
        }
      ]
    },
    journey: {
      tagHeader: '모각코 여정',
      title: '함께 성장하는 우리의 기록',
      subtitle: '매주 조금씩, 꾸준히',
      milestones: [
        {
          week: '첫 달',
          title: '적응기',
          description: '모각코 적응기',
          topics: ['루틴 만들기', '목표 설정', '첫 네트워킹']
        },
        {
          week: '3개월',
          title: '성장기',
          description: '습관으로 자리잡기',
          topics: ['개인 프로젝트 진전', '스터디원들과 친해지기', '서로 코드 리뷰']
        },
        {
          week: '6개월',
          title: '도약기',
          description: '함께 성장한 시간',
          topics: ['포트폴리오 완성', '취업/이직 성공', '새로운 기술 스택 습듍']
        }
      ]
    },
    howWeRoll: {
      tagHeader: '모임 방식',
      title: '편하게 와서 집중하고 가세요',
      subtitle: '부담 없는 모각코 라이프',
      schedules: [
        {
          day: '매주 토요일',
          time: '14:00 - 17:00',
          description: '3시간 집중 코딩',
          icon: '🗓️'
        },
        {
          day: '장소',
          time: '강남역 스타벅스',
          description: '넓고 조용한 2층 공간',
          icon: '📍'
        },
        {
          day: '준비물',
          time: '노트북과 충전기',
          description: '개인 텀블러 지참 추천',
          icon: '💼'
        }
      ]
    },
    members: {
      tagHeader: '참여자',
      title: '함께하는 개발자들',
      subtitle: '다양한 분야, 다양한 레벨',
      members: [
        {
          name: '이프론트',
          role: '프론트엔드 개발자',
          profileImage: 'https://example.com/member1.jpg',
          bio: 'React로 사이드 프로젝트 진행중'
        },
        {
          name: '박백엔드',
          role: '백엔드 개발자',
          profileImage: 'https://example.com/member2.jpg',
          bio: 'Spring Boot 공부하며 포트폴리오 제작'
        },
        {
          name: '최풀스택',
          role: '풀스택 개발자',
          profileImage: 'https://example.com/member3.jpg',
          bio: '스타트업 창업 준비중'
        }
      ]
    },
    richText: {
      title: '모각코란?',
      content: '<h2>모각코란?</h2><p>모각코(모여서 각자 코딩)는 개발자들이 한 공간에 모여 각자의 목표를 향해 코딩하는 모임입니다.</p><h3>이런 분들께 추천해요</h3><ul><li>혼자 공부하면 집중이 안 되는 분</li><li>다른 개발자들과 네트워킹하고 싶은 분</li><li>규칙적인 공부 습관을 만들고 싶은 분</li><li>편안한 분위기에서 코딩하고 싶은 분</li></ul>'
    }
  }
};
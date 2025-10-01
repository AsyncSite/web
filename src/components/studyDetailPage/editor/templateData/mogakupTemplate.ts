// 모각업 스터디 템플릿 데이터
// 모여서 각자 레벨업 - 성장 중심 스터디 템플릿

import { StudyTemplate } from './algorithmTemplate';

export const mogakupTemplate: StudyTemplate = {
  id: 'mogakup',
  name: '모각업 - 모여서 각자 레벨업',
  sections: {
    hero: {
      title: '🔥 코딩 스터디 <span style="color: #FFD700;">모각업</span>',
      subtitle: '모여서 각자 레벨업! 당신의 성장에 부스트를.',
      description: '혼자 하는 성장이 버거울 때, 수요일 밤, 우리는 함께 레벨업합니다. 각자의 목표를 향해 달리지만, 함께하는 동료들과 서로 자극받으며 성장하는 특별한 경험을 만들어요.',
      buttonText: '스터디 합류하기 🚀',
      buttonLink: '#apply',
      backgroundImage: '/images/study-bg.jpg',
      infoBox: {
        header: '성장의 가속도',
        items: [
          { icon: '💻', text: '<strong>몰입의 공간</strong><br/>각자의 목표에 깊이 파고드는 시간, 방해받지 않는 환경에서 최고의 집중력을 경험해요.' },
          { icon: '💬', text: '<strong>건강한 자극</strong><br/>옆자리 동료의 키보드 소리가 나를 움직이는 원동력이 돼요. 막혔을 땐 함께 머리를 맞대고 해결의 실마리를 찾아요.' },
          { icon: '🚀', text: '<strong>실질적 성장</strong><br/>추상적인 이론보다, \'한 단계라도 내 힘으로 성장하는 경험\'에 집중해요. 매주 꾸준히 쌓이는 성장의 경험이 당신을 단단하게 만들어요.' }
        ]
      }
    },
    leaderIntro: {
      name: '단테',
      profileImage: '/images/leader.jpg',
      role: '스터디 3년차',
      motivation: '레벨업, 해야 하는 건 알지만 혼자서는 꾸준하기 어렵잖아요. 의지만으로 안 될 때, \'환경\'의 힘이 필요하다고 생각했어요. 서로에게 좋은 자극이 되어주는 몰입의 공간을 만들고 싶었습니다.',
      philosophy: '정답을 찾는 것보다 \'스스로의 힘으로 문제를 해결해나가는 과정\' 자체를 즐기는 스터디를 지향해요. 완벽한 결과보다, 어제보다 한 걸음 나아간 나의 성장에 집중합니다.',
      welcomeMessage: '<strong>포기하지만 않는다면, 이미 성장하고 있는 거예요.</strong> 치열하게 고민하고, 과감하게 질문하며 함께 나아가요! 우리에겐 서로가 가장 든든한 동료가 될 거예요. 👩‍💻👨‍💻',
      expertise: ['꾸준함', '실행력', '피드백'],
      since: '2022년 1월부터',
      totalStudies: 4,
      totalMembers: 81,
      email: 'leader@mogakup.com',
      github: 'https://github.com',
      blog: 'https://blog.com'
    },
    richText: {
      title: '모각업 소개',
      content: `
        <p>알고리즘, 사이드 프로젝트, 기술 블로깅...<br/>
        혼자 공부하다 보면 쉽게 지치고 방향을 잃기 마련입니다.</p>

        <p style="color: #888; font-style: italic;">\'오늘은 좀 쉴까?\' 하는 유혹에 무너진 경험, 다들 있으시죠?</p>

        <p><strong>모각업</strong>은 바로 그 지점에서 출발했습니다.</p>

        <h3 style="color: rgb(195, 232, 141); margin-top: 40px;">환경이 성장을 만든다</h3>
        <p>우리는 거창한 목표 대신 <span style="color: rgb(130, 170, 255); font-weight: 500;">\'수요일 저녁 8시, 강남역 스터디룸에 모여 노트북을 연다\'</span>는 하나의 약속에 집중합니다. 정해진 시간에, 정해진 장소에서 함께 작업하는 것. 이 단순한 규칙이 <span style="color: rgb(195, 232, 141); font-weight: 600;">미루는 습관을 끊고, 꾸준함</span>을 만듭니다.</p>

        <h3 style="color: rgb(195, 232, 141); margin-top: 40px;">각자의 레이스, 공동의 페이스메이커</h3>
        <p>모두가 각자의 목표와 속도에 맞춰 작업합니다. 하지만 결코 혼자가 아닙니다. <span style="color: rgb(130, 170, 255); font-weight: 500;">치열하게 고민하는 동료의 모습</span>은 가장 강력한 동기부여가 되고, 막막했던 문제의 힌트는 <span style="color: rgb(130, 170, 255); font-weight: 500;">바로 옆자리</span>에서 얻을 수 있습니다.</p>

        <div style="background: linear-gradient(135deg, rgba(195, 232, 141, 0.1), rgba(130, 170, 255, 0.1)); padding: 30px; border-radius: 12px; margin-top: 40px; text-align: center;">
          <span style="font-size: 24px;">✨</span><br/>
          <p style="margin-top: 16px; font-size: 18px;">우리가 함께 만드는 건 코드 그 이상의 <strong style="color: rgb(195, 232, 141);">\'성장하는 환경\'</strong><br/>
          그리고 그 안에서 발견할 <strong style="color: rgb(130, 170, 255);">\'어제보다 나은 나\'</strong> 입니다.</p>
        </div>
      `,
      alignment: 'left',
      backgroundColor: '#0a0a0a'
    },
    members: {
      tagHeader: '함께 성장하는 동료들',
      title: '지금 이 순간에도 <span style="color: #C3E88D;">15명</span>이 <span style="color: #89DDFF;">각자의 목표</span>를 향해 달리고 있어요',
      subtitle: '작은 성취가 모여 큰 변화를 만듭니다',
      layout: 'carousel',
      studyType: 'development',
      members: [
        {
          name: '김서진',
          role: '백엔드 개발자',
          imageUrl: '/images/member1.jpg',
          joinDate: '2024-09-24',
          tagline: '사이드 프로젝트 3개째 진행중 🚀',
          streak: 8,
          solvedProblems: 45,
          memorableProblem: 'Spring Security + JWT 인증 구현',
          currentFocus: 'MSA 아키텍처 학습',
          whatIGained: '혼자였다면 포기했을 프로젝트를 완성했어요',
          customFields: [
            { label: '이번 주 목표', value: 'API 서버 배포하기', icon: '🎯' },
            { label: '진행률', value: '75%', icon: '📊' }
          ],
          badges: [{ type: 'streak', label: '개근왕', icon: '🔥' }],
          isActive: true,
          lastActivity: '1일 전'
        },
        {
          name: '이준호',
          role: '프론트엔드 개발자',
          imageUrl: '/images/member2.jpg',
          joinDate: '2024-09-24',
          tagline: '리액트 딥다이브 중 📚',
          streak: 7,
          solvedProblems: 120,
          memorableProblem: 'Next.js 13 마이그레이션',
          currentFocus: '성능 최적화',
          whatIGained: '매주 수요일이 기다려져요',
          customFields: [
            { label: '이번 주 목표', value: 'Lighthouse 100점 달성', icon: '🎯' },
            { label: '진행률', value: '60%', icon: '📊' }
          ],
          badges: [{ type: 'achievement', label: '우수 멤버', icon: '🏆' }],
          isActive: true,
          lastActivity: '2일 전'
        },
        {
          name: '박지민',
          role: 'iOS 개발자',
          imageUrl: '/images/member3.jpg',
          joinDate: '2024-10-01',
          tagline: '첫 앱 출시 도전! 📱',
          streak: 5,
          solvedProblems: 30,
          memorableProblem: 'SwiftUI 애니메이션 구현',
          currentFocus: '앱스토어 출시 준비',
          whatIGained: '막막했던 iOS 개발이 재밌어졌어요',
          customFields: [
            { label: '이번 주 목표', value: '앱 심사 제출', icon: '🎯' },
            { label: '진행률', value: '90%', icon: '📊' }
          ],
          badges: [{ type: 'special', label: '신입 멤버', icon: '🌟' }],
          isActive: true,
          lastActivity: '방금 전'
        }
      ],
      showStats: true,
      stats: {
        totalMembers: 15,
        activeMembers: 13,
        totalHours: 240,
        totalProblems: 512,
        participationRate: 87,
        popularAlgorithms: ['React', 'Spring', 'Algorithm', 'Docker'],
        customStats: [
          { label: '완성된 프로젝트', value: '8개', icon: '🎉' },
          { label: '이번 주 커밋', value: '342개', icon: '💻' }
        ]
      },
      weeklyMvp: '김서진'
    },
    howWeRoll: {
      title: '모임 상세 안내',
      subtitle: '<span style="color: #FFCB6B;">특별한 계획은 없어요.</span><br/>그저 수요일 밤을 각자의 작업으로 불태울 뿐이에요.',
      tagHeader: '우리의 방식',
      scheduleIntro: '',
      subHeading: '수요일 밤의 2시간, 어떻게 채워질까요?',
      closingMessage: '<p style="text-align: center; font-size: 20px; color: #C3E88D; font-weight: 600; margin-top: 40px;">이 치열한 성장의 여정에 당신을 초대합니다.</p>',
      meetingOverview: [
        {
          icon: '📅',
          title: '스터디 기간',
          highlight: '9월 24일부터 8주간 진행',
          description: '(추석 등 공휴일은 협의 하에 휴식)',
          type: 'period',
          link: ''
        },
        {
          icon: '🏢',
          title: '정기 모임',
          highlight: '매주 수요일 저녁 8:00 ~ 10:00',
          description: '강남역 인근 스터디룸 (매주 장소 공지)',
          type: 'location',
          link: ''
        },
        {
          icon: '💰',
          title: '참여 비용',
          highlight: '50,000원 (8주)',
          description: '스터디룸 대관 및 운영비에 사용됩니다.',
          type: 'fee',
          link: ''
        }
      ],
      schedule: [
        {
          time: '20:00 ~ 20:15',
          activity: '목표 공유 및 스몰톡',
          detail: '오늘 할 작업과 목표를 공유하고, 지난 한 주간의 회고를 나눠요.',
          type: 'primary'
        },
        {
          time: '20:15 ~ 21:45',
          activity: '몰입 작업 타임',
          detail: '오롯이 각자의 목표에만 집중하는 시간. 정적 속에서 타오르는 열기를 느껴보세요.',
          type: 'primary'
        },
        {
          time: '21:45 ~ 22:00',
          activity: '마무리 및 질의응답',
          detail: '오늘 이룬 것, 어려웠던 점을 자유롭게 공유하고 다음 주를 기약해요.',
          type: 'secondary'
        }
      ]
    },
    journey: {
      tagHeader: '우리의 성장 로드맵',
      title: '하루하루 작업을 쌓아, <span style="color: #C3E88D;">의미 있는 변화</span>를 만들어가요.',
      subtitle: '각자의 속도로, 함께의 힘으로.',
      startDate: '2024-09-24',
      calculateDays: true,
      generations: [
        {
          title: '🌱 1단계: 씨앗 (Seed)',
          description: '성장의 기반 다지기',
          icon: '🌱',
          achievements: [
            '각자의 학습 목표(알고리즘, 프로젝트 등) 설정',
            '꾸준한 작업 습관 형성',
            '시간 관리 및 집중력 향상 훈련'
          ],
          status: 'completed'
        },
        {
          title: '🔥 2단계: 새싹 (Sprout)',
          description: '가시적인 성장',
          icon: '🔥',
          achievements: [
            '목표에 대한 중간 결과물 도출',
            '동료 코드 리뷰 및 피드백을 통한 성장 가속화',
            '기술 블로그, 깃허브 등을 통한 학습 내용 정리 및 공유'
          ],
          status: 'ongoing'
        },
        {
          title: '🌳 3단계: 나무 (Tree)',
          description: '자립적 성장',
          icon: '🌳',
          achievements: [
            '개인 프로젝트 완성 또는 목표 알고리즘 수준 달성',
            '스터디 내 미니 세미나를 통한 지식 공유',
            '다음 스텝을 위한 새로운 목표 설정'
          ],
          status: 'planned'
        }
      ],
      closingMessage: '<p style="text-align: center; font-style: italic; color: #888; margin-top: 30px;">작은 씨앗이 모여 울창한 숲을 이루기까지.</p>',
      showStats: false
    },
    experience: {
      tagHeader: '성장을 위한 사이클',
      title: '<span style="color: #89DDFF;">모각업</span>에서는 <span style="color: #C3E88D;">계획-몰입-공유</span>의 사이클로 함께 성장해요.',
      subtitle: '',
      highlightText: '',
      steps: [
        {
          label: '1',
          title: '계획하고 (Plan)',
          description: '오늘 할 작업을 정하고, 시간 내 목표를 설정해요.',
          illustrationType: 'problem'
        },
        {
          label: '2',
          title: '몰입하고 (Immerse)',
          description: '정해진 시간 동안 오롯이 각자의 목표에만 집중해요.',
          illustrationType: 'explore'
        },
        {
          label: '3',
          title: '공유해요 (Share)',
          description: '막혔던 부분, 새롭게 알게 된 인사이트를 동료들과 나눠요.',
          illustrationType: 'review'
        }
      ],
      theme: 'modern',
      layout: 'horizontal',
      enableAnimation: true,
      animationType: 'fadeIn',
      defaultActiveStep: null,
      navigationStyle: 'numbers',
      autoProgress: false,
      primaryColor: '#C3E88D',
      secondaryColor: '#89DDFF',
      mobileCollapse: false
    },
    faq: {
      title: 'FAQ',
      tagHeader: '자주 묻는 질문',
      showIcons: true,
      showJoinCTA: true,
      joinTitle: '당신의 레벨업을 기다립니다!',
      joinDescription: '',
      joinButtonText: '스터디 합류하기 🚀',
      kakaoOpenChatUrl: 'https://open.kakao.com/o/example',
      items: [
        {
          question: 'Q. 어떤 사람들이 함께하나요?',
          answer: '다양한 목표를 가진 개발자(준비생)들이 함께하고 있어요. 실력보다 중요한 것은 \'성장하고 싶은 열정\'과 \'꾸준히 참여하려는 의지\'입니다.',
          category: 'participant'
        },
        {
          question: 'Q. 모임은 언제, 어디서 진행되나요?',
          answer: '매주 수요일 저녁 8시부터 10시까지, 강남역 인근 스터디룸에서 진행됩니다. 상세 장소는 매주 슬랙 채널을 통해 공지됩니다.',
          category: 'schedule'
        },
        {
          question: 'Q. 스터디 비용은 왜 있나요?',
          answer: '참여 비용은 쾌적한 스터디 환경을 위한 스터디룸 대관비로 전액 사용됩니다. 함께 몰입할 공간을 확보하고, 모두의 책임감 있는 참여를 독려하기 위함입니다.',
          category: 'fee'
        },
        {
          question: 'Q. 코딩을 잘 못하는데, 참여할 수 있을까요?',
          answer: '물론입니다! 모각업은 결과물보다 \'포기하지 않고 끝까지 고민하는 경험\'을 더 중요하게 생각해요. 서로의 성장을 응원하고 도울 준비가 된 분이라면 누구든 환영합니다.',
          category: 'skill'
        }
      ]
    },
    review: {
      enabled: true,
      tagHeader: '진짜 후기',
      title: '<span style="color: #C3E88D;">함께한 동료들</span>의 솔직한 이야기',
      subtitle: '성장은 숫자로 증명되지 않아요. 우리의 이야기를 들어보세요.',
      showKeywords: true,
      keywords: ['성장', '꾸준함', '동기부여', '몰입', '네트워킹'],
      displayCount: 3,
      sortBy: 'latest',
      showStats: true,
      reviews: [
        {
          id: 'review-1',
          userId: 'user-1',
          userName: '김민수',
          rating: 5,
          title: '퇴사 후 방황하던 제게 리듬을 찾아준 곳',
          content: '개발자로 전직을 준비하며 혼자 공부하다가 지쳐있었는데, 모각업을 만나고 다시 페이스를 찾았어요. 매주 수요일이 기다려지는 건 처음이에요!',
          createdAt: '2024-11-20',
          attendCount: 8,
          helpfulCount: 15,
          tags: [
            { id: 'tag-1', category: 'ATMOSPHERE', label: '동기부여', emoji: '💪', description: '동기부여' },
            { id: 'tag-2', category: 'CONTENT', label: '꾸준함', emoji: '🔥', description: '꾸준함' }
          ],
          timeAgo: '3일 전'
        },
        {
          id: 'review-2',
          userId: 'user-2',
          userName: '이지은',
          rating: 5,
          title: '집에선 넷플릭스만 보던 토요일이 가장 생산적인 날이 되었어요',
          content: '원래는 수요일이었는데 제 말 실수입니다ㅎㅎ 아무튼! 정해진 시간에 정해진 장소에서 만난다는 단순한 규칙이 이렇게 큰 변화를 가져올 줄 몰랐어요.',
          createdAt: '2024-11-15',
          attendCount: 7,
          helpfulCount: 12,
          tags: [
            { id: 'tag-3', category: 'ATMOSPHERE', label: '몰입', emoji: '🎯', description: '몰입' },
            { id: 'tag-4', category: 'CONTENT', label: '성장', emoji: '🌱', description: '성장' }
          ],
          timeAgo: '1주일 전'
        },
        {
          id: 'review-3',
          userId: 'user-3',
          userName: '박준영',
          rating: 5,
          title: '여기서 만든 프로젝트로 이직에 성공했습니다!',
          content: '8주 동안 꾸준히 참여하며 만든 사이드 프로젝트가 포트폴리오의 핵심이 되었어요. 무엇보다 함께 성장하는 동료들을 만난 게 가장 큰 수확입니다.',
          createdAt: '2024-11-10',
          attendCount: 8,
          helpfulCount: 25,
          tags: [
            { id: 'tag-5', category: 'OUTCOME', label: '취업성공', emoji: '🎉', description: '취업성공' },
            { id: 'tag-6', category: 'ATMOSPHERE', label: '네트워킹', emoji: '🤝', description: '네트워킹' }
          ],
          timeAgo: '2주일 전'
        }
      ]
    }
  }
};
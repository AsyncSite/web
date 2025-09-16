// 알고리즘 스터디 템플릿 데이터
// 테코테코 스타일 알고리즘 스터디 템플릿

export interface StudyTemplate {
  id: string;
  name: string;
  sections: {
    hero?: {
      title: string;
      subtitle: string;
      description: string;
      buttonText: string;
      buttonLink: string;
      backgroundImage: string;
      infoBox?: {
        header: string;
        items: Array<{
          icon: string;
          text: string;
        }>;
      };
    };
    faq?: {
      title: string;
      tagHeader: string;
      showIcons: boolean;
      showJoinCTA: boolean;
      joinTitle: string;
      joinDescription: string;
      joinButtonText: string;
      kakaoOpenChatUrl: string;
      items: Array<{
        question: string;
        answer: string;
        category: string;
      }>;
    };
    experience?: {
      tagHeader?: string;
      title: string;
      subtitle?: string;
      highlightText?: string;
      steps: Array<{
        label: string;
        title: string;
        description: string;
        illustrationType?: 'problem' | 'question' | 'explore' | 'review' | 'grow' | 'custom';
        customSvg?: string;
      }>;
      theme?: string;
      layout?: 'horizontal' | 'vertical' | 'grid';
      enableAnimation?: boolean;
      animationType?: 'fadeIn' | 'slideUp' | 'scale';
      defaultActiveStep?: number | null;
      navigationStyle?: 'numbers' | 'dots' | 'progress' | 'timeline';
      autoProgress?: boolean;
      autoProgressInterval?: number;
      primaryColor?: string;
      secondaryColor?: string;
      mobileCollapse?: boolean;
    };
    howWeRoll?: {
      title: string;
      subtitle?: string;
      tagHeader?: string;
      scheduleIntro?: string;
      subHeading?: string;
      closingMessage?: string;
      meetingOverview: Array<{
        icon: string;
        title: string;
        highlight: string;
        description?: string;
        subNote?: string;
        type: string;
        link?: string;
      }>;
      schedule: Array<{
        time: string;
        activity: string;
        detail: string;
        type: 'primary' | 'secondary';
      }>;
    };
    journey?: {
      tagHeader?: string;
      title?: string;
      subtitle?: string;
      closingMessage?: string;
      startDate?: string;
      calculateDays?: boolean;
      generations: Array<{
        title: string;
        description: string;
        icon?: string;
        achievements?: string[];
        status?: 'completed' | 'ongoing' | 'planned';
      }>;
      showStats?: boolean;
      stats?: {
        totalProblems?: string | number;
        studyHours?: string | number;
        memberGrowth?: string;
      };
      theme?: string;
      layout?: string;
      showAchievements?: boolean;
      showIcons?: boolean;
    };
    review?: {
      enabled: boolean;
      tagHeader: string;
      title: string;
      subtitle: string;
      showStats: boolean;
      displayCount: number;
      sortBy: string;
      showKeywords: boolean;
      keywords: string[];
      reviews: Array<{
        id: string;
        userId: string;
        userName: string;
        rating: number;
        title: string;
        content: string;
        createdAt: string;
        attendCount: number;
        helpfulCount: number;
        tags: Array<{
          id: string;
          emoji: string;
          label: string;
          category: string;
          description: string;
        }>;
        timeAgo: string;
      }>;
    };
    members?: {
      tagHeader: string;
      title: string;
      subtitle: string;
      layout: string;
      studyType: string;
      showStats: boolean;
      weeklyMvp: string;
      stats: {
        totalMembers: number;
        activeMembers: number;
        totalHours: number;
        totalProblems: number;
        participationRate: number;
        popularAlgorithms: string[];
        customStats: Array<{
          label: string;
          value: string;
          icon: string;
        }>;
      };
      members: Array<{
        userId?: string;
        name: string;
        role: string;
        imageUrl?: string;
        joinDate?: string;
        tagline?: string;
        streak?: number;
        solvedProblems?: number;
        memorableProblem?: string;
        currentFocus?: string;
        whatIGained?: string;
        testimonial?: string;
        from?: string;
        recentActivity?: string;
        customFields?: Array<{
          label: string;
          value: string;
          icon: string;
        }>;
        badges?: Array<{
          type: string;
          label: string;
          icon: string;
        }>;
        isActive?: boolean;
        lastActivity?: string;
      }>;
    };
    richText?: {
      title: string;
      content: string;
      alignment: string;
      backgroundColor: string;
    };
    leaderIntro?: {
      name: string;
      profileImage: string;
      role: string;
      motivation: string;
      philosophy: string;
      welcomeMessage: string;
      expertise: string[];
      since: string;
      totalStudies: number;
      totalMembers: number;
      email: string;
      github: string;
      blog: string;
    };
  };
}

// 알고리즘 스터디 템플릿 (테코테코 - 복구된 고품질 데이터)
export const algorithmTemplate: StudyTemplate = {
  id: 'algorithm',
  name: '알고리즘 스터디 템플릿',
  sections: {
    hero: {
      title: '💯 코테 스터디<br/>테코테코',
      subtitle: '변화 속에서<br/><span class="highlight">변치 않는 ____를 찾다</span>',
      description: '기술 변화 속 흔들리지 않는 개발자 사고의 뿌리를 탐구하고, 단순한 코딩 테스트를 넘어 자료구조와 알고리즘의 본질에 Deep Dive합니다.',
      buttonText: '참가 신청하기',
      buttonLink: '#apply',
      backgroundImage: '/images/tecoteco/profile1.svg',
      infoBox: {
        header: '함께 성장할 용기',
        items: [
          {
            icon: '💡',
            text: '기술 변화 속 흔들리지 않는 <span class="subtle-highlight" style="color: rgb(130, 170, 255)">개발자 사고의 뿌리</span>를 탐구해요.'
          },
          {
            icon: '📚',
            text: '단순한 코딩 테스트 넘어, 자료구조와 알고리즘의 <span class="highlight" style="color: rgb(255, 234, 0)">본질에 Deep Dive</span> 해요.'
          },
          {
            icon: '🤝',
            text: '서로의 질문이 해답이 되고, <span class="subtle-highlight" style="color: rgb(130, 170, 255)">함께 성장</span>하는 시너지를 경험해요.'
          }
        ]
      }
    },
    faq: {
      title: 'FAQ',
      tagHeader: '궁금증 해결',
      showIcons: true,
      showJoinCTA: true,
      joinTitle: '당신의 합류를 기다려요!',
      joinDescription: '',
      joinButtonText: '리더에게 커피챗 요청하기 ☕',
      kakaoOpenChatUrl: 'https://open.kakao.com/o/example',
      items: [
        {
          question: '이 스터디는 어떤 스터디인가요?',
          answer: '코딩 테스트 완전 정복을 목표로 하는 알고리즘 스터디입니다. 단순히 문제를 푸는 것을 넘어, 논리적 사고력과 커뮤니케이션 역량 강화를 지향합니다.',
          category: ''
        },
        {
          question: '모임은 언제, 어디서 진행되나요?',
          answer: '매주 금요일 저녁 7:30 ~ 9:30에 강남역 인근 스터디룸에서 오프라인 모임을 중심으로 진행됩니다. 상황에 따라 온라인(Discord)으로 전환될 수 있습니다.',
          category: ''
        },
        {
          question: '스터디 비용은 어떻게 되나요?',
          answer: '스터디룸 대관료는 참석자끼리 N/1로 정산합니다. 별도의 회비나 멤버십 비용은 없습니다.',
          category: ''
        },
        {
          question: '참여하려면 어떻게 해야 하나요?',
          answer: '현재는 공식 모집은 진행하고 있지 않아요. 관심 있으신 분들은 @renechoi에게 커피챗을 요청해주시면 참여 방법을 안내해 드립니다.',
          category: ''
        },
        {
          question: '코딩 테스트 실력이 부족해도 참여할 수 있나요?',
          answer: '네, 실력에 관계없이 누구나 참여할 수 있습니다. 함께의 가치를 중요하게 생각하며, 서로 돕고 배우며 성장할 수 있는 환경을 지향합니다.',
          category: ''
        }
      ]
    },
    howWeRoll: {
      title: '특별한 건 없어요.<br/>그냥 계속 모일 뿐이에요.',
      subtitle: '꾸준함이 만드는 <span style="color: #c3e88d;">작은 기적</span>들',
      tagHeader: '모임 상세 안내',
      scheduleIntro: '금요일 저녁의 <span style="color: #c3e88d;">2시간</span>은 몰입하기 딱 좋은 시간인 것 같아요.',
      subHeading: '몰입, 해본 적 있으세요?',
      closingMessage: '우리가 함께 만들어가는 <span style="color: #c3e88d;">성장의 여정</span>에 당신도 함께해요.',
      meetingOverview: [
        {
          icon: '📅',
          title: '스터디 기간',
          highlight: '9월 19일부터 8주간',
          description: '매주 진행하며 10월 3일, 10일은 휴식 주간입니다',
          type: 'study-period'
        },
        {
          icon: '🏢',
          title: '정기 모임',
          highlight: '매주 금요일 저녁 7:30 ~ 9:30',
          description: '강남역 인근 스터디룸에서 만나 오프라인 중심으로 진행해요',
          subNote: '상황에 따라 온라인(Discord)으로도 진행합니다',
          type: 'main-meeting'
        },
        {
          icon: '📚',
          title: '함께 공부하는 교재',
          highlight: '코딩 테스트 합격자 되기: 자바 편',
          description: '온라인 저지는 백준, 프로그래머스를 활용하고 있어요',
          type: 'study-material',
          link: 'https://product.kyobobook.co.kr/detail/S000212576322'
        },
        {
          icon: '💰',
          title: '참여 비용',
          highlight: '스터디룸 대관료 1/N 정산',
          type: 'cost-info'
        }
      ],
      schedule: [
        {
          time: '19:30 ~ 20:20',
          activity: '이론/코드 리뷰',
          detail: '선정된 리뷰어의 깊이 있는 주제/문제 발표',
          type: 'primary' as const
        },
        {
          time: '20:20 ~ 20:30',
          activity: '잠깐의 휴식 & 자유로운 네트워킹',
          detail: '커피 한 잔과 함께하는 소소한 대화',
          type: 'secondary' as const
        },
        {
          time: '20:30 ~ 21:30',
          activity: '함께 문제 풀이',
          detail: '실시간으로 머리를 맞대고 해결하는 문제들',
          type: 'primary' as const
        }
      ]
    },
    /* OLD JOURNEY REMOVED - using new template data below
    journey_old: {
      title: '12주 여정',
      items: [
        {
          week: '1-2주차',
          title: '기초 다지기',
          description: '자료구조와 기본 알고리즘 복습',
          assignments: [
            '배열, 문자열 조작 마스터',
            '시간 복잡도 분석 연습',
            '기초 정렬 알고리즘 구현'
          ]
        },
        {
          week: '3-4주차',
          title: '탐색과 정렬',
          description: '효율적인 탐색과 정렬 알고리즘 학습',
          assignments: [
            '이진 탐색 완벽 이해',
            '퀵소트, 머지소트 구현',
            'Two Pointer, Sliding Window'
          ]
        },
        {
          week: '5-6주차',
          title: '자료구조 심화',
          description: '스택, 큐, 트리, 그래프 마스터',
          assignments: [
            '스택/큐 응용 문제',
            '트리 순회와 탐색',
            '그래프 표현과 기초 탐색'
          ]
        },
        {
          week: '7-8주차',
          title: '그래프 알고리즘',
          description: 'DFS, BFS와 최단 경로 알고리즘',
          assignments: [
            'DFS/BFS 완벽 구현',
            '다익스트라, 벨만-포드',
            '위상 정렬과 사이클 탐지'
          ]
        },
        {
          week: '9-10주차',
          title: '동적 계획법',
          description: 'DP의 원리와 다양한 적용',
          assignments: [
            'Top-down vs Bottom-up',
            '대표 DP 패턴 학습',
            '최적화 문제 해결'
          ]
        },
        {
          week: '11-12주차',
          title: '실전 준비',
          description: '기업 코딩 테스트 대비',
          assignments: [
            '기업별 기출 문제 풀이',
            '시간 관리 전략 수립',
            '최종 모의고사 및 회고'
          ]
        }
      ]
    }, */
    review: {
      enabled: true,
      tagHeader: '솔직한 후기',
      title: '가장 진솔한 이야기, <br /> 멤버들의 목소리 🗣️',
      subtitle: '숫자와 코드만으로는 설명할 수 없는 <span class="highlight">우리 모임의 진짜 가치</span>를 들어보세요.',
      showStats: false,
      displayCount: 3,
      sortBy: 'latest',
      showKeywords: true,
      keywords: [
        '😌 편안한 분위기',
        '💥 사고의 확장',
        '🤗 배려왕 멤버',
        '🥳 즐거운 분위기',
        '📝 꼼꼼한 코드 리뷰',
        '👩‍💻 실전 코딩',
        '🧠 논리적 사고력',
        '🗣️ 커뮤니케이션 역량',
        '🤖 AI 활용',
        '🌱 함께 성장'
      ],
      reviews: [
        {
          id: 'standard-1',
          userId: 'user1',
          userName: '익명1',
          rating: 5,
          title: '인생의 의미',
          content: '누가 시킨것도 ..부자가 되는 것도 아닌데 코딩테스트 문제를 풀고 바쁜 일상을 탈탈 털어 진지한 이야기를 나눈 소중한 경험',
          createdAt: '2024-02-15',
          attendCount: 3,
          helpfulCount: 2,
          tags: [
            { id: 'growth', emoji: '😃', label: '성장', category: 'GROWTH', description: '' },
            { id: 'spark', emoji: '✨', label: '영감', category: 'GROWTH', description: '' },
            { id: 'passion', emoji: '🔥', label: '열정', category: 'MENTORING', description: '' }
          ],
          timeAgo: '6달 전'
        },
        {
          id: 'standard-2',
          userId: 'user2',
          userName: '익명2',
          rating: 5,
          title: 'Better together !',
          content: '혼자서는 엄두도 못 냈던 어려운 알고리즘 문제들! 스터디 모임에서 함께 고민하고 해결하며 완독하는 뿌듯함을 느꼈습니다. 함께라면 우린 해낼 수 있어요!',
          createdAt: '2023-08-10',
          attendCount: 10,
          helpfulCount: 1,
          tags: [
            { id: 'teamwork', emoji: '🧡', label: '팀워크', category: 'COMMUNITY', description: '' },
            { id: 'love', emoji: '😍', label: '사랑', category: 'ATMOSPHERE', description: '' },
            { id: 'happy', emoji: '😃', label: '행복', category: 'ATMOSPHERE', description: '' }
          ],
          timeAgo: '2년 전'
        },
        {
          id: 'standard-3',
          userId: 'user3',
          userName: '김코딩',
          rating: 5,
          title: '알고리즘 실력이 확실히 늘었어요',
          content: 'DP, 그래프, BFS/DFS... 막막하기만 했던 알고리즘들이 이제는 패턴이 보이기 시작해요. 매주 금요일이 기다려지는 스터디입니다!',
          createdAt: '2024-10-15',
          attendCount: 8,
          helpfulCount: 5,
          tags: [
            { id: 'skill', emoji: '💪', label: '실력향상', category: 'GROWTH', description: '' },
            { id: 'pattern', emoji: '🎯', label: '패턴인식', category: 'LEARNING', description: '' },
            { id: 'excited', emoji: '🎉', label: '기대감', category: 'ATMOSPHERE', description: '' }
          ],
          timeAgo: '1달 전'
        },
        {
          id: 'standard-4',
          userId: 'user4',
          userName: '박개발',
          rating: 5,
          title: '코딩테스트 합격했습니다!',
          content: '스터디에서 배운 문제 해결 접근법과 시간 복잡도 최적화 덕분에 드디어 코딩테스트를 통과했어요. 함께 고민해주신 모든 분들께 감사드립니다.',
          createdAt: '2024-11-20',
          attendCount: 12,
          helpfulCount: 8,
          tags: [
            { id: 'success', emoji: '🎊', label: '합격', category: 'PRACTICAL', description: '' },
            { id: 'grateful', emoji: '🙏', label: '감사', category: 'COMMUNITY', description: '' },
            { id: 'optimization', emoji: '⚡', label: '최적화', category: 'LEARNING', description: '' }
          ],
          timeAgo: '2주 전'
        }
      ]
    },
    members: {
      tagHeader: '함께하는 멤버들이에요',
      title: '더 멋진 여정이 펼쳐질 거예요,<br/>함께라면.',
      subtitle: '',
      layout: 'carousel',
      studyType: 'algorithm',
      showStats: true,
      weeklyMvp: 'renechoi',
      stats: {
        totalMembers: 8,
        activeMembers: 6,
        totalHours: 180,
        totalProblems: 1247,
        participationRate: 85,
        popularAlgorithms: ['DP', '그래프', '이분탐색', '그리디'],
        customStats: [
          { label: '총 해결한 문제', value: '1247', icon: '💡' },
          { label: '평균 참여율', value: '85%', icon: '📊' },
          { label: '인기 알고리즘', value: 'DP, 그래프, 이분탐색, 그리디', icon: '🏆' }
        ]
      },
      members: [
        {
          userId: 'renechoi@example.com',
          name: 'renechoi',
          role: '스터디 리더',
          imageUrl: '/images/face/rene.png',
          joinDate: '2024-10-01',
          tagline: '모임을 처음 시작한 사람 🏆',
          streak: 15,
          solvedProblems: 342,
          memorableProblem: '백준 11053 - 가장 긴 증가하는 부분 수열',
          currentFocus: '고급 DP 문제와 팀 빌딩 스킬',
          whatIGained: 'DP의 최적화 방법과 스터디 운영의 노하우를 얻었어요',
          testimonial: '리더십과 알고리즘 실력 모두 뛰어나요!',
          from: 'kdelay',
          recentActivity: '1일 전 활동',
          customFields: [
            { label: '해결한 문제', value: '342', icon: '✅' },
            { label: '연속 참여', value: '15일', icon: '🔥' },
            { label: '주력 분야', value: '고급 DP', icon: '📚' }
          ],
          badges: [
            { type: 'mvp', label: '이주의 MVP', icon: '👑' }
          ],
          isActive: true,
          lastActivity: '1일 전'
        },
        {
          name: 'kdelay',
          role: '코드 리뷰어',
          imageUrl: '/images/face/kdelay.png',
          joinDate: '2024-11-01',
          tagline: '꼼꼼한 코드 리뷰어 📝',
          streak: 12,
          solvedProblems: 298,
          memorableProblem: '백준 1932 - 정수 삼각형',
          currentFocus: '트리 DP와 멘토링 스킬 마스터하기',
          whatIGained: 'DP의 진정한 의미를 깨달았고, 코드 리뷰 스킬을 키웠어요',
          testimonial: '꼼꼼한 리뷰로 모두의 실력 향상에 기여해요!',
          from: 'KrongDev',
          recentActivity: '2일 전 활동',
          customFields: [
            { label: '해결한 문제', value: '298', icon: '✅' },
            { label: '연속 참여', value: '12일', icon: '🔥' },
            { label: '주력 분야', value: '트리 DP', icon: '📚' }
          ],
          badges: [
            { type: 'streak', label: '개근왕', icon: '🔥' }
          ],
          isActive: true,
          lastActivity: '2일 전'
        },
        {
          name: 'KrongDev',
          role: '문제 해결사',
          imageUrl: 'https://avatars.githubusercontent.com/u/138358867?s=40&v=4',
          joinDate: '2024-11-01',
          tagline: '알고리즘 문제 해결사 💬',
          streak: 8,
          solvedProblems: 156,
          memorableProblem: '프로그래머스 - 네트워크',
          currentFocus: '최단경로 알고리즘과 문제 분석 능력',
          whatIGained: 'DFS/BFS를 완전히 이해하게 됐고, 문제 해결 패턴을 익혔어요',
          testimonial: '어려운 문제도 차근차근 해결하는 능력이 대단해요!',
          from: 'renechoi',
          recentActivity: '1일 전 활동',
          customFields: [
            { label: '해결한 문제', value: '156', icon: '✅' },
            { label: '연속 참여', value: '8일', icon: '🔥' },
            { label: '주력 분야', value: '그래프', icon: '📚' }
          ],
          isActive: true,
          lastActivity: '1일 전'
        },
        {
          name: '탁형',
          role: '멘토',
          imageUrl: '/images/face/xxx.png',
          joinDate: '2024-11-01',
          tagline: '복잡한 개념도 쉽게 설명하는 멘토 📚',
          streak: 6,
          solvedProblems: 89,
          memorableProblem: '백준 9019 - DSLR',
          currentFocus: '세그먼트 트리와 설명 스킬 도전',
          whatIGained: 'BFS 최적화 방법을 터득했고, 설명하는 능력을 키웠어요',
          testimonial: '복잡한 개념도 쉽게 설명해주는 천재예요!',
          from: 'kdelay',
          recentActivity: '3일 전 활동',
          customFields: [
            { label: '해결한 문제', value: '89', icon: '✅' },
            { label: '연속 참여', value: '6일', icon: '🔥' },
            { label: '주력 분야', value: '세그먼트 트리', icon: '📚' }
          ],
          badges: [
            { type: 'special', label: '멘토', icon: '🌟' }
          ],
          isActive: false,
          lastActivity: '3일 전'
        },
        {
          name: '민수',
          role: '트렌드 탐험가',
          imageUrl: '/images/face/xxx.png',
          joinDate: '2024-10-15',
          tagline: '새로운 알고리즘 트렌드를 가져오는 탐험가 🔍',
          streak: 9,
          solvedProblems: 124,
          memorableProblem: '백준 2206 - 벽 부수고 이동하기',
          currentFocus: '고급 그래프 알고리즘 탐구',
          whatIGained: 'BFS와 상태 관리의 핵심을 이해했어요',
          testimonial: '새로운 접근법으로 모두를 놀라게 해요!',
          from: 'renechoi',
          recentActivity: '2일 전 활동',
          customFields: [
            { label: '해결한 문제', value: '124', icon: '✅' },
            { label: '연속 참여', value: '9일', icon: '🔥' },
            { label: '주력 분야', value: '고급 그래프', icon: '📚' }
          ],
          isActive: true,
          lastActivity: '2일 전'
        },
        {
          name: '지영',
          role: '분위기 메이커',
          imageUrl: '/images/face/xxx.png',
          joinDate: '2024-11-20',
          tagline: '분위기 메이커이자 팀워크의 핵심 🎉',
          streak: 11,
          solvedProblems: 187,
          memorableProblem: '프로그래머스 - 카카오톡 채팅방',
          currentFocus: '문자열 알고리즘과 소통 스킬',
          whatIGained: '문자열 처리와 팀워크의 중요성을 배웠어요',
          testimonial: '힘든 순간에도 웃음을 잃지 않는 에너지!',
          from: '탁형',
          recentActivity: '1일 전 활동',
          customFields: [
            { label: '해결한 문제', value: '187', icon: '✅' },
            { label: '연속 참여', value: '11일', icon: '🔥' },
            { label: '주력 분야', value: '문자열', icon: '📚' }
          ],
          isActive: true,
          lastActivity: '1일 전'
        },
        {
          name: '현우',
          role: '최적화 마법사',
          imageUrl: '/images/face/xxx.png',
          joinDate: '2025-01-20',
          tagline: '최적화 마법사, 효율성의 달인 ⚡',
          streak: 7,
          solvedProblems: 98,
          memorableProblem: '백준 1759 - 암호 만들기',
          currentFocus: '고급 최적화와 성능 분석',
          whatIGained: '백트래킹과 최적화 기법을 체득했어요',
          testimonial: '복잡한 문제도 효율적으로 해결하는 마법사!',
          from: 'kdelay',
          recentActivity: '1일 전 활동',
          customFields: [
            { label: '해결한 문제', value: '98', icon: '✅' },
            { label: '연속 참여', value: '7일', icon: '🔥' },
            { label: '주력 분야', value: '최적화', icon: '📚' }
          ],
          isActive: true,
          lastActivity: '1일 전'
        },
        {
          name: "who's next?",
          role: '미래의 멤버',
          imageUrl: '/images/face/another.png',
          tagline: '당신의 합류를 기다려요 👋',
          streak: 0,
          solvedProblems: 0,
          memorableProblem: '',
          currentFocus: '',
          whatIGained: '',
          testimonial: '',
          from: '',
          recentActivity: '',
          customFields: [],
          isActive: false
        }
      ]
    },
    richText: {
      title: '스터디 소개',
      content: `<h2 style="margin-bottom: 2rem;">변화하는 세상에서<br/>흔들리지 않을 '나'를 위한 스터디</h2>

<p>코딩과 지식의 가치가 흔해지는 시절입니다. AI가 순식간에 코드를 작성하고, 개발 도구들이 날마다 진화하는 지금. 개발자로서 우리가 정말 집중해야 할 것은 무엇일까요?</p>

<p>우리는 이런 질문에서 출발했습니다. 기술이 아무리 발달해도 <span style="color: rgb(195, 232, 141); font-weight: 600;">변하지 않는 개발자의 핵심 역량</span>이 있다고 믿거든요.</p>

<h3 style="margin-top: 2.5rem; margin-bottom: 1rem; color: rgb(195, 232, 141);">물고기를 잡는 방법을 익히는 것</h3>

<p>우리는 '물고기 그 자체'가 아닌, <span style="color: rgb(130, 170, 255); font-weight: 500;">'물고기를 잡는 방법'</span>에 집중합니다. 단순히 문제를 푸는 것을 넘어서, 문제의 본질을 이해하고 <span style="color: rgb(130, 170, 255); font-weight: 500;">견고한 사고력과 논리력</span>을 단련하는 것이 목표입니다.</p>

<p>매주 함께 모여 한 문제를 깊이 파고들고, 서로 다른 관점으로 접근해보며 사고의 폭을 넓혀갑니다. 왜 이 알고리즘을 선택했는지, 다른 방법은 없었는지, 이 문제에서 배울 수 있는 더 큰 인사이트는 무엇인지 함께 고민해요.</p>

<h3 style="margin-top: 2.5rem; margin-bottom: 1rem; color: rgb(195, 232, 141);">물고기를 '잘' 잡는 방법을 모색하는 것</h3>

<p>AI를 배척하지 않고 <span style="color: rgb(130, 170, 255); font-weight: 500;">현명하게 활용하는 방법</span>을 함께 모색합니다. AI와 페어 코딩하고, 비판적으로 분석하며 코드를 개선합니다. AI가 <span style="color: rgb(130, 170, 255); font-weight: 500;">우리의 통찰력을 확장시키는 강력한 파트너</span>가 될 수 있음을 증명해나가고 있어요.</p>

<div class="study-management-richtext-info-box">
  <div class="study-management-richtext-info-header">💡 핵심 포인트</div>
  <div class="study-management-richtext-info-content">
    <div class="study-management-richtext-info-item">
      <span class="study-management-richtext-info-icon">📌</span>
      <span class="study-management-richtext-info-text">단순 암기가 아닌 <span class="study-management-richtext-highlight">사고력 향상</span></span>
    </div>
    <div class="study-management-richtext-info-item">
      <span class="study-management-richtext-info-icon">🎯</span>
      <span class="study-management-richtext-info-text">AI와의 <span class="study-management-richtext-highlight">협업 능력</span> 개발</span>
    </div>
    <div class="study-management-richtext-info-item">
      <span class="study-management-richtext-info-icon">🚀</span>
      <span class="study-management-richtext-info-text">변화에 흔들리지 않는 <span class="study-management-richtext-highlight">개발자 핵심 역량</span></span>
    </div>
  </div>
</div>

<p style="margin-top: 3rem; text-align: center; font-size: 1.1rem;">우리가 찾는 건 변화 속에서도 <span style="color: rgb(195, 232, 141); font-weight: 600;">흔들리지 않을 '나'</span><br/>생각하는 힘이에요.</p>`,
      alignment: 'left',
      backgroundColor: 'transparent'
    },
    leaderIntro: {
      name: '김개발',
      profileImage: '/images/face/leader-example.png',
      role: '실패를 두려워하지 않는 10년차 개발자',
      motivation: '혼자 공부하다 막막했던 순간들을 기억합니다. <strong>함께라면 더 멀리 갈 수 있다</strong>는 믿음으로 이 공간을 만들었어요.',
      philosophy: '정답을 알려주기보다 <strong>스스로 생각하는 힘</strong>을 기르는 것을 중요하게 생각합니다.',
      welcomeMessage: '완벽하지 않아도 괜찮아요. <strong>꾸준히 노력하는 것</strong>이 가장 중요합니다. 편하게 질문하고, 자유롭게 의견을 나누어요! 🚀',
      expertise: ['도전', '성장', '공유'],
      since: '2022년 1월부터',
      totalStudies: 5,
      totalMembers: 67,
      email: 'leader@example.com',
      github: 'https://github.com/kimdev',
      blog: 'https://kimdev.blog'
    },
    journey: {
      tagHeader: '우리의 여정',
      title: '하루하루가 쌓이니 벌써 <span style="color: #c3e88d;">{days}</span>이 되었어요.',
      subtitle: '작은 시작이 모여 <span style="color: #c3e88d;">의미 있는 변화</span>를 만들어가고 있어요.<br/>각자의 속도로, <span style="color: #82aaff;">함께의 힘</span>으로.',
      closingMessage: '작은 걸음이지만 <span style="color: #c3e88d;">꾸준히</span>, <span style="color: #82aaff;">의미 있게</span>.',
      startDate: new Date().toISOString().split('T')[0],
      calculateDays: true,
      generations: [
        {
          title: '시즌 1 (기초 다지기)',
          description: '자료구조의 기본기를 다지고, 알고리즘 문제 해결의 첫 발을 내디뎠습니다.',
          icon: '🌱',
          achievements: ['기본 자료구조 마스터', '문제 해결 패턴 습득', '팀워크 기반 다지기'],
          status: 'completed' as const
        },
        {
          title: '시즌 2 (기본 알고리즘)',
          description: '정렬, 탐색, 그래프 등 기본 알고리즘을 체계적으로 학습하며 문제 해결의 기초를 탄탄히 다졌습니다.',
          icon: '🚀',
          achievements: ['정렬 알고리즘 마스터', 'BFS/DFS 완벽 이해', '그래프 기초 정복'],
          status: 'completed' as const
        },
        {
          title: '시즌 3 (DP & 그리디)',
          description: '동적 계획법과 그리디 알고리즘을 집중적으로 학습하며, 최적화 문제 해결 능력을 극대화합니다.',
          icon: '💎',
          achievements: ['DP 완전 정복', '그리디 사고력 향상', '최적화 전략 마스터'],
          status: 'ongoing' as const
        }
      ],
      showStats: true,
      stats: {
        totalProblems: '100+',
        studyHours: '50+',
        memberGrowth: '평균 30% 향상'
      },
      theme: 'standard',
      layout: 'list',
      showAchievements: true,
      showIcons: true
    },
    experience: {
      tagHeader: '성장을 위한 스텝',
      title: '알고리즘 스터디를 <span style="color: #c3e88d;">한다는 건</span>',
      subtitle: '매주 모임을 통해 <span style="color: #82aaff;">이런 루틴으로</span> 함께 성장해요.',
      steps: [
        {
          label: '문제를 만나고',
          title: '새로운 도전, 익숙한 문제',
          description: '혼자서는 엄두 내지 못했던 문제들.<br/><span style="color: #82aaff;">함께라면</span> 그 문제들을 피하지 않고 마주하며 새로운 도전을 시작합니다.',
          illustrationType: 'problem' as const
        },
        {
          label: '질문하고',
          title: '멈추지 않는 호기심, 날카로운 질문',
          description: '막히는 지점에서 주저하지 않고 <span style="color: #c3e88d;">끝없이 질문</span>하며<br/>서로에게 배우고 이해의 폭을 넓힙니다.',
          illustrationType: 'question' as const
        },
        {
          label: '파고들고',
          title: '본질을 꾸뚛는 탐구',
          description: '단순히 정답을 아는 것을 넘어,<br/>문제의 <span style="color: #c3e88d;">본질과 원리</span>를 집요하게 파고듭니다.',
          illustrationType: 'explore' as const
        },
        {
          label: '리뷰하고',
          title: '성장을 위한 따뜻한 피드백',
          description: '서로의 코드를 읽고 배우며,<br/>더 나은 코드를 위해 <span style="color: #c3e88d;">아낌없이 피드백</span>합니다.',
          illustrationType: 'review' as const
        },
        {
          label: '성장해요',
          title: '코드를 넘어, 삶의 이야기',
          description: '알고리즘을 넘어 <span style="color: #c3e88d;">개발 문화와 커리어</span>까지,<br/>함께 성장하는 소중한 시간.',
          illustrationType: 'grow' as const
        }
      ],
      theme: 'standard',
      layout: 'horizontal' as const,
      enableAnimation: true,
      animationType: 'fadeIn' as const,
      defaultActiveStep: 0,
      navigationStyle: 'numbers' as const
    }
  }
};

// 템플릿 목록
export const studyTemplates: StudyTemplate[] = [
  algorithmTemplate,
  // 추후 다른 템플릿 추가 가능
];

// 템플릿 가져오기 함수
export function getTemplateById(id: string): StudyTemplate | undefined {
  return studyTemplates.find(template => template.id === id);
}

// 템플릿 이름 목록 가져오기
export function getTemplateOptions(): Array<{ value: string; label: string }> {
  return studyTemplates.map(template => ({
    value: template.id,
    label: template.name
  }));
}
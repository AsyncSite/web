// HowWeRoll Section Types

export interface MeetingOverviewItem {
  icon: string;
  title: string;
  highlight: string;
  description?: string;
  subNote?: string;
  type: string;
  link?: string;
}

export interface ScheduleItem {
  time: string;
  activity: string;
  detail: string;
  value?: string;
  type: 'primary' | 'secondary';
}

export interface HowWeRollData {
  title: string;
  subtitle?: string;
  tagHeader?: string;
  scheduleIntro?: string;
  meetingOverview: MeetingOverviewItem[];
  schedule: ScheduleItem[];
  subHeading?: string;
  closingMessage?: string;
}

// Study type specific templates
export const howWeRollTemplates = {
  algorithm: {
    title: '특별한 건 없어요.<br/>그냥 계속 모일 뿐이에요.',
    subtitle: '꾸준함이 만드는 <span style="color: #c3e88d;">작은 기적</span>들',
    tagHeader: '모임 상세 안내',
    scheduleIntro: '금요일 저녁의 <span style="color: #c3e88d;">2시간</span>은 몰입하기 딱 좋은 시간인 것 같아요.',
    subHeading: '몰입, 해본 적 있으세요?',
    closingMessage: '우리가 함께 만들어가는 <span style="color: #c3e88d;">성장의 여정</span>에 당신도 함께해요.',
    meetingOverview: [
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
  
  design: {
    title: '창의성은 혼자가 아닌<br/><span style="color: #82aaff;">함께 만들어가는 것</span>',
    subtitle: '서로의 시선이 만나는 곳에서 <span style="color: #ffea00;">영감</span>이 태어납니다',
    tagHeader: '모임 진행 방식',
    scheduleIntro: '매주 새로운 <span style="color: #c3e88d;">영감</span>과 피드백을 나누는 시간입니다.',
    subHeading: '디자인, 함께 고민해본 적 있으세요?',
    closingMessage: '당신의 <span style="color: #ffea00;">창의적인 시각</span>이 우리를 더 풍부하게 만들어요.',
    meetingOverview: [
      {
        icon: '🎨',
        title: '정기 모임',
        highlight: '매주 토요일 오후 2:00 ~ 5:00',
        description: '합정 디자인 스튜디오에서 오프라인 위주로 진행해요',
        type: 'main-meeting'
      },
      {
        icon: '🔧',
        title: '활용 툴',
        highlight: 'Figma, Adobe Creative Suite',
        description: '실무에서 사용하는 툴들을 함께 익혀요',
        type: 'study-material'
      },
      {
        icon: '💵',
        title: '참여 비용',
        highlight: '스튜디오 대관료 분담',
        type: 'cost-info'
      }
    ],
    schedule: [
      {
        time: '14:00 ~ 15:00',
        activity: '포트폴리오 리뷰',
        detail: '각자의 작업물을 공유하고 피드백',
        type: 'primary' as const
      },
      {
        time: '15:00 ~ 15:15',
        activity: '네트워킹 타임',
        detail: '자유로운 대화와 영감 공유',
        type: 'secondary' as const
      },
      {
        time: '15:15 ~ 17:00',
        activity: '실습 프로젝트',
        detail: '함께 진행하는 디자인 챌린지',
        type: 'primary' as const
      }
    ]
  },
  
  language: {
    title: '말하고, 듣고,<br/><span style="color: #c3e88d;">함께 성장하는</span> 언어 스터디',
    subtitle: '실전 회화로 만드는 <span style="color: #82aaff;">진짜 실력</span>',
    tagHeader: '학습 방식',
    scheduleIntro: '자연스러운 대화 속에서 <span style="color: #ffea00;">실력이 향상</span>됩니다.',
    subHeading: '진짜 회화, 경험해보셨나요?',
    closingMessage: '함께라면 <span style="color: #82aaff;">언어의 벽</span>도 넘을 수 있어요.',
    meetingOverview: [
      {
        icon: '🗣️',
        title: '정기 모임',
        highlight: '매주 수요일 저녁 7:00 ~ 9:00',
        description: '강남 스터디카페에서 100% 영어로 진행',
        type: 'main-meeting'
      },
      {
        icon: '📖',
        title: '학습 자료',
        highlight: 'TED Talks, News Articles',
        description: '실제 사용되는 살아있는 영어를 학습해요',
        type: 'study-material'
      },
      {
        icon: '☕',
        title: '참여 비용',
        highlight: '카페 이용료 개인 부담',
        type: 'cost-info'
      }
    ],
    schedule: [
      {
        time: '19:00 ~ 19:30',
        activity: '프리토킹',
        detail: '일상 주제로 워밍업',
        type: 'secondary' as const
      },
      {
        time: '19:30 ~ 20:30',
        activity: '토픽 디스커션',
        detail: '준비한 주제로 깊이있는 토론',
        type: 'primary' as const
      },
      {
        time: '20:30 ~ 21:00',
        activity: '피드백 & 정리',
        detail: '서로의 표현을 교정하고 새로운 표현 학습',
        type: 'primary' as const
      }
    ]
  }
};
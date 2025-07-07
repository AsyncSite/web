// src/pages/TecoTecoPage/utils/constants.ts

import { Contributor, Review, FAQItem, StepContent } from './types';

export const tecotecoMembers: Contributor[] = [
  {
    name: 'renechoi',
    githubId: 'renechoi',
    imageUrl: process.env.PUBLIC_URL + '/images/face/rene.png',
    tecotecoContribution: '모임을 처음 시작한 사람 🏆',
    joinDate: '2024-09-01',
  },
  {
    name: 'kdelay',
    githubId: 'kdelay',
    imageUrl: process.env.PUBLIC_URL + '/images/face/kdelay.png',
    tecotecoContribution: '꼼꼼한 코드 리뷰어 📝',
    joinDate: '2024-09-01',
  },
  {
    name: 'KrongDev',
    githubId: 'KrongDev',
    imageUrl: 'https://avatars.githubusercontent.com/u/138358867?s=40&v=4',
    tecotecoContribution: '알고리즘 문제 해결사 💬',
    joinDate: '2024-09-01',
  },
  {
    name: '탁형',
    githubId: '탁형',
    imageUrl: process.env.PUBLIC_URL + '/images/face/xxx.png',
    tecotecoContribution: '복잡한 개념도 쉽게 설명하는 멘토 📚',
    joinDate: '2024-09-01',
  },
  {
    name: '민수',
    githubId: 'minsu',
    imageUrl: process.env.PUBLIC_URL + '/images/face/xxx.png',
    tecotecoContribution: '새로운 알고리즘 트렌드를 가져오는 탐험가 🔍',
    joinDate: '2024-10-15',
  },
  {
    name: '지영',
    githubId: 'jiyoung',
    imageUrl: process.env.PUBLIC_URL + '/images/face/xxx.png',
    tecotecoContribution: '분위기 메이커이자 팀워크의 핵심 🎉',
    joinDate: '2024-11-20',
  },
  {
    name: '현우',
    githubId: 'hyunwoo',
    imageUrl: process.env.PUBLIC_URL + '/images/face/xxx.png',
    tecotecoContribution: '최적화 마법사, 효율성의 달인 ⚡',
    joinDate: '2025-01-20',
  },
  {
    name: "who's next?",
    githubId: 'your-next-profile',
    imageUrl: process.env.PUBLIC_URL + '/images/face/another.png',
    tecotecoContribution: '당신의 합류를 기다려요 👋',
    joinDate: undefined,
  },
];

export const MEMBER_DETAILS = {
  renechoi: {
    memorableProblem: '백준 11053 - 가장 긴 증가하는 부분 수열',
    whatIGained: 'DP의 최적화 방법과 스터디 운영의 노하우를 얻었어요',
    currentFocus: '고급 DP 문제와 팀 빌딩 스킬',
    recentActivity: '1일 전 활동',
    testimonial: '리더십과 알고리즘 실력 모두 뛰어나요!',
    from: 'kdelay',
    role: '스터디 리더',
    streak: 15,
    solvedProblems: 342,
  },
  kdelay: {
    memorableProblem: '백준 1932 - 정수 삼각형',
    whatIGained: 'DP의 진정한 의미를 깨달았고, 코드 리뷰 스킬을 키웠어요',
    currentFocus: '트리 DP와 멘토링 스킬 마스터하기',
    recentActivity: '2일 전 활동',
    testimonial: '꼼꼼한 리뷰로 모두의 실력 향상에 기여해요!',
    from: 'KrongDev',
    role: '코드 리뷰어',
    streak: 12,
    solvedProblems: 298,
  },
  KrongDev: {
    memorableProblem: '프로그래머스 - 네트워크',
    whatIGained: 'DFS/BFS를 완전히 이해하게 됐고, 문제 해결 패턴을 익혔어요',
    currentFocus: '최단경로 알고리즘과 문제 분석 능력',
    recentActivity: '1일 전 활동',
    testimonial: '어려운 문제도 차근차근 해결하는 능력이 대단해요!',
    from: 'renechoi',
    role: '문제 해결사',
    streak: 8,
    solvedProblems: 156,
  },
  탁형: {
    memorableProblem: '백준 9019 - DSLR',
    whatIGained: 'BFS 최적화 방법을 터득했고, 설명하는 능력을 키웠어요',
    currentFocus: '세그먼트 트리와 설명 스킬 도전',
    recentActivity: '3일 전 활동',
    testimonial: '복잡한 개념도 쉽게 설명해주는 천재예요!',
    from: 'kdelay',
    role: '설명왕',
    streak: 6,
    solvedProblems: 89,
  },
  민수: {
    memorableProblem: '백준 2206 - 벽 부수고 이동하기',
    whatIGained: 'BFS와 상태 관리의 핵심을 이해했어요',
    currentFocus: '고급 그래프 알고리즘 탐구',
    recentActivity: '2일 전 활동',
    testimonial: '새로운 접근법으로 모두를 놀라게 해요!',
    from: 'renechoi',
    role: '트렌드 탐험가',
    streak: 9,
    solvedProblems: 124,
  },
  지영: {
    memorableProblem: '프로그래머스 - 카카오톡 채팅방',
    whatIGained: '문자열 처리와 팀워크의 중요성을 배웠어요',
    currentFocus: '문자열 알고리즘과 소통 스킬',
    recentActivity: '1일 전 활동',
    testimonial: '힘든 순간에도 웃음을 잃지 않는 에너지!',
    from: '탁형',
    role: '분위기 메이커',
    streak: 11,
    solvedProblems: 187,
  },
  현우: {
    memorableProblem: '백준 1759 - 암호 만들기',
    whatIGained: '백트래킹과 최적화 기법을 체득했어요',
    currentFocus: '고급 최적화와 성능 분석',
    recentActivity: '1일 전 활동',
    testimonial: '복잡한 문제도 효율적으로 해결하는 마법사!',
    from: 'kdelay',
    role: '최적화 마법사',
    streak: 7,
    solvedProblems: 98,
  },
};

export const tecotecoKeywords: string[] = [
  '😌 편안한 분위기',
  '💥 사고의 확장',
  '🤗 배려왕 멤버',
  '🥳 즐거운 분위기',
  '📝 꼼꼼한 코드 리뷰',
  '👩‍💻 실전 코딩',
  '🧠 논리적 사고력',
  '🗣️ 커뮤니케이션 역량',
  '🤖 AI 활용',
  '🌱 함께 성장',
];

// constants.ts에 추가할 새로운 리뷰들 (기존 tecotecoReviews 배열에 추가)

export const tecotecoReviews: Review[] = [
  {
    name: '익명1',
    attendCount: 3,
    timeAgo: '6달 전',
    title: '인생의 의미',
    content:
      '누가 시킨것도 ..부자가 되는 것도 아닌데 코딩테스트 문제를 풀고 바쁜 일상을 탈탈 털어 진지한 이야기를 나눈 소중한 경험',
    emojis: ['😃', '✨', '🔥'],
    likes: 2,
  },
  {
    name: '익명2',
    attendCount: 10,
    timeAgo: '2년 전',
    title: 'Better together !',
    content:
      '혼자서는 엄두도 못 냈던 어려운 알고리즘 문제들! 테코테코 모임에서 함께 고민하고 해결하며 완독하는 뿌듯함을 느꼈습니다. 함께라면 우린 해낼 수 있어요!',
    emojis: ['🧡', '😍', '😃'],
    likes: 1,
  },
  {
    name: '익명3',
    attendCount: 8,
    timeAgo: '1년 전',
    title: '많은 것들을 배운 시간이었습니다!',
    content:
      '운이 좋게 좋은 문제, 열정적인 멤버, 그리고 많은 것을 배울 수 있는 동료들이 있는 모임에 참여하게 돼서 정말 의미 있는 시간이었습니다. 감사합니다 :)',
    emojis: ['☺️', '👍', '💡'],
    likes: 1,
  },
  {
    name: '익명4',
    attendCount: 15,
    timeAgo: '3개월 전',
    title: '코드 리뷰의 힘',
    content:
      '처음엔 부끄러웠던 코드 리뷰가 이제는 가장 기다려지는 시간이 되었어요. 다른 사람의 코드를 보며 새로운 접근법을 배우고, 제 코드도 더 깔끔해졌습니다.',
    emojis: ['🤓', '💻', '👨‍💻'],
    likes: 4,
  },
  {
    name: '익명5',
    attendCount: 6,
    timeAgo: '2개월 전',
    title: '알고리즘이 재미있어졌어요',
    content:
      '혼자 공부할 때는 막막했던 DP 문제들이 팀원들과 함께 차근차근 분석하니 이해가 되기 시작했어요. 이제 새로운 문제를 만나는 것이 두렵지 않습니다!',
    emojis: ['🎯', '🧩', '💪'],
    likes: 3,
  },
  {
    name: '익명6',
    attendCount: 12,
    timeAgo: '4개월 전',
    title: '네트워킹의 가치',
    content:
      '알고리즘 실력뿐만 아니라 개발자로서 성장할 수 있는 인사이트를 많이 얻었어요. 다양한 백그라운드의 사람들과 이야기하며 시야가 넓어졌습니다.',
    emojis: ['🌟', '🤝', '💬'],
    likes: 5,
  },
  {
    name: '익명7',
    attendCount: 4,
    timeAgo: '1개월 전',
    title: '따뜻한 커뮤니티',
    content:
      '실력에 상관없이 서로를 격려하고 도와주는 분위기가 정말 좋아요. 모르는 걸 부끄러워하지 않고 질문할 수 있는 환경이 만들어져서 빠르게 성장할 수 있었습니다.',
    emojis: ['❤️', '🤗', '🌈'],
    likes: 6,
  },
  {
    name: '익명8',
    attendCount: 9,
    timeAgo: '5개월 전',
    title: '실전 감각 Up!',
    content:
      '매주 정해진 시간에 문제를 풀다 보니 실제 코딩테스트에서도 시간 관리가 훨씬 잘되더라고요. 실전 감각을 기를 수 있어서 정말 도움이 되었습니다.',
    emojis: ['⏰', '🎯', '🚀'],
    likes: 2,
  },
  {
    name: '익명9',
    attendCount: 7,
    timeAgo: '2주 전',
    title: '꾸준함의 힘',
    content:
      '매주 금요일이 기다려져요! 바쁜 일상 속에서도 꾸준히 알고리즘을 접할 수 있게 해주는 모임입니다. 작은 습관이 큰 변화를 만든다는 걸 실감하고 있어요.',
    emojis: ['📅', '💎', '🌱'],
    likes: 3,
  },
  {
    name: '익명10',
    attendCount: 11,
    timeAgo: '3주 전',
    title: '다양한 관점',
    content:
      '같은 문제라도 사람마다 다른 접근 방식을 보는 게 정말 흥미로워요. 제가 생각하지 못했던 창의적인 해결책들을 많이 배울 수 있어서 매번 새로운 자극을 받습니다.',
    emojis: ['🎨', '💡', '🔍'],
    likes: 4,
  },
  {
    name: '익명11',
    attendCount: 13,
    timeAgo: '6주 전',
    title: '성취감이 달라요',
    content:
      '혼자 풀 때와는 완전히 다른 성취감을 느껴요. 팀원들과 함께 어려운 문제를 해결했을 때의 그 기쁨은 말로 표현할 수 없습니다. 진짜 팀워크의 힘을 느꼈어요!',
    emojis: ['🏆', '🎉', '💫'],
    likes: 7,
  },
  {
    name: '익명12',
    attendCount: 5,
    timeAgo: '1주 전',
    title: '부담 없는 학습',
    content:
      '경쟁보다는 함께 성장하는 분위기라서 부담 없이 참여할 수 있어요. 모르는 것도 자연스럽게 물어볼 수 있고, 서로 도우며 배우는 문화가 잘 정착되어 있습니다.',
    emojis: ['😌', '🤲', '📚'],
    likes: 2,
  },
];

export const tecotecoFaqs: FAQItem[] = [
  {
    id: 1,
    question: '테코테코는 어떤 스터디인가요?',
    answer:
      '테코테코는 코딩 테스트 완전 정복을 목표로 하는 알고리즘 스터디입니다. 단순히 문제를 푸는 것을 넘어, 논리적 사고력과 커뮤니케이션 역량 강화를 지향합니다.',
  },
  {
    id: 2,
    question: '모임은 언제, 어디서 진행되나요?',
    answer:
      '매주 금요일 저녁 7:30 ~ 9:30에 강남역 인근 스터디룸에서 오프라인 모임을 중심으로 진행됩니다. 상황에 따라 온라인(Discord)으로 전환될 수 있습니다.',
  },
  {
    id: 3,
    question: '스터디 비용은 어떻게 되나요?',
    answer: '스터디룸 대관료는 참석자끼리 N/1로 정산합니다. 별도의 회비나 멤버십 비용은 없습니다.',
  },
  {
    id: 4,
    question: '참여하려면 어떻게 해야 하나요?',
    answer:
      '현재는 공식 모집은 진행하고 있지 않아요. 관심 있으신 분들은 @renechoi에게 커피챗을 요청해주시면 참여 방법을 안내해 드립니다.',
  },
  {
    id: 5,
    question: '코딩 테스트 실력이 부족해도 참여할 수 있나요?',
    answer:
      '네, 실력에 관계없이 누구나 참여할 수 있습니다. 함께의 가치를 중요하게 생각하며, 서로 돕고 배우며 성장할 수 있는 환경을 지향합니다.',
  },
];

export const tecotecoSteps: StepContent[] = [
  {
    label: '문제를 만나고',
    title: '새로운 도전, 익숙한 문제',
    description:
      '혼자서는 엄두 내지 못했던 문제들. TecoTeco에서는 그 문제들을 피하지 않고, 함께 마주하며 새로운 도전을 시작합니다. 작은 성공들이 쌓여 큰 자신감으로 이어질 거예요.',
    image: process.env.PUBLIC_URL + '/images/step_problem.png',
  },
  {
    label: '질문하고',
    title: '멈추지 않는 호기심, 날카로운 질문',
    description:
      "막히는 지점 앞에서 주저하지 마세요. '이건 왜 이렇게 될까?', '더 좋은 방법은 없을까?' 끊임없이 질문하고 서로에게 배우며 이해의 폭을 넓힙니다. 질문하는 용기가 성장의 첫걸음입니다.",
    image: process.env.PUBLIC_URL + '/images/step_question.png',
  },
  {
    label: '파고들고',
    title: '본질을 꿰뚫는 깊이 있는 탐구',
    description:
      "단순히 정답을 아는 것을 넘어, 문제의 본질과 숨겨진 원리를 집요하게 파고듭니다. 함께 토론하며 '아하!' 하고 깨닫는 순간, 지적 성장의 짜릿함을 경험할 수 있습니다.",
    image: process.env.PUBLIC_URL + '/images/step_explore.png',
  },
  {
    label: '리뷰하고',
    title: '성장을 위한 따뜻한 피드백',
    description:
      '서로의 코드를 읽고, 배우고, 더 나은 코드를 위해 아낌없이 피드백합니다. 나를 돌아보고 동료의 시야를 빌려 나의 코드를 한층 더 성장시키는 소중한 시간입니다.',
    image: process.env.PUBLIC_URL + '/images/step_review.png',
  },
  {
    label: '성장해요',
    title: '코드를 넘어, 삶의 이야기',
    description:
      '알고리즘을 넘어 개발 문화, 커리어 고민, 소소한 일상까지. 코드를 매개로 연결된 소중한 인연들이 함께 성장해요.',
    image: process.env.PUBLIC_URL + '/images/step_talk.png',
  },
];

export const HOW_WE_ROLL_DATA = {
  scheduleIntro: '금요일 저녁의 2시간은 몰입하기 딱 좋은 시간인 것 같아요.',

  meetingOverview: [
    {
      icon: '🏢',
      title: '정기 모임',
      highlight: '매주 금요일 저녁 7:30 ~ 9:30',
      description: '강남역 인근 스터디룸에서 만나 오프라인 중심으로 진행해요',
      subNote: '상황에 따라 온라인(Discord)으로도 진행합니다',
      type: 'main-meeting',
    },
    {
      icon: '📚',
      title: '함께 공부하는 교재',
      highlight: '코딩 테스트 합격자 되기: 자바 편',
      description: '온라인 저지는 백준, 프로그래머스를 활용하고 있어요',
      subNote: '',
      type: 'study-material',
      link: 'https://product.kyobobook.co.kr/detail/S000212576322',
    },
    {
      icon: '💰',
      title: '참여 비용',
      highlight: '스터디룸 대관료 1/N 정산',
      description: '',
      subNote: '',
      type: 'cost-info',
    },
  ],

  schedule: [
    {
      time: '19:30 ~ 20:20',
      activity: '이론/코드 리뷰',
      detail: '선정된 리뷰어의 깊이 있는 주제/문제 발표',
      value: '서로의 통찰을 나누고 새로운 관점을 발견하는 시간',
      type: 'primary',
    },
    {
      time: '20:20 ~ 20:30',
      activity: '잠깐의 휴식 & 자유로운 네트워킹',
      detail: '커피 한 잔과 함께하는 소소한 대화',
      value: '알고리즘을 넘어 진짜 이야기를 나누며 관계를 쌓아가는 시간',
      type: 'secondary',
    },
    {
      time: '20:30 ~ 21:30',
      activity: '함께 문제 풀이',
      detail: '실시간으로 머리를 맞대고 해결하는 문제들',
      value: '혼자라면 포기했을 문제도 함께라면 해낼 수 있다는 경험',
      type: 'primary',
    },
  ],

  closingMessage:
    '단순한 스터디가 아닌, 서로의 성장을 응원하는 따뜻한 커뮤니티입니다. 매주 이 시간이 기다려지는 이유, 함께라면 분명 느끼실 수 있을 거예요.',
};

export const JOURNEY_DATA = {
  startDate: '2024-09-01',
  subtitle: '작은 시작이 모여 의미 있는 변화를 만들어가고 있어요. 각자의 속도로, 함께의 힘으로.',

  seasons: [
    {
      title: '시즌 1 (2024.09 ~ 2024.12)',
      description: '자료구조의 기본기를 다지고, 알고리즘 문제 해결의 첫 발을 내디뎠습니다.',
      icon: '🌱',
      achievements: ['기본 자료구조 마스터', '문제 해결 패턴 습득', '팀워크 기반 다지기'],
    },
    {
      title: '시즌 1.5 (2025.01 ~ 2025.03)',
      description: '기존 학습 내용을 복습하며 문제 풀이 역량을 강화하고, 실전에 대비했습니다.',
      icon: '🔄',
      achievements: ['핵심 개념 복습 완료', '실전 문제 풀이 능력 향상', '코드 리뷰 문화 정착'],
    },
    {
      title: '시즌 2 (2025.04 ~ 진행중)',
      description:
        '심화 알고리즘 주제를 탐구하며, 더 복잡한 문제에 대한 해결 능력을 키워나가고 있습니다.',
      icon: '🚀',
      achievements: ['고급 알고리즘 도전', '문제 해결 깊이 확장', '지속적 성장 중'],
    },
  ],

  currentStats: {
    totalProblems: '300+',
    studyHours: '180+',
    memberGrowth: '개인별 평균 50% 향상',
    teamSpirit: '함께하는 즐거움 100%',
  },

  imagePath: '/images/tecoteco/tecoteco2025-3q4q.png',
  imageAlt: '2025년 3분기 4분기 스케줄',
};

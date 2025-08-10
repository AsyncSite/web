// TecoTeco 스터디 페이지를 UI에서 저장하는 형태로 생성하는 스크립트
// 실제 사용자가 UI 폼을 통해 입력하고 저장했을 때와 동일한 형태로 데이터 구성

const axios = require('axios');

// API Base URL
const API_BASE_URL = 'http://localhost:8080';
const STUDY_ID = '7faa8265-8d60-429e-8acc-079c5ca2d101'; // TecoTeco 스터디 ID

// TecoTeco 페이지 섹션 데이터
const pageData = {
  slug: 'tecoteco',
  theme: 'light',
  sections: []
};

// HERO 섹션
const heroSection = {
  type: 'HERO',
  props: {
    title: '💯 코테 스터디 테코테코',
    subtitle: '변화 속에서 변치 않는 것을 찾다',
    description: '기술 변화 속 흔들리지 않는 개발자 사고의 뿌리를 탐구하고, 단순한 코딩 테스트를 넘어 자료구조와 알고리즘의 본질에 Deep Dive 합니다. 서로의 질문이 해답이 되고, 함께 성장하는 시너지를 경험해요.',
    buttonText: '참가 신청하기',
    buttonLink: '#apply',
    backgroundImage: '/images/tecoteco/hero-background.jpg'
  }
};

// MEMBERS 섹션
const membersSection = {
  type: 'MEMBERS',
  props: {
    title: '더 멋진 여정이 펼쳐질 거예요, 함께라면.',
    members: [
      {
        name: 'renechoi',
        role: '스터디 리더',
        bio: 'DP의 최적화 방법과 스터디 운영의 노하우를 공유합니다',
        image: '/images/face/rene.png'
      },
      {
        name: 'kdelay',
        role: '코드 리뷰어',
        bio: 'DP의 진정한 의미를 깨달았고, 코드 리뷰 스킬을 키웠어요',
        image: '/images/face/kdelay.png'
      },
      {
        name: 'KrongDev',
        role: '문제 해결사',
        bio: 'DFS/BFS를 완전히 이해하게 됐고, 문제 해결 패턴을 익혔어요',
        image: 'https://avatars.githubusercontent.com/u/138358867?s=40&v=4'
      },
      {
        name: '탁형',
        role: '멘토',
        bio: 'BFS 최적화 방법을 터득했고, 설명하는 능력을 키웠어요',
        image: '/images/face/xxx.png'
      },
      {
        name: '민수',
        role: '트렌드 탐험가',
        bio: 'BFS와 상태 관리의 핵심을 이해했어요',
        image: '/images/face/xxx.png'
      },
      {
        name: '지영',
        role: '분위기 메이커',
        bio: '문자열 처리와 팀워크의 중요성을 배웠어요',
        image: '/images/face/xxx.png'
      },
      {
        name: '현우',
        role: '최적화 마법사',
        bio: '백트래킹과 최적화 기법을 체득했어요',
        image: '/images/face/xxx.png'
      }
    ]
  }
};

// SCHEDULE 섹션
const scheduleSection = {
  type: 'SCHEDULE',
  props: {
    title: '매주 금요일 저녁, 우리의 시간',
    schedule: [
      {
        week: '19:30 ~ 20:20',
        topic: '이론/코드 리뷰',
        description: '선정된 리뷰어의 깊이 있는 주제/문제 발표',
        materials: '서로의 통찰을 나누고 새로운 관점을 발견하는 시간'
      },
      {
        week: '20:20 ~ 20:30',
        topic: '잠깐의 휴식',
        description: '커피 한 잔과 함께하는 소소한 대화',
        materials: '알고리즘을 넘어 진짜 이야기를 나누며 관계를 쌓아가는 시간'
      },
      {
        week: '20:30 ~ 21:30',
        topic: '문제 풀이 타임',
        description: '진짜 재미있는 시간! 난이도별 문제를 각자 골라서 풀어요',
        materials: '막히면 언제든 질문하고 서로 도우며 성장하는 시간'
      }
    ]
  }
};

// TIMELINE 섹션
const timelineSection = {
  type: 'TIMELINE',
  props: {
    title: '우리의 여정',
    events: [
      {
        date: '2024-09-01',
        title: '테코테코 시작',
        description: '작은 모임의 시작, 큰 꿈을 품다',
        type: 'milestone'
      },
      {
        date: '2024-10-01',
        title: '첫 번째 마일스톤',
        description: '100문제 돌파! 기초 알고리즘 마스터',
        type: 'milestone'
      },
      {
        date: '2024-11-01',
        title: '중급 레벨 도전',
        description: 'DP와 그래프 이론의 벽을 넘다',
        type: 'event'
      },
      {
        date: '2024-12-01',
        title: '연말 회고',
        description: '3개월의 성장을 돌아보며',
        type: 'event'
      },
      {
        date: '2025-01-01',
        title: '새해 새 목표',
        description: '더 높은 곳을 향해',
        type: 'milestone'
      },
      {
        date: '2025-02-01',
        title: '고급 알고리즘',
        description: '세그먼트 트리, 네트워크 플로우 도전',
        type: 'event'
      },
      {
        date: '2025-03-01',
        title: '봄과 함께',
        description: '새로운 멤버들과 함께하는 시즌 2',
        type: 'milestone'
      }
    ]
  }
};

// REVIEWS 섹션
const reviewsSection = {
  type: 'REVIEWS',
  props: {
    title: '참가자들의 생생한 후기',
    reviews: [
      {
        author: '2기 수료생',
        rating: 5,
        content: '처음엔 어려웠지만, 동료들과 함께하니 재미있어졌어요. 누가 시킨것도 부자가 되는 것도 아닌데 코딩테스트 문제를 풀고 바쁜 일상을 탈탈 털어 진지한 이야기를 나눈 소중한 경험',
        date: '2024-06-01',
        avatar: ''
      },
      {
        author: '1기 수료생',
        rating: 5,
        content: '혼자서는 엄두도 못 냈던 어려운 알고리즘 문제들! 테코테코 모임에서 함께 고민하고 해결하며 완독하는 뿌듯함을 느꼈습니다. 함께라면 우린 해낼 수 있어요!',
        date: '2024-03-01',
        avatar: ''
      },
      {
        author: '현재 참여자',
        rating: 5,
        content: '운이 좋게 좋은 문제, 열정적인 멤버, 그리고 많은 것을 배울 수 있는 동료들이 있는 모임에 참여하게 돼서 정말 의미 있는 시간이었습니다.',
        date: '2024-11-01',
        avatar: ''
      },
      {
        author: '3기 참여자',
        rating: 5,
        content: '처음엔 부끄러웠던 코드 리뷰가 이제는 가장 기다려지는 시간이 되었어요. 다른 사람의 코드를 보며 새로운 접근법을 배우고, 제 코드도 더 깔끔해졌습니다.',
        date: '2024-12-01',
        avatar: ''
      },
      {
        author: '2개월차 참여자',
        rating: 5,
        content: '혼자 공부할 때는 막막했던 DP 문제들이 팀원들과 함께 차근차근 분석하니 이해가 되기 시작했어요. 이제 새로운 문제를 만나는 것이 두렵지 않습니다!',
        date: '2025-01-15',
        avatar: ''
      },
      {
        author: '4개월차 참여자',
        rating: 5,
        content: '알고리즘 실력뿐만 아니라 개발자로서 성장할 수 있는 인사이트를 많이 얻었어요. 다양한 백그라운드의 사람들과 이야기하며 시야가 넓어졌습니다.',
        date: '2024-11-15',
        avatar: ''
      }
    ]
  }
};

// FAQ 섹션
const faqSection = {
  type: 'FAQ',
  props: {
    title: '자주 묻는 질문',
    faqs: [
      {
        question: '테코테코는 어떤 스터디인가요?',
        answer: '테코테코는 코딩 테스트 완전 정복을 목표로 하는 알고리즘 스터디입니다. 단순히 문제를 푸는 것을 넘어, 논리적 사고력과 커뮤니케이션 역량 강화를 지향합니다.',
        category: '스터디 소개'
      },
      {
        question: '모임은 언제, 어디서 진행되나요?',
        answer: '매주 금요일 저녁 7:30 ~ 9:30에 강남역 인근 스터디룸에서 오프라인 모임을 중심으로 진행됩니다. 상황에 따라 온라인(Discord)으로 전환될 수 있습니다.',
        category: '일정'
      },
      {
        question: '스터디 비용은 어떻게 되나요?',
        answer: '스터디룸 대관료는 참석자끼리 N/1로 정산합니다. 별도의 회비나 멤버십 비용은 없습니다.',
        category: '비용'
      },
      {
        question: '참여하려면 어떻게 해야 하나요?',
        answer: '현재는 공식 모집은 진행하고 있지 않아요. 관심 있으신 분들은 @renechoi에게 커피챗을 요청해주시면 참여 방법을 안내해 드립니다.',
        category: '참여 방법'
      },
      {
        question: '코딩 테스트 실력이 부족해도 참여할 수 있나요?',
        answer: '네, 실력에 관계없이 누구나 참여할 수 있습니다. 함께의 가치를 중요하게 생각하며, 서로 돕고 배우며 성장할 수 있는 환경을 지향합니다.',
        category: '참가 자격'
      },
      {
        question: '어떤 언어를 사용하나요?',
        answer: '주로 Java를 사용하지만, Python, JavaScript 등 자신이 편한 언어를 사용해도 됩니다. 중요한 것은 알고리즘과 논리적 사고입니다.',
        category: '학습 방법'
      }
    ]
  }
};

// CTA 섹션
const ctaSection = {
  type: 'CTA',
  props: {
    title: 'TecoTeco, 당신의 합류를 기다려요!',
    subtitle: '매주 금요일, 알고리즘과 함께 성장하는 우리의 시간. 지금 바로 시작하세요.',
    buttonText: '@renechoi에게 커피챗 요청하기 ☕',
    buttonLink: 'mailto:renechoi@example.com',
    backgroundColor: '#C3E88D',
    textColor: '#1a1a1a'
  }
};

// RICH_TEXT 섹션 - 스터디 철학
const richTextSection1 = {
  type: 'RICH_TEXT',
  props: {
    title: '우리가 추구하는 가치',
    content: `<h3>🌱 함께 성장하는 문화</h3>
<p>테코테코는 경쟁보다는 협력을, 정답보다는 과정을 중요시합니다. 서로의 코드를 보며 배우고, 모르는 것을 부끄러워하지 않고 질문할 수 있는 환경을 만들어갑니다.</p>

<h3>💡 깊이 있는 학습</h3>
<p>단순히 문제를 푸는 것에 그치지 않고, 왜 이 알고리즘이 동작하는지, 어떤 상황에서 사용되는지 깊이 있게 탐구합니다. 본질을 이해하면 응용은 자연스럽게 따라옵니다.</p>

<h3>🤝 지속 가능한 관계</h3>
<p>스터디를 넘어 개발자로서 함께 성장할 수 있는 동료를 만듭니다. 알고리즘 학습이 끝나도 계속될 수 있는 네트워크를 구축합니다.</p>

<blockquote>
  <p>"코드는 우리를 연결하는 언어이고, 알고리즘은 함께 풀어가는 퍼즐입니다."</p>
</blockquote>`,
    alignment: 'left',
    backgroundColor: 'transparent'
  }
};

// RICH_TEXT 섹션 - 학습 방법
const richTextSection2 = {
  type: 'RICH_TEXT',
  props: {
    title: '이렇게 공부해요',
    content: `<h3>📚 체계적인 커리큘럼</h3>
<ul>
  <li><strong>1-4주차:</strong> 기초 자료구조 (배열, 연결리스트, 스택, 큐)</li>
  <li><strong>5-8주차:</strong> 탐색 알고리즘 (DFS, BFS, 이분탐색)</li>
  <li><strong>9-12주차:</strong> 동적 계획법과 그리디</li>
  <li><strong>13-16주차:</strong> 그래프 이론 (최단경로, MST)</li>
  <li><strong>17주차~:</strong> 고급 알고리즘과 실전 문제</li>
</ul>

<h3>🎯 효과적인 학습 전략</h3>
<ol>
  <li>매주 주제에 맞는 문제를 5-7개 선정합니다</li>
  <li>각자 문제를 풀고 깃헙에 코드를 공유합니다</li>
  <li>모임에서 서로의 풀이를 리뷰하고 토론합니다</li>
  <li>더 나은 해법을 함께 찾아갑니다</li>
</ol>

<h3>💪 실력 향상 보장</h3>
<p>꾸준히 참여하시면 3개월 안에 확실한 실력 향상을 경험하실 수 있습니다. 많은 수료생들이 원하는 회사의 코딩 테스트를 통과했습니다.</p>`,
    alignment: 'left',
    backgroundColor: 'transparent'
  }
};

// 모든 섹션을 순서대로 추가
pageData.sections = [
  heroSection,
  richTextSection1,
  membersSection,
  scheduleSection,
  richTextSection2,
  timelineSection,
  reviewsSection,
  faqSection,
  ctaSection
];

// API 호출 함수
async function createTecoTecoPage() {
  try {
    console.log('🚀 TecoTeco 페이지 생성 시작...');
    
    // 1. 먼저 페이지 생성
    console.log('📄 페이지 생성 중...');
    const createPageResponse = await axios.post(
      `${API_BASE_URL}/api/studies/${STUDY_ID}/detail-page`,
      { slug: 'tecoteco' }
    );
    console.log('✅ 페이지 생성 완료');

    // 2. 각 섹션을 순서대로 추가
    for (let i = 0; i < pageData.sections.length; i++) {
      const section = pageData.sections[i];
      console.log(`📝 섹션 추가 중... (${i + 1}/${pageData.sections.length}) - ${section.type}`);
      
      try {
        await axios.post(
          `${API_BASE_URL}/api/studies/${STUDY_ID}/detail-page/sections`,
          {
            type: section.type,
            props: section.props
          }
        );
        console.log(`✅ ${section.type} 섹션 추가 완료`);
      } catch (error) {
        console.error(`❌ ${section.type} 섹션 추가 실패:`, error.response?.data || error.message);
      }
      
      // API 부하 방지를 위한 짧은 대기
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // 3. 페이지 발행
    console.log('🎯 페이지 발행 중...');
    await axios.post(
      `${API_BASE_URL}/api/studies/${STUDY_ID}/detail-page/publish`
    );
    console.log('✅ 페이지 발행 완료');

    console.log('\n🎉 TecoTeco 페이지가 성공적으로 생성되었습니다!');
    console.log(`📍 페이지 URL: http://localhost:3000/study/${STUDY_ID}`);
    console.log(`📍 관리 URL: http://localhost:3000/study/${STUDY_ID}/manage`);

  } catch (error) {
    console.error('❌ 오류 발생:', error.response?.data || error.message);
    process.exit(1);
  }
}

// 스크립트 실행
createTecoTecoPage();
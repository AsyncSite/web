// TecoTeco MembersSection을 추가하는 스크립트
// 실제 사용자가 UI에서 입력한 것과 동일한 형태로 API 호출

const axios = require('axios');

// 설정
const API_BASE_URL = 'http://localhost:8080';
const STUDY_ID = 'tecoteco-study-id'; // 실제 스터디 ID로 변경 필요
const AUTH_TOKEN = 'your-auth-token'; // 실제 토큰으로 변경 필요

// MembersSection 데이터 (실제 하드코딩된 멤버 정보)
const membersSectionData = {
  type: 'MEMBERS',
  props: {
    title: '함께하는 사람들',
    subtitle: '더 멋진 여정이 펼쳐질 거예요, 함께라면.',
    theme: 'modern',
    layout: 'carousel',
    studyType: 'algorithm',
    members: [
      {
        name: 'renechoi',
        role: '스터디 리더',
        imageUrl: '/images/face/rene.png',
        joinDate: '2024-09-01',
        tagline: '모임을 처음 시작한 사람 🏆',
        achievement: 'DP의 최적화 방법과 스터디 운영의 노하우를 얻었어요',
        message: '리더십과 알고리즘 실력 모두 뛰어나요!',
        messageFrom: 'kdelay',
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
        joinDate: '2024-09-01',
        tagline: '꼼꼼한 코드 리뷰어 📝',
        achievement: 'DP의 진정한 의미를 깨달았고, 코드 리뷰 스킬을 키웠어요',
        message: '꼼꼼한 리뷰로 모두의 실력 향상에 기여해요!',
        messageFrom: 'KrongDev',
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
        joinDate: '2024-09-01',
        tagline: '알고리즘 문제 해결사 💬',
        achievement: 'DFS/BFS를 완전히 이해하게 됐고, 문제 해결 패턴을 익혔어요',
        message: '어려운 문제도 차근차근 해결하는 능력이 대단해요!',
        messageFrom: 'renechoi',
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
        joinDate: '2024-09-01',
        tagline: '복잡한 개념도 쉽게 설명하는 멘토 📚',
        achievement: 'BFS 최적화 방법을 터득했고, 설명하는 능력을 키웠어요',
        message: '복잡한 개념도 쉽게 설명해주는 천재예요!',
        messageFrom: 'kdelay',
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
        achievement: 'BFS와 상태 관리의 핵심을 이해했어요',
        message: '새로운 접근법으로 모두를 놀라게 해요!',
        messageFrom: 'renechoi',
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
        achievement: '문자열 처리와 팀워크의 중요성을 배웠어요',
        message: '힘든 순간에도 웃음을 잃지 않는 에너지!',
        messageFrom: '탁형',
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
        achievement: '백트래킹과 최적화 기법을 체득했어요',
        message: '복잡한 문제도 효율적으로 해결하는 마법사!',
        messageFrom: 'kdelay',
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
        joinDate: undefined,
        tagline: '당신의 합류를 기다려요 👋',
        achievement: '',
        message: '',
        messageFrom: '',
        customFields: [],
        isActive: false
      }
    ],
    showStats: true,
    stats: {
      totalMembers: 8,
      activeMembers: 6,
      totalHours: 180,
      customStats: [
        { label: '총 해결한 문제', value: '127', icon: '💡' },
        { label: '평균 참여율', value: '85%', icon: '📊' },
        { label: '인기 알고리즘', value: 'DP, 그래프', icon: '🏆' }
      ]
    }
  }
};

// API 호출 함수
async function addMembersSection() {
  try {
    console.log('TecoTeco MembersSection 추가 중...');
    
    const response = await axios.post(
      `${API_BASE_URL}/api/study-pages/${STUDY_ID}/sections`,
      membersSectionData,
      {
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ MembersSection이 성공적으로 추가되었습니다.');
    console.log('섹션 ID:', response.data.id);
    console.log('섹션 순서:', response.data.order);
    console.log('멤버 수:', membersSectionData.props.members.length);
    
    return response.data;
  } catch (error) {
    console.error('❌ MembersSection 추가 실패:', error.message);
    if (error.response) {
      console.error('응답 상태:', error.response.status);
      console.error('응답 데이터:', error.response.data);
    }
    throw error;
  }
}

// 실행 방법 안내
console.log(`
========================================
TecoTeco MembersSection 추가 스크립트
========================================

사용 방법:
1. STUDY_ID를 실제 TecoTeco 스터디 ID로 변경
2. AUTH_TOKEN을 실제 인증 토큰으로 변경
3. 실행: node add-members-section.js

또는 다음 curl 명령어를 직접 사용:
`);

// curl 명령어 생성
const curlCommand = `
curl -X POST http://localhost:8080/api/study-pages/[STUDY_ID]/sections \\
  -H "Authorization: Bearer [YOUR_TOKEN]" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(membersSectionData, null, 2)}'
`;

console.log(curlCommand);

// 환경 변수로 실행 가능하도록
if (process.env.STUDY_ID && process.env.AUTH_TOKEN) {
  const STUDY_ID = process.env.STUDY_ID;
  const AUTH_TOKEN = process.env.AUTH_TOKEN;
  
  addMembersSection()
    .then(() => {
      console.log('✅ 작업 완료');
      process.exit(0);
    })
    .catch(() => {
      console.error('❌ 작업 실패');
      process.exit(1);
    });
} else {
  console.log(`
환경 변수로 실행하려면:
STUDY_ID="your-study-id" AUTH_TOKEN="your-token" node add-members-section.js
`);
}
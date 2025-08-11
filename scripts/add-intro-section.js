// TecoTeco IntroSection을 RICH_TEXT 섹션으로 추가하는 스크립트
// 실제 사용자가 UI에서 입력한 것과 동일한 형태로 API 호출

const axios = require('axios');

// 설정
const API_BASE_URL = 'http://localhost:8080';
const STUDY_ID = 'tecoteco-study-id'; // 실제 스터디 ID로 변경 필요
const AUTH_TOKEN = 'your-auth-token'; // 실제 토큰으로 변경 필요

// IntroSection 데이터 (실제 하드코딩된 내용 그대로)
const introSectionData = {
  type: 'RICH_TEXT',
  props: {
    title: 'TecoTeco 소개',
    content: `
      <h2 style="margin-bottom: 2rem;">변화하는 세상에서<br/>흔들리지 않을 '나'를 위한 스터디</h2>
      
      <p>코딩과 지식의 가치가 흔해지는 시절입니다. AI가 순식간에 코드를 작성하고, 개발 도구들이 날마다 진화하는 지금. 개발자로서 우리가 정말 집중해야 할 것은 무엇일까요?</p>
      
      <p>TecoTeco는 이런 질문에서 출발했습니다. 기술이 아무리 발달해도 <span style="color: rgb(195, 232, 141); font-weight: 600;">변하지 않는 개발자의 핵심 역량</span>이 있다고 믿거든요.</p>
      
      <h3 style="margin-top: 2.5rem; margin-bottom: 1rem; color: rgb(195, 232, 141);">물고기를 잡는 방법을 익히는 것</h3>
      
      <p>우리는 '물고기 그 자체'가 아닌, <span style="color: rgb(130, 170, 255); font-weight: 500;">'물고기를 잡는 방법'</span>에 집중합니다. 단순히 문제를 푸는 것을 넘어서, 문제의 본질을 이해하고 <span style="color: rgb(130, 170, 255); font-weight: 500;">견고한 사고력과 논리력</span>을 단련하는 것이 목표입니다.</p>
      
      <p>매주 함께 모여 한 문제를 깊이 파고들고, 서로 다른 관점으로 접근해보며 사고의 폭을 넓혀갑니다. 왜 이 알고리즘을 선택했는지, 다른 방법은 없었는지, 이 문제에서 배울 수 있는 더 큰 인사이트는 무엇인지 함께 고민해요.</p>
      
      <h3 style="margin-top: 2.5rem; margin-bottom: 1rem; color: rgb(195, 232, 141);">물고기를 '잘' 잡는 방법을 모색하는 것</h3>
      
      <p>AI를 배척하지 않고 <span style="color: rgb(130, 170, 255); font-weight: 500;">현명하게 활용하는 방법</span>을 함께 모색합니다. AI와 페어 코딩하고, 비판적으로 분석하며 코드를 개선합니다. AI가 <span style="color: rgb(130, 170, 255); font-weight: 500;">우리의 통찰력을 확장시키는 강력한 파트너</span>가 될 수 있음을 증명해나가고 있어요.</p>
      
      <p style="margin-top: 3rem; text-align: center; font-size: 1.1rem;">
        우리가 찾는 건 변화 속에서도 <span style="color: rgb(195, 232, 141); font-weight: 600;">흔들리지 않을 '나'</span><br/>
        생각하는 힘이에요.
      </p>
    `,
    alignment: 'left',
    backgroundColor: 'transparent'
  }
};

// API 호출 함수
async function addIntroSection() {
  try {
    console.log('TecoTeco IntroSection 추가 중...');
    
    const response = await axios.post(
      `${API_BASE_URL}/api/study-pages/${STUDY_ID}/sections`,
      introSectionData,
      {
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ IntroSection이 성공적으로 추가되었습니다.');
    console.log('섹션 ID:', response.data.id);
    console.log('섹션 순서:', response.data.order);
    
    return response.data;
  } catch (error) {
    console.error('❌ IntroSection 추가 실패:', error.message);
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
TecoTeco IntroSection 추가 스크립트
========================================

사용 방법:
1. STUDY_ID를 실제 TecoTeco 스터디 ID로 변경
2. AUTH_TOKEN을 실제 인증 토큰으로 변경
3. 실행: node add-intro-section.js

또는 다음 curl 명령어를 직접 사용:
`);

// curl 명령어 생성
const curlCommand = `
curl -X POST http://localhost:8080/api/study-pages/[STUDY_ID]/sections \\
  -H "Authorization: Bearer [YOUR_TOKEN]" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(introSectionData, null, 2)}'
`;

console.log(curlCommand);

// 환경 변수로 실행 가능하도록
if (process.env.STUDY_ID && process.env.AUTH_TOKEN) {
  const STUDY_ID = process.env.STUDY_ID;
  const AUTH_TOKEN = process.env.AUTH_TOKEN;
  
  addIntroSection()
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
STUDY_ID="your-study-id" AUTH_TOKEN="your-token" node add-intro-section.js
`);
}
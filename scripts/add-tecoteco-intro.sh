#!/bin/bash

# TecoTeco IntroSection 추가 스크립트
# 실제 사용자가 UI에서 입력한 것과 동일한 형태로 API 호출

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}TecoTeco IntroSection 추가 스크립트${NC}"
echo -e "${YELLOW}========================================${NC}"

# 1. 로그인하여 토큰 받기
echo -e "\n${GREEN}1. 인증 토큰 획득 중...${NC}"
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"asyncsite@gmail.com","password":"qlehdrl@20250626"}' \
  | jq -r '.data.accessToken')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo -e "${RED}❌ 로그인 실패. 인증 정보를 확인하세요.${NC}"
  exit 1
fi

echo -e "${GREEN}✅ 토큰 획득 성공${NC}"

# 2. 스터디 ID 입력 받기
echo -e "\n${YELLOW}TecoTeco 스터디 ID를 입력하세요:${NC}"
read -p "Study ID: " STUDY_ID

if [ -z "$STUDY_ID" ]; then
  echo -e "${RED}❌ 스터디 ID가 필요합니다.${NC}"
  exit 1
fi

# 3. IntroSection 데이터 생성
echo -e "\n${GREEN}2. IntroSection 데이터 준비 중...${NC}"

# JSON 데이터 (실제 TecoTeco IntroSection 내용)
read -r -d '' INTRO_SECTION_DATA << 'EOF'
{
  "type": "RICH_TEXT",
  "props": {
    "title": "TecoTeco 소개",
    "content": "<h2 style=\"margin-bottom: 2rem;\">변화하는 세상에서<br/>흔들리지 않을 '나'를 위한 스터디</h2><p>코딩과 지식의 가치가 흔해지는 시절입니다. AI가 순식간에 코드를 작성하고, 개발 도구들이 날마다 진화하는 지금. 개발자로서 우리가 정말 집중해야 할 것은 무엇일까요?</p><p>TecoTeco는 이런 질문에서 출발했습니다. 기술이 아무리 발달해도 <span style=\"color: rgb(195, 232, 141); font-weight: 600;\">변하지 않는 개발자의 핵심 역량</span>이 있다고 믿거든요.</p><h3 style=\"margin-top: 2.5rem; margin-bottom: 1rem; color: rgb(195, 232, 141);\">물고기를 잡는 방법을 익히는 것</h3><p>우리는 '물고기 그 자체'가 아닌, <span style=\"color: rgb(130, 170, 255); font-weight: 500;\">'물고기를 잡는 방법'</span>에 집중합니다. 단순히 문제를 푸는 것을 넘어서, 문제의 본질을 이해하고 <span style=\"color: rgb(130, 170, 255); font-weight: 500;\">견고한 사고력과 논리력</span>을 단련하는 것이 목표입니다.</p><p>매주 함께 모여 한 문제를 깊이 파고들고, 서로 다른 관점으로 접근해보며 사고의 폭을 넓혀갑니다. 왜 이 알고리즘을 선택했는지, 다른 방법은 없었는지, 이 문제에서 배울 수 있는 더 큰 인사이트는 무엇인지 함께 고민해요.</p><h3 style=\"margin-top: 2.5rem; margin-bottom: 1rem; color: rgb(195, 232, 141);\">물고기를 '잘' 잡는 방법을 모색하는 것</h3><p>AI를 배척하지 않고 <span style=\"color: rgb(130, 170, 255); font-weight: 500;\">현명하게 활용하는 방법</span>을 함께 모색합니다. AI와 페어 코딩하고, 비판적으로 분석하며 코드를 개선합니다. AI가 <span style=\"color: rgb(130, 170, 255); font-weight: 500;\">우리의 통찰력을 확장시키는 강력한 파트너</span>가 될 수 있음을 증명해나가고 있어요.</p><p style=\"margin-top: 3rem; text-align: center; font-size: 1.1rem;\">우리가 찾는 건 변화 속에서도 <span style=\"color: rgb(195, 232, 141); font-weight: 600;\">흔들리지 않을 '나'</span><br/>생각하는 힘이에요.</p>",
    "alignment": "left",
    "backgroundColor": "transparent"
  }
}
EOF

# 4. API 호출하여 섹션 추가
echo -e "\n${GREEN}3. IntroSection 추가 중...${NC}"

RESPONSE=$(curl -s -X POST "http://localhost:8080/api/study-pages/${STUDY_ID}/sections" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$INTRO_SECTION_DATA")

# 응답 확인
if echo "$RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
  SECTION_ID=$(echo "$RESPONSE" | jq -r '.id')
  SECTION_ORDER=$(echo "$RESPONSE" | jq -r '.order')
  
  echo -e "${GREEN}✅ IntroSection이 성공적으로 추가되었습니다!${NC}"
  echo -e "   섹션 ID: ${YELLOW}$SECTION_ID${NC}"
  echo -e "   섹션 순서: ${YELLOW}$SECTION_ORDER${NC}"
  
  # 페이지 확인 안내
  echo -e "\n${YELLOW}페이지 확인:${NC}"
  echo -e "   관리 페이지: http://localhost:3000/study/${STUDY_ID}/manage"
  echo -e "   실제 페이지: http://localhost:3000/study/tecoteco"
else
  echo -e "${RED}❌ IntroSection 추가 실패${NC}"
  echo -e "응답: $RESPONSE"
  exit 1
fi

echo -e "\n${GREEN}✅ 작업 완료!${NC}"
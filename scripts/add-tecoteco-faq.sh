#!/bin/bash

# TecoTeco FAQ Section 추가 스크립트
# 실제 사용자가 UI에서 입력한 것과 동일한 형태로 API 호출

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}TecoTeco FAQ Section 추가 스크립트${NC}"
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

# 토큰을 파일에 저장 (디버깅용)
echo "$TOKEN" > /tmp/token.txt

# 2. 스터디 목록 조회하여 TecoTeco 스터디 찾기
echo -e "\n${GREEN}2. TecoTeco 스터디 검색 중...${NC}"

# 모든 스터디 목록 조회
STUDIES_RESPONSE=$(curl -s -X GET "http://localhost:8080/api/studies" \
  -H "Authorization: Bearer $TOKEN")

# TecoTeco 스터디 ID 찾기
STUDY_ID=$(echo "$STUDIES_RESPONSE" | jq -r '.data[] | select(.title | contains("테코테코")) | .id' | head -1)

if [ -z "$STUDY_ID" ] || [ "$STUDY_ID" = "null" ]; then
  echo -e "${YELLOW}TecoTeco 스터디를 찾을 수 없습니다. 수동으로 입력하세요:${NC}"
  read -p "Study ID: " STUDY_ID
  
  if [ -z "$STUDY_ID" ]; then
    echo -e "${RED}❌ 스터디 ID가 필요합니다.${NC}"
    exit 1
  fi
else
  echo -e "${GREEN}✅ TecoTeco 스터디 발견: ${YELLOW}$STUDY_ID${NC}"
fi

# 3. FAQ Section 데이터 준비
echo -e "\n${GREEN}3. FAQ Section 데이터 준비 중...${NC}"

# JSON 데이터 (실제 TecoTeco FAQ 내용)
read -r -d '' FAQ_SECTION_DATA << 'EOF'
{
  "type": "FAQ",
  "props": {
    "title": "FAQ",
    "tagHeader": "궁금증 해결",
    "theme": "tecoteco",
    "showIcons": true,
    "showJoinCTA": true,
    "joinTitle": "TecoTeco, 당신의 합류를 기다려요!",
    "joinDescription": "",
    "joinButtonText": "@renechoi에게 커피챗 요청하기 ☕",
    "joinButtonAction": "@renechoi에게 커피챗 요청!",
    "items": [
      {
        "id": 1,
        "question": "테코테코는 어떤 스터디인가요?",
        "answer": "테코테코는 코딩 테스트 완전 정복을 목표로 하는 알고리즘 스터디입니다. 단순히 문제를 푸는 것을 넘어, 논리적 사고력과 커뮤니케이션 역량 강화를 지향합니다."
      },
      {
        "id": 2,
        "question": "모임은 언제, 어디서 진행되나요?",
        "answer": "매주 금요일 저녁 7:30 ~ 9:30에 강남역 인근 스터디룸에서 오프라인 모임을 중심으로 진행됩니다. 상황에 따라 온라인(Discord)으로 전환될 수 있습니다."
      },
      {
        "id": 3,
        "question": "스터디 비용은 어떻게 되나요?",
        "answer": "스터디룸 대관료는 참석자끼리 N/1로 정산합니다. 별도의 회비나 멤버십 비용은 없습니다."
      },
      {
        "id": 4,
        "question": "참여하려면 어떻게 해야 하나요?",
        "answer": "현재는 공식 모집은 진행하고 있지 않아요. 관심 있으신 분들은 @renechoi에게 커피챗을 요청해주시면 참여 방법을 안내해 드립니다."
      },
      {
        "id": 5,
        "question": "코딩 테스트 실력이 부족해도 참여할 수 있나요?",
        "answer": "네, 실력에 관계없이 누구나 참여할 수 있습니다. 함께의 가치를 중요하게 생각하며, 서로 돕고 배우며 성장할 수 있는 환경을 지향합니다."
      }
    ]
  }
}
EOF

# 4. API 호출하여 섹션 추가
echo -e "\n${GREEN}4. FAQ Section 추가 중...${NC}"

RESPONSE=$(curl -s -X POST "http://localhost:8080/api/study-pages/${STUDY_ID}/sections" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$FAQ_SECTION_DATA")

# 응답 확인
if echo "$RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
  SECTION_ID=$(echo "$RESPONSE" | jq -r '.id')
  SECTION_ORDER=$(echo "$RESPONSE" | jq -r '.order')
  
  echo -e "${GREEN}✅ FAQ Section이 성공적으로 추가되었습니다!${NC}"
  echo -e "   섹션 ID: ${YELLOW}$SECTION_ID${NC}"
  echo -e "   섹션 순서: ${YELLOW}$SECTION_ORDER${NC}"
  echo -e "   테마: ${BLUE}TecoTeco${NC}"
  echo -e "   FAQ 개수: ${BLUE}5개${NC}"
  echo -e "   Q/A 아이콘: ${BLUE}표시됨${NC}"
  
  # 페이지 확인 안내
  echo -e "\n${YELLOW}페이지 확인:${NC}"
  echo -e "   관리 페이지: http://localhost:3000/study/${STUDY_ID}/manage"
  echo -e "   실제 페이지: http://localhost:3000/study/tecoteco"
  
  echo -e "\n${BLUE}💡 팁: FAQ 항목을 클릭하면 답변이 펼쳐집니다!${NC}"
  echo -e "${BLUE}   TecoTeco 스타일의 Q/A 아이콘이 표시됩니다.${NC}"
else
  echo -e "${RED}❌ FAQ Section 추가 실패${NC}"
  echo -e "응답: $RESPONSE"
  
  # 에러 코드 확인
  ERROR_CODE=$(echo "$RESPONSE" | jq -r '.error.code' 2>/dev/null)
  ERROR_MSG=$(echo "$RESPONSE" | jq -r '.error.message' 2>/dev/null)
  
  echo -e "${RED}에러 코드: $ERROR_CODE${NC}"
  echo -e "${RED}에러 메시지: $ERROR_MSG${NC}"
  
  exit 1
fi

echo -e "\n${GREEN}✅ 작업 완료!${NC}"
echo -e "${YELLOW}========================================${NC}"
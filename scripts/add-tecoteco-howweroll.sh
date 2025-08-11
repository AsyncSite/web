#!/bin/bash

# TecoTeco HowWeRollSection 추가 스크립트
# 실제 사용자가 UI에서 입력한 것과 동일한 형태로 API 호출

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}TecoTeco HowWeRollSection 추가 스크립트${NC}"
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

# 2. 스터디 목록 조회하여 TecoTeco 스터디 찾기
echo -e "\n${GREEN}2. TecoTeco 스터디 검색 중...${NC}"

# 내가 만든 스터디 목록 조회
STUDIES_RESPONSE=$(curl -s -X GET "http://localhost:8080/api/studies/my-studies" \
  -H "Authorization: Bearer $TOKEN")

# TecoTeco 스터디 ID 찾기
STUDY_ID=$(echo "$STUDIES_RESPONSE" | jq -r '.data.content[] | select(.title | contains("TecoTeco")) | .id' | head -1)

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

# 3. HowWeRollSection 데이터 준비
echo -e "\n${GREEN}3. HowWeRollSection 데이터 준비 중...${NC}"

# JSON 데이터 (실제 TecoTeco HowWeRollSection 내용)
read -r -d '' HOW_WE_ROLL_SECTION_DATA << 'EOF'
{
  "type": "HOW_WE_ROLL",
  "props": {
    "title": "특별한 건 없어요.\n그냥 계속 모일 뿐이에요.",
    "tagHeader": "모임 상세 안내",
    "scheduleIntro": "금요일 저녁의 2시간은 몰입하기 딱 좋은 시간인 것 같아요.",
    "subHeading": "몰입, 해본 적 있으세요?",
    "theme": "tecoteco",
    "meetingOverview": [
      {
        "icon": "🏢",
        "title": "정기 모임",
        "highlight": "매주 금요일 저녁 7:30 ~ 9:30",
        "description": "강남역 인근 스터디룸에서 만나 오프라인 중심으로 진행해요",
        "subNote": "상황에 따라 온라인(Discord)으로도 진행합니다",
        "type": "main-meeting"
      },
      {
        "icon": "📚",
        "title": "함께 공부하는 교재",
        "highlight": "코딩 테스트 합격자 되기: 자바 편",
        "description": "온라인 저지는 백준, 프로그래머스를 활용하고 있어요",
        "type": "study-material",
        "link": "https://product.kyobobook.co.kr/detail/S000212576322"
      },
      {
        "icon": "💰",
        "title": "참여 비용",
        "highlight": "스터디룸 대관료 1/N 정산",
        "type": "cost-info"
      }
    ],
    "schedule": [
      {
        "time": "19:30 ~ 20:20",
        "activity": "이론/코드 리뷰",
        "detail": "선정된 리뷰어의 깊이 있는 주제/문제 발표",
        "type": "primary"
      },
      {
        "time": "20:20 ~ 20:30",
        "activity": "잠깐의 휴식 & 자유로운 네트워킹",
        "detail": "커피 한 잔과 함께하는 소소한 대화",
        "type": "secondary"
      },
      {
        "time": "20:30 ~ 21:30",
        "activity": "함께 문제 풀이",
        "detail": "실시간으로 머리를 맞대고 해결하는 문제들",
        "type": "primary"
      }
    ]
  }
}
EOF

# 4. API 호출하여 섹션 추가
echo -e "\n${GREEN}4. HowWeRollSection 추가 중...${NC}"

RESPONSE=$(curl -s -X POST "http://localhost:8080/api/study-pages/${STUDY_ID}/sections" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$HOW_WE_ROLL_SECTION_DATA")

# 응답 확인
if echo "$RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
  SECTION_ID=$(echo "$RESPONSE" | jq -r '.id')
  SECTION_ORDER=$(echo "$RESPONSE" | jq -r '.order')
  
  echo -e "${GREEN}✅ HowWeRollSection이 성공적으로 추가되었습니다!${NC}"
  echo -e "   섹션 ID: ${YELLOW}$SECTION_ID${NC}"
  echo -e "   섹션 순서: ${YELLOW}$SECTION_ORDER${NC}"
  echo -e "   테마: ${BLUE}TecoTeco${NC}"
  echo -e "   모임 개요: ${BLUE}3개 카드${NC}"
  echo -e "   스케줄: ${BLUE}3개 시간대${NC}"
  
  # 페이지 확인 안내
  echo -e "\n${YELLOW}페이지 확인:${NC}"
  echo -e "   관리 페이지: http://localhost:3000/study/${STUDY_ID}/manage"
  echo -e "   실제 페이지: http://localhost:3000/study/tecoteco"
  
  echo -e "\n${BLUE}💡 팁: 모임 진행 방식이 체계적으로 정리되어 표시됩니다!${NC}"
else
  echo -e "${RED}❌ HowWeRollSection 추가 실패${NC}"
  echo -e "응답: $RESPONSE"
  exit 1
fi

echo -e "\n${GREEN}✅ 작업 완료!${NC}"
echo -e "${YELLOW}========================================${NC}"
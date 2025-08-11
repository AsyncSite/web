#!/bin/bash

# TecoTeco JourneySection 추가 스크립트
# 실제 사용자가 UI에서 입력한 것과 동일한 형태로 API 호출

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}TecoTeco JourneySection 추가 스크립트${NC}"
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

# 3. JourneySection 데이터 준비
echo -e "\n${GREEN}3. JourneySection 데이터 준비 중...${NC}"

# JSON 데이터 (실제 TecoTeco JourneySection 내용)
read -r -d '' JOURNEY_SECTION_DATA << 'EOF'
{
  "type": "JOURNEY",
  "props": {
    "tagHeader": "우리의 여정",
    "title": "하루하루가 쌓이니 벌써 {days}이 되었어요.",
    "subtitle": "작은 시작이 모여 의미 있는 변화를 만들어가고 있어요. 각자의 속도로, 함께의 힘으로.",
    "startDate": "2024-09-01",
    "calculateDays": true,
    "theme": "tecoteco",
    "layout": "list",
    "showAchievements": true,
    "showIcons": true,
    "showStats": false,
    "generations": [
      {
        "title": "시즌 1 (2024.09 ~ 2024.12)",
        "description": "자료구조의 기본기를 다지고, 알고리즘 문제 해결의 첫 발을 내디뎠습니다.",
        "icon": "🌱",
        "achievements": ["기본 자료구조 마스터", "문제 해결 패턴 습득", "팀워크 기반 다지기"],
        "status": "completed"
      },
      {
        "title": "시즌 1.5 (2025.01 ~ 2025.03)",
        "description": "기존 학습 내용을 복습하며 문제 풀이 역량을 강화하고, 실전에 대비했습니다.",
        "icon": "🔄",
        "achievements": ["핵심 개념 복습 완료", "실전 문제 풀이 능력 향상", "코드 리뷰 문화 정착"],
        "status": "completed"
      },
      {
        "title": "시즌 2 (2025.04 ~ 진행중)",
        "description": "심화 알고리즘 주제를 탐구하며, 더 복잡한 문제에 대한 해결 능력을 키워나가고 있습니다.",
        "icon": "🚀",
        "achievements": ["고급 알고리즘 도전", "문제 해결 깊이 확장", "지속적 성장 중"],
        "status": "ongoing"
      }
    ],
    "futureImage": {
      "src": "/images/tecoteco/tecoteco2025-3q4q.png",
      "alt": "2025년 3분기 4분기 스케줄",
      "title": "앞으로의 계획",
      "description": "체계적이고 지속적인 성장을 위한 로드맵"
    }
  }
}
EOF

# 4. API 호출하여 섹션 추가
echo -e "\n${GREEN}4. JourneySection 추가 중...${NC}"

RESPONSE=$(curl -s -X POST "http://localhost:8080/api/study-pages/${STUDY_ID}/sections" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$JOURNEY_SECTION_DATA")

# 응답 확인
if echo "$RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
  SECTION_ID=$(echo "$RESPONSE" | jq -r '.id')
  SECTION_ORDER=$(echo "$RESPONSE" | jq -r '.order')
  
  echo -e "${GREEN}✅ JourneySection이 성공적으로 추가되었습니다!${NC}"
  echo -e "   섹션 ID: ${YELLOW}$SECTION_ID${NC}"
  echo -e "   섹션 순서: ${YELLOW}$SECTION_ORDER${NC}"
  echo -e "   테마: ${BLUE}TecoTeco${NC}"
  echo -e "   세대 수: ${BLUE}3개 시즌${NC}"
  echo -e "   시작일: ${BLUE}2024-09-01${NC}"
  
  # 경과일 계산
  START_DATE="2024-09-01"
  CURRENT_DATE=$(date +%Y-%m-%d)
  DAYS_PASSED=$(( ( $(date -d "$CURRENT_DATE" +%s) - $(date -d "$START_DATE" +%s) ) / 86400 ))
  echo -e "   경과일: ${YELLOW}${DAYS_PASSED}일${NC}"
  
  # 페이지 확인 안내
  echo -e "\n${YELLOW}페이지 확인:${NC}"
  echo -e "   관리 페이지: http://localhost:3000/study/${STUDY_ID}/manage"
  echo -e "   실제 페이지: http://localhost:3000/study/tecoteco"
  
  echo -e "\n${BLUE}💡 팁: 시즌별 성장 과정이 타임라인으로 표시되며, 경과일이 자동으로 계산됩니다!${NC}"
else
  echo -e "${RED}❌ JourneySection 추가 실패${NC}"
  echo -e "응답: $RESPONSE"
  
  # 에러 코드 확인
  ERROR_CODE=$(echo "$RESPONSE" | jq -r '.code' 2>/dev/null)
  ERROR_MSG=$(echo "$RESPONSE" | jq -r '.message' 2>/dev/null)
  
  if [ "$ERROR_CODE" = "SYS-5001" ]; then
    echo -e "${YELLOW}⚠️  백엔드가 JOURNEY 타입을 지원하지 않습니다.${NC}"
    echo -e "${YELLOW}   어댑터를 통해 CUSTOM_HTML로 변환하여 저장해야 합니다.${NC}"
  else
    echo -e "${RED}에러 코드: $ERROR_CODE${NC}"
    echo -e "${RED}에러 메시지: $ERROR_MSG${NC}"
  fi
  
  exit 1
fi

echo -e "\n${GREEN}✅ 작업 완료!${NC}"
echo -e "${YELLOW}========================================${NC}"
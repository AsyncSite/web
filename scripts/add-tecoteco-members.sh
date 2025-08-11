#!/bin/bash

# TecoTeco MembersSection 추가 스크립트
# 실제 사용자가 UI에서 입력한 것과 동일한 형태로 API 호출

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}TecoTeco MembersSection 추가 스크립트${NC}"
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

# 3. MembersSection 데이터 준비
echo -e "\n${GREEN}3. MembersSection 데이터 준비 중...${NC}"

# JSON 데이터 (실제 TecoTeco MembersSection 내용)
read -r -d '' MEMBERS_SECTION_DATA << 'EOF'
{
  "type": "MEMBERS",
  "props": {
    "title": "함께하는 사람들",
    "subtitle": "더 멋진 여정이 펼쳐질 거예요, 함께라면.",
    "theme": "modern",
    "layout": "carousel",
    "studyType": "algorithm",
    "members": [
      {
        "name": "renechoi",
        "role": "스터디 리더",
        "imageUrl": "/images/face/rene.png",
        "joinDate": "2024-09-01",
        "tagline": "모임을 처음 시작한 사람 🏆",
        "achievement": "DP의 최적화 방법과 스터디 운영의 노하우를 얻었어요",
        "message": "리더십과 알고리즘 실력 모두 뛰어나요!",
        "messageFrom": "kdelay",
        "customFields": [
          { "label": "해결한 문제", "value": "342", "icon": "✅" },
          { "label": "연속 참여", "value": "15일", "icon": "🔥" },
          { "label": "주력 분야", "value": "고급 DP", "icon": "📚" }
        ],
        "badges": [
          { "type": "mvp", "label": "이주의 MVP", "icon": "👑" }
        ],
        "isActive": true,
        "lastActivity": "1일 전"
      },
      {
        "name": "kdelay",
        "role": "코드 리뷰어",
        "imageUrl": "/images/face/kdelay.png",
        "joinDate": "2024-09-01",
        "tagline": "꼼꼼한 코드 리뷰어 📝",
        "achievement": "DP의 진정한 의미를 깨달았고, 코드 리뷰 스킬을 키웠어요",
        "message": "꼼꼼한 리뷰로 모두의 실력 향상에 기여해요!",
        "messageFrom": "KrongDev",
        "customFields": [
          { "label": "해결한 문제", "value": "298", "icon": "✅" },
          { "label": "연속 참여", "value": "12일", "icon": "🔥" },
          { "label": "주력 분야", "value": "트리 DP", "icon": "📚" }
        ],
        "badges": [
          { "type": "streak", "label": "개근왕", "icon": "🔥" }
        ],
        "isActive": true,
        "lastActivity": "2일 전"
      },
      {
        "name": "KrongDev",
        "role": "문제 해결사",
        "imageUrl": "https://avatars.githubusercontent.com/u/138358867?s=40&v=4",
        "joinDate": "2024-09-01",
        "tagline": "알고리즘 문제 해결사 💬",
        "achievement": "DFS/BFS를 완전히 이해하게 됐고, 문제 해결 패턴을 익혔어요",
        "message": "어려운 문제도 차근차근 해결하는 능력이 대단해요!",
        "messageFrom": "renechoi",
        "customFields": [
          { "label": "해결한 문제", "value": "156", "icon": "✅" },
          { "label": "연속 참여", "value": "8일", "icon": "🔥" },
          { "label": "주력 분야", "value": "그래프", "icon": "📚" }
        ],
        "isActive": true,
        "lastActivity": "1일 전"
      },
      {
        "name": "탁형",
        "role": "멘토",
        "imageUrl": "/images/face/xxx.png",
        "joinDate": "2024-09-01",
        "tagline": "복잡한 개념도 쉽게 설명하는 멘토 📚",
        "achievement": "BFS 최적화 방법을 터득했고, 설명하는 능력을 키웠어요",
        "message": "복잡한 개념도 쉽게 설명해주는 천재예요!",
        "messageFrom": "kdelay",
        "customFields": [
          { "label": "해결한 문제", "value": "89", "icon": "✅" },
          { "label": "연속 참여", "value": "6일", "icon": "🔥" },
          { "label": "주력 분야", "value": "세그먼트 트리", "icon": "📚" }
        ],
        "badges": [
          { "type": "special", "label": "멘토", "icon": "🌟" }
        ],
        "isActive": false,
        "lastActivity": "3일 전"
      },
      {
        "name": "민수",
        "role": "트렌드 탐험가",
        "imageUrl": "/images/face/xxx.png",
        "joinDate": "2024-10-15",
        "tagline": "새로운 알고리즘 트렌드를 가져오는 탐험가 🔍",
        "achievement": "BFS와 상태 관리의 핵심을 이해했어요",
        "message": "새로운 접근법으로 모두를 놀라게 해요!",
        "messageFrom": "renechoi",
        "customFields": [
          { "label": "해결한 문제", "value": "124", "icon": "✅" },
          { "label": "연속 참여", "value": "9일", "icon": "🔥" },
          { "label": "주력 분야", "value": "고급 그래프", "icon": "📚" }
        ],
        "isActive": true,
        "lastActivity": "2일 전"
      },
      {
        "name": "지영",
        "role": "분위기 메이커",
        "imageUrl": "/images/face/xxx.png",
        "joinDate": "2024-11-20",
        "tagline": "분위기 메이커이자 팀워크의 핵심 🎉",
        "achievement": "문자열 처리와 팀워크의 중요성을 배웠어요",
        "message": "힘든 순간에도 웃음을 잃지 않는 에너지!",
        "messageFrom": "탁형",
        "customFields": [
          { "label": "해결한 문제", "value": "187", "icon": "✅" },
          { "label": "연속 참여", "value": "11일", "icon": "🔥" },
          { "label": "주력 분야", "value": "문자열", "icon": "📚" }
        ],
        "isActive": true,
        "lastActivity": "1일 전"
      },
      {
        "name": "현우",
        "role": "최적화 마법사",
        "imageUrl": "/images/face/xxx.png",
        "joinDate": "2025-01-20",
        "tagline": "최적화 마법사, 효율성의 달인 ⚡",
        "achievement": "백트래킹과 최적화 기법을 체득했어요",
        "message": "복잡한 문제도 효율적으로 해결하는 마법사!",
        "messageFrom": "kdelay",
        "customFields": [
          { "label": "해결한 문제", "value": "98", "icon": "✅" },
          { "label": "연속 참여", "value": "7일", "icon": "🔥" },
          { "label": "주력 분야", "value": "최적화", "icon": "📚" }
        ],
        "isActive": true,
        "lastActivity": "1일 전"
      },
      {
        "name": "who's next?",
        "role": "미래의 멤버",
        "imageUrl": "/images/face/another.png",
        "tagline": "당신의 합류를 기다려요 👋",
        "achievement": "",
        "message": "",
        "messageFrom": "",
        "customFields": [],
        "isActive": false
      }
    ],
    "showStats": true,
    "stats": {
      "totalMembers": 8,
      "activeMembers": 6,
      "totalHours": 180,
      "customStats": [
        { "label": "총 해결한 문제", "value": "1247", "icon": "💡" },
        { "label": "평균 참여율", "value": "85%", "icon": "📊" },
        { "label": "인기 알고리즘", "value": "DP, 그래프", "icon": "🏆" }
      ]
    }
  }
}
EOF

# 4. API 호출하여 섹션 추가
echo -e "\n${GREEN}4. MembersSection 추가 중...${NC}"

RESPONSE=$(curl -s -X POST "http://localhost:8080/api/study-pages/${STUDY_ID}/sections" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$MEMBERS_SECTION_DATA")

# 응답 확인
if echo "$RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
  SECTION_ID=$(echo "$RESPONSE" | jq -r '.id')
  SECTION_ORDER=$(echo "$RESPONSE" | jq -r '.order')
  
  echo -e "${GREEN}✅ MembersSection이 성공적으로 추가되었습니다!${NC}"
  echo -e "   섹션 ID: ${YELLOW}$SECTION_ID${NC}"
  echo -e "   섹션 순서: ${YELLOW}$SECTION_ORDER${NC}"
  echo -e "   멤버 수: ${BLUE}8명${NC}"
  echo -e "   테마: ${BLUE}Modern (TecoTeco 스타일)${NC}"
  echo -e "   레이아웃: ${BLUE}Carousel${NC}"
  
  # 페이지 확인 안내
  echo -e "\n${YELLOW}페이지 확인:${NC}"
  echo -e "   관리 페이지: http://localhost:3000/study/${STUDY_ID}/manage"
  echo -e "   실제 페이지: http://localhost:3000/study/tecoteco"
  
  echo -e "\n${BLUE}💡 팁: 멤버 카드를 클릭하면 상세 정보를 볼 수 있습니다!${NC}"
else
  echo -e "${RED}❌ MembersSection 추가 실패${NC}"
  echo -e "응답: $RESPONSE"
  exit 1
fi

echo -e "\n${GREEN}✅ 작업 완료!${NC}"
echo -e "${YELLOW}========================================${NC}"
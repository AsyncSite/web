#!/bin/bash

# TecoTeco 멤버 섹션 업데이트 스크립트
# 하드코딩 페이지와 완전히 동일한 구조로 생성

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}TecoTeco 멤버 섹션 업데이트 스크립트${NC}"
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

# 2. 스터디 ID 찾기
echo -e "\n${GREEN}2. TecoTeco 스터디 검색 중...${NC}"
STUDY_ID="731f8bce-6b5d-404d-a17e-d6d3df7cfaf0"
echo -e "${GREEN}✅ TecoTeco 스터디 ID: ${YELLOW}$STUDY_ID${NC}"

# 3. 기존 MEMBERS 섹션 찾기
echo -e "\n${GREEN}3. 기존 MEMBERS 섹션 확인 중...${NC}"

# DB에서 직접 확인 (sections는 JSON 컬럼)
MEMBER_SECTION_ID=$(docker exec asyncsite-mysql mysql -uroot -pasyncsite_root_2024! studydb -s -N -e "
  SELECT JSON_UNQUOTE(JSON_EXTRACT(section.value, '$.id'))
  FROM study_detail_pages p,
       JSON_TABLE(p.sections, '$[*]' COLUMNS (
         value JSON PATH '$'
       )) AS section
  WHERE p.slug = 'tecoteco'
    AND JSON_EXTRACT(section.value, '$.type') = 'MEMBERS'
  LIMIT 1;
" 2>&1 | grep -v "Warning" | head -1)

if [ ! -z "$MEMBER_SECTION_ID" ] && [ "$MEMBER_SECTION_ID" != "null" ]; then
  echo -e "${YELLOW}기존 MEMBERS 섹션 발견: $MEMBER_SECTION_ID${NC}"
  echo -e "${YELLOW}기존 섹션을 삭제합니다...${NC}"
  
  # 섹션 삭제 API 호출
  DELETE_RESPONSE=$(curl -s -X DELETE "http://localhost:8080/api/study-pages/${STUDY_ID}/sections/${MEMBER_SECTION_ID}" \
    -H "Authorization: Bearer $TOKEN")
  
  echo -e "${GREEN}✅ 기존 섹션 삭제 완료${NC}"
else
  echo -e "${YELLOW}기존 MEMBERS 섹션이 없습니다.${NC}"
fi

# 4. 새로운 MEMBERS 섹션 데이터 준비
echo -e "\n${GREEN}4. 새로운 MEMBERS 섹션 데이터 준비 중...${NC}"

# 하드코딩 페이지와 완전히 동일한 구조의 JSON 데이터
read -r -d '' MEMBERS_SECTION_DATA << 'EOF'
{
  "type": "MEMBERS",
  "props": {
    "theme": "tecoteco",
    "title": "함께하는 사람들",
    "subtitle": "더 멋진 여정이 펼쳐질 거예요, 함께라면.",
    "layout": "carousel",
    "showStats": true,
    "weeklyMvp": "renechoi",
    "stats": {
      "totalProblems": 1247,
      "totalHours": 180,
      "participationRate": 85,
      "popularAlgorithms": ["DP", "그래프", "이분탐색", "그리디"],
      "customStats": [
        {
          "icon": "💡",
          "label": "총 해결한 문제",
          "value": "1247"
        },
        {
          "icon": "📊",
          "label": "평균 참여율",
          "value": "85%"
        },
        {
          "icon": "🏆",
          "label": "인기 알고리즘",
          "value": "DP, 그래프, 이분탐색, 그리디"
        }
      ]
    },
    "members": [
      {
        "name": "renechoi",
        "role": "스터디 리더",
        "imageUrl": "/images/face/rene.png",
        "isActive": true,
        "joinDate": "2024-09-01",
        "tecotecoContribution": "모임을 처음 시작한 사람 🏆",
        "badges": [
          {
            "icon": "👑",
            "type": "mvp",
            "label": "이주의 MVP"
          }
        ],
        "streak": 15,
        "solvedProblems": 342,
        "memorableProblem": "백준 11053 - 가장 긴 증가하는 부분 수열",
        "whatIGained": "DP의 최적화 방법과 스터디 운영의 노하우를 얻었어요",
        "currentFocus": "고급 DP 문제와 팀 빌딩 스킬",
        "recentActivity": "1일 전 활동",
        "testimonial": "리더십과 알고리즘 실력 모두 뛰어나요!",
        "from": "kdelay",
        "message": "리더십과 알고리즘 실력 모두 뛰어나요!",
        "messageFrom": "kdelay"
      },
      {
        "name": "kdelay",
        "role": "코드 리뷰어",
        "imageUrl": "/images/face/kdelay.png",
        "isActive": true,
        "joinDate": "2024-09-01",
        "tecotecoContribution": "꼼꼼한 코드 리뷰어 📝",
        "badges": [
          {
            "icon": "🔥",
            "type": "streak",
            "label": "개근왕"
          }
        ],
        "streak": 12,
        "solvedProblems": 298,
        "memorableProblem": "백준 1932 - 정수 삼각형",
        "whatIGained": "DP의 진정한 의미를 깨달았고, 코드 리뷰 스킬을 키웠어요",
        "currentFocus": "트리 DP와 멘토링 스킬 마스터하기",
        "recentActivity": "2일 전 활동",
        "testimonial": "꼼꼼한 리뷰로 모두의 실력 향상에 기여해요!",
        "from": "KrongDev",
        "message": "꼼꼼한 리뷰로 모두의 실력 향상에 기여해요!",
        "messageFrom": "KrongDev"
      },
      {
        "name": "KrongDev",
        "role": "문제 해결사",
        "imageUrl": "https://avatars.githubusercontent.com/u/138358867?s=40&v=4",
        "isActive": true,
        "joinDate": "2024-09-01",
        "tecotecoContribution": "알고리즘 문제 해결사 💬",
        "streak": 8,
        "solvedProblems": 156,
        "memorableProblem": "프로그래머스 - 네트워크",
        "whatIGained": "DFS/BFS를 완전히 이해하게 됐고, 문제 해결 패턴을 익혔어요",
        "currentFocus": "최단경로 알고리즘과 문제 분석 능력",
        "recentActivity": "1일 전 활동",
        "testimonial": "어려운 문제도 차근차근 해결하는 능력이 대단해요!",
        "from": "renechoi",
        "message": "어려운 문제도 차근차근 해결하는 능력이 대단해요!",
        "messageFrom": "renechoi"
      },
      {
        "name": "탁형",
        "role": "멘토",
        "imageUrl": "/images/face/xxx.png",
        "isActive": false,
        "joinDate": "2024-09-01",
        "tecotecoContribution": "복잡한 개념도 쉽게 설명하는 멘토 📚",
        "badges": [
          {
            "icon": "🌟",
            "type": "special",
            "label": "멘토"
          }
        ],
        "streak": 6,
        "solvedProblems": 89,
        "memorableProblem": "백준 9019 - DSLR",
        "whatIGained": "BFS 최적화 방법을 터득했고, 설명하는 능력을 키웠어요",
        "currentFocus": "세그먼트 트리와 설명 스킬 도전",
        "recentActivity": "3일 전 활동",
        "testimonial": "복잡한 개념도 쉽게 설명해주는 천재예요!",
        "from": "kdelay",
        "message": "복잡한 개념도 쉽게 설명해주는 천재예요!",
        "messageFrom": "kdelay"
      },
      {
        "name": "민수",
        "role": "트렌드 탐험가",
        "imageUrl": "/images/face/xxx.png",
        "isActive": true,
        "joinDate": "2024-10-15",
        "tecotecoContribution": "새로운 알고리즘 트렌드를 가져오는 탐험가 🔍",
        "streak": 9,
        "solvedProblems": 124,
        "memorableProblem": "백준 2206 - 벽 부수고 이동하기",
        "whatIGained": "BFS와 상태 관리의 핵심을 이해했어요",
        "currentFocus": "고급 그래프 알고리즘 탐구",
        "recentActivity": "2일 전 활동",
        "testimonial": "새로운 접근법으로 모두를 놀라게 해요!",
        "from": "renechoi",
        "message": "새로운 접근법으로 모두를 놀라게 해요!",
        "messageFrom": "renechoi"
      },
      {
        "name": "지영",
        "role": "분위기 메이커",
        "imageUrl": "/images/face/xxx.png",
        "isActive": true,
        "joinDate": "2024-11-20",
        "tecotecoContribution": "분위기 메이커이자 팀워크의 핵심 🎉",
        "streak": 11,
        "solvedProblems": 187,
        "memorableProblem": "프로그래머스 - 카카오톡 채팅방",
        "whatIGained": "문자열 처리와 팀워크의 중요성을 배웠어요",
        "currentFocus": "문자열 알고리즘과 소통 스킬",
        "recentActivity": "1일 전 활동",
        "testimonial": "힘든 순간에도 웃음을 잃지 않는 에너지!",
        "from": "탁형",
        "message": "힘든 순간에도 웃음을 잃지 않는 에너지!",
        "messageFrom": "탁형"
      },
      {
        "name": "현우",
        "role": "최적화 마법사",
        "imageUrl": "/images/face/xxx.png",
        "isActive": true,
        "joinDate": "2025-01-20",
        "tecotecoContribution": "최적화 마법사, 효율성의 달인 ⚡",
        "streak": 7,
        "solvedProblems": 98,
        "memorableProblem": "백준 1759 - 암호 만들기",
        "whatIGained": "백트래킹과 최적화 기법을 체득했어요",
        "currentFocus": "고급 최적화와 성능 분석",
        "recentActivity": "1일 전 활동",
        "testimonial": "복잡한 문제도 효율적으로 해결하는 마법사!",
        "from": "kdelay",
        "message": "복잡한 문제도 효율적으로 해결하는 마법사!",
        "messageFrom": "kdelay"
      },
      {
        "name": "who's next?",
        "role": "미래의 멤버",
        "imageUrl": "/images/face/another.png",
        "isActive": false,
        "tecotecoContribution": "당신의 합류를 기다려요 👋",
        "streak": 0,
        "solvedProblems": 0,
        "memorableProblem": "",
        "whatIGained": "",
        "currentFocus": "",
        "recentActivity": "",
        "testimonial": "",
        "from": "",
        "message": "",
        "messageFrom": ""
      }
    ]
  }
}
EOF

# 5. API 호출하여 섹션 추가
echo -e "\n${GREEN}5. 새로운 MEMBERS 섹션 추가 중...${NC}"

RESPONSE=$(curl -s -X POST "http://localhost:8080/api/study-pages/${STUDY_ID}/sections" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$MEMBERS_SECTION_DATA")

# 응답 확인
if echo "$RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
  SECTION_ID=$(echo "$RESPONSE" | jq -r '.id')
  SECTION_ORDER=$(echo "$RESPONSE" | jq -r '.order')
  
  echo -e "${GREEN}✅ MEMBERS 섹션이 성공적으로 추가되었습니다!${NC}"
  echo -e "   섹션 ID: ${YELLOW}$SECTION_ID${NC}"
  echo -e "   섹션 순서: ${YELLOW}$SECTION_ORDER${NC}"
  echo -e "   테마: ${BLUE}TecoTeco${NC}"
  echo -e "   멤버 수: ${BLUE}8명${NC}"
  echo -e "   주간 MVP: ${BLUE}renechoi${NC}"
  
  # 페이지 확인 안내
  echo -e "\n${YELLOW}페이지 확인:${NC}"
  echo -e "   관리 페이지: http://localhost:3000/study/${STUDY_ID}/manage"
  echo -e "   실제 페이지: http://localhost:3000/study/tecoteco"
  
  echo -e "\n${BLUE}💡 팁: 멤버 카드를 호버하면 상세 정보가 표시됩니다!${NC}"
  echo -e "${BLUE}   MVP 배지가 renechoi에게 표시됩니다.${NC}"
else
  echo -e "${RED}❌ MEMBERS 섹션 추가 실패${NC}"
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
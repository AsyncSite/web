#!/bin/bash

# TecoTeco Review Section 추가 스크립트
# 하드코딩된 TecoTeco 페이지의 리뷰 데이터를 API로 전송
# 실제 사용자가 리뷰를 작성한 것처럼 시뮬레이션

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}TecoTeco Review Section 추가 스크립트${NC}"
echo -e "${YELLOW}========================================${NC}"

# 1. 로그인하여 토큰 받기 (3명의 리뷰어 계정 필요)
echo -e "\n${GREEN}1. 리뷰어 계정 준비 중...${NC}"

# 리뷰어 계정 정보 (실제 환경에서는 미리 생성된 계정 사용)
declare -a REVIEWERS=(
  "reviewer1@asyncsite.com|TestPass123@|익명1"
  "reviewer2@asyncsite.com|TestPass123@|익명2"  
  "reviewer3@asyncsite.com|TestPass123@|김코딩"
)

# 2. 스터디 ID 찾기 (admin 계정으로)
echo -e "\n${GREEN}2. TecoTeco 스터디 검색 중...${NC}"

ADMIN_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"asyncsite@gmail.com","password":"qlehdrl@20250626"}' \
  | jq -r '.data.accessToken')

if [ -z "$ADMIN_TOKEN" ] || [ "$ADMIN_TOKEN" = "null" ]; then
  echo -e "${RED}❌ 관리자 로그인 실패. 인증 정보를 확인하세요.${NC}"
  exit 1
fi

# 모든 스터디 목록 조회
STUDIES_RESPONSE=$(curl -s -X GET "http://localhost:8080/api/studies" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

# TecoTeco 스터디 ID 찾기 (slug가 backend-deep-dive인 스터디)
STUDY_ID=$(echo "$STUDIES_RESPONSE" | jq -r '.data[] | select(.slug == "backend-deep-dive") | .id' | head -1)

# 대체 방법: 제목으로 찾기
if [ -z "$STUDY_ID" ] || [ "$STUDY_ID" = "null" ]; then
  STUDY_ID=$(echo "$STUDIES_RESPONSE" | jq -r '.data[] | select(.title | contains("테코테코") or contains("TecoTeco") or contains("백엔드")) | .id' | head -1)
fi

# 하드코딩된 ID 사용 (위 방법이 실패한 경우)
if [ -z "$STUDY_ID" ] || [ "$STUDY_ID" = "null" ]; then
  echo -e "${YELLOW}스터디를 자동으로 찾을 수 없어 알려진 ID 사용: 731f8bce-6b5d-404d-a17e-d6d3df7cfaf0${NC}"
  STUDY_ID="731f8bce-6b5d-404d-a17e-d6d3df7cfaf0"
fi

echo -e "${GREEN}✅ 스터디 ID: $STUDY_ID${NC}"

# 3. 각 리뷰어 계정으로 리뷰 생성
echo -e "\n${GREEN}3. 리뷰 데이터 추가 중...${NC}"

# 리뷰 1: 익명1 - "인생의 의미"
echo -e "\n${BLUE}리뷰 1/3: 익명1 - 인생의 의미${NC}"

REVIEW1_DATA=$(cat <<'EOF'
{
  "type": "PARTICIPATORY",
  "title": "인생의 의미",
  "content": "누가 시킨것도 ..부자가 되는 것도 아닌데 코딩테스트 문제를 풀고 바쁜 일상을 탈탈 털어 진지한 이야기를 나눈 소중한 경험",
  "rating": 5,
  "tags": [
    {
      "id": "growth",
      "emoji": "😃",
      "label": "성장",
      "category": "GROWTH",
      "description": ""
    },
    {
      "id": "spark",
      "emoji": "✨",
      "label": "영감",
      "category": "GROWTH",
      "description": ""
    },
    {
      "id": "passion",
      "emoji": "🔥",
      "label": "열정",
      "category": "MENTORING",
      "description": ""
    }
  ]
}
EOF
)

# 첫 번째 리뷰어로 로그인 시도 (계정이 없으면 관리자 토큰으로 대체)
REVIEWER1_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"reviewer1@asyncsite.com","password":"TestPass123@"}' \
  | jq -r '.data.accessToken')

if [ -z "$REVIEWER1_TOKEN" ] || [ "$REVIEWER1_TOKEN" = "null" ]; then
  echo -e "${YELLOW}리뷰어1 계정이 없어 관리자 토큰 사용${NC}"
  REVIEWER1_TOKEN=$ADMIN_TOKEN
fi

RESPONSE1=$(curl -s -X POST "http://localhost:8080/api/reviews/studies/$STUDY_ID" \
  -H "Authorization: Bearer $REVIEWER1_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$REVIEW1_DATA")

if echo "$RESPONSE1" | jq -e '.success == true' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ 리뷰 1 추가 성공${NC}"
else
  echo -e "${YELLOW}⚠️  리뷰 1 추가 실패 또는 이미 존재${NC}"
  echo "$RESPONSE1" | jq '.'
fi

# 리뷰 2: 익명2 - "Better together !"
echo -e "\n${BLUE}리뷰 2/3: 익명2 - Better together !${NC}"

REVIEW2_DATA=$(cat <<'EOF'
{
  "type": "PARTICIPATORY",
  "title": "Better together !",
  "content": "혼자서는 엄두도 못 냈던 어려운 알고리즘 문제들! 테코테코 모임에서 함께 고민하고 해결하며 완독하는 뿌듯함을 느꼈습니다. 함께라면 우린 해낼 수 있어요!",
  "rating": 5,
  "tags": [
    {
      "id": "teamwork",
      "emoji": "🧡",
      "label": "팀워크",
      "category": "COMMUNITY",
      "description": ""
    },
    {
      "id": "love",
      "emoji": "😍",
      "label": "사랑",
      "category": "ATMOSPHERE",
      "description": ""
    },
    {
      "id": "happy",
      "emoji": "😃",
      "label": "행복",
      "category": "ATMOSPHERE",
      "description": ""
    }
  ]
}
EOF
)

REVIEWER2_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"reviewer2@asyncsite.com","password":"TestPass123@"}' \
  | jq -r '.data.accessToken')

if [ -z "$REVIEWER2_TOKEN" ] || [ "$REVIEWER2_TOKEN" = "null" ]; then
  echo -e "${YELLOW}리뷰어2 계정이 없어 관리자 토큰 사용${NC}"
  REVIEWER2_TOKEN=$ADMIN_TOKEN
fi

# 잠시 대기 (API 부하 방지)
sleep 1

RESPONSE2=$(curl -s -X POST "http://localhost:8080/api/reviews/studies/$STUDY_ID" \
  -H "Authorization: Bearer $REVIEWER2_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$REVIEW2_DATA")

if echo "$RESPONSE2" | jq -e '.success == true' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ 리뷰 2 추가 성공${NC}"
else
  echo -e "${YELLOW}⚠️  리뷰 2 추가 실패 또는 이미 존재${NC}"
  echo "$RESPONSE2" | jq '.'
fi

# 리뷰 3: 김코딩 - "알고리즘 실력이 확실히 늘었어요"
echo -e "\n${BLUE}리뷰 3/3: 김코딩 - 알고리즘 실력이 확실히 늘었어요${NC}"

REVIEW3_DATA=$(cat <<'EOF'
{
  "type": "PARTICIPATORY",
  "title": "알고리즘 실력이 확실히 늘었어요",
  "content": "DP, 그래프, BFS/DFS... 막막하기만 했던 알고리즘들이 이제는 패턴이 보이기 시작해요. 매주 금요일이 기다려지는 스터디입니다!",
  "rating": 5,
  "tags": [
    {
      "id": "skill",
      "emoji": "💪",
      "label": "실력향상",
      "category": "GROWTH",
      "description": ""
    },
    {
      "id": "pattern",
      "emoji": "🎯",
      "label": "패턴인식",
      "category": "LEARNING",
      "description": ""
    },
    {
      "id": "excited",
      "emoji": "🎉",
      "label": "기대감",
      "category": "ATMOSPHERE",
      "description": ""
    }
  ]
}
EOF
)

REVIEWER3_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"reviewer3@asyncsite.com","password":"TestPass123@"}' \
  | jq -r '.data.accessToken')

if [ -z "$REVIEWER3_TOKEN" ] || [ "$REVIEWER3_TOKEN" = "null" ]; then
  echo -e "${YELLOW}리뷰어3 계정이 없어 관리자 토큰 사용${NC}"
  REVIEWER3_TOKEN=$ADMIN_TOKEN
fi

# 잠시 대기 (API 부하 방지)
sleep 1

RESPONSE3=$(curl -s -X POST "http://localhost:8080/api/reviews/studies/$STUDY_ID" \
  -H "Authorization: Bearer $REVIEWER3_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$REVIEW3_DATA")

if echo "$RESPONSE3" | jq -e '.success == true' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ 리뷰 3 추가 성공${NC}"
else
  echo -e "${YELLOW}⚠️  리뷰 3 추가 실패 또는 이미 존재${NC}"
  echo "$RESPONSE3" | jq '.'
fi

# 4. 리뷰 섹션 설정 업데이트
echo -e "\n${GREEN}4. 리뷰 섹션 설정 업데이트 중...${NC}"

REVIEW_SECTION_CONFIG=$(cat <<'EOF'
{
  "type": "REVIEWS",
  "enabled": true,
  "props": {
    "tagHeader": "솔직한 후기",
    "title": "가장 진솔한 이야기, <br /> TecoTeco 멤버들의 목소리 🗣️",
    "subtitle": "숫자와 코드만으로는 설명할 수 없는 <span class=\"highlight\">우리 모임의 진짜 가치</span>를 들어보세요.",
    "showStats": false,
    "displayCount": 3,
    "sortBy": "latest",
    "showKeywords": true
  }
}
EOF
)

# Study Page API로 리뷰 섹션 설정 업데이트 (관리자 토큰 사용)
UPDATE_RESPONSE=$(curl -s -X PUT "http://localhost:8080/api/study-pages/$STUDY_ID/sections/reviews" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$REVIEW_SECTION_CONFIG")

if echo "$UPDATE_RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ 리뷰 섹션 설정 업데이트 성공${NC}"
else
  echo -e "${YELLOW}⚠️  리뷰 섹션 설정 업데이트 실패 (섹션 API가 아직 구현되지 않았을 수 있음)${NC}"
  echo "$UPDATE_RESPONSE" | jq '.'
fi

# 5. 결과 확인
echo -e "\n${GREEN}5. 추가된 리뷰 확인 중...${NC}"

REVIEWS_RESPONSE=$(curl -s -X GET "http://localhost:8080/api/reviews/studies/$STUDY_ID")

REVIEW_COUNT=$(echo "$REVIEWS_RESPONSE" | jq '.data.content | length')

echo -e "${GREEN}✅ 현재 총 ${REVIEW_COUNT}개의 리뷰가 등록되어 있습니다.${NC}"

# 최근 3개 리뷰 표시
echo -e "\n${BLUE}최근 리뷰 3개:${NC}"
echo "$REVIEWS_RESPONSE" | jq '.data.content[:3] | .[] | {title: .title, rating: .rating, author: .reviewerName}'

echo -e "\n${YELLOW}========================================${NC}"
echo -e "${GREEN}✅ TecoTeco 리뷰 데이터 추가 완료!${NC}"
echo -e "${YELLOW}========================================${NC}"

echo -e "\n${BLUE}💡 팁:${NC}"
echo -e "- 실제 리뷰어 계정이 없으면 관리자 계정으로 대체됩니다"
echo -e "- 중복 리뷰는 자동으로 방지됩니다"
echo -e "- http://localhost:3000/study/backend-deep-dive 에서 확인하세요"

# 실행 권한 설정 안내
echo -e "\n${YELLOW}📌 실행 방법:${NC}"
echo -e "chmod +x add-tecoteco-reviews.sh"
echo -e "./add-tecoteco-reviews.sh"
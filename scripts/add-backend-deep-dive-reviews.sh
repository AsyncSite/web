#!/bin/bash

# Backend Deep Dive 스터디 Review 추가 스크립트
# TecoTeco 하드코딩 페이지의 리뷰 데이터를 backend-deep-dive 스터디에 추가
# http://localhost:3000/study/backend-deep-dive/manage 에서 확인 가능

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Backend Deep Dive 스터디 Review 추가${NC}"
echo -e "${YELLOW}========================================${NC}"

# 1. 로그인하여 토큰 받기
echo -e "\n${GREEN}1. 관리자 로그인 중...${NC}"

ADMIN_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"asyncsite@gmail.com","password":"qlehdrl@20250626"}' \
  | jq -r '.data.accessToken')

if [ -z "$ADMIN_TOKEN" ] || [ "$ADMIN_TOKEN" = "null" ]; then
  echo -e "${RED}❌ 관리자 로그인 실패. 인증 정보를 확인하세요.${NC}"
  exit 1
fi

echo -e "${GREEN}✅ 토큰 획득 성공${NC}"

# 2. Backend Deep Dive 스터디 ID 찾기
echo -e "\n${GREEN}2. Backend Deep Dive 스터디 검색 중...${NC}"

# 모든 스터디 목록 조회
STUDIES_RESPONSE=$(curl -s -X GET "http://localhost:8080/api/studies" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

# backend-deep-dive slug로 스터디 찾기
STUDY_ID=$(echo "$STUDIES_RESPONSE" | jq -r '.data[] | select(.slug == "backend-deep-dive") | .id' | head -1)

if [ -z "$STUDY_ID" ] || [ "$STUDY_ID" = "null" ]; then
  echo -e "${YELLOW}slug로 찾을 수 없어 제목으로 검색 중...${NC}"
  STUDY_ID=$(echo "$STUDIES_RESPONSE" | jq -r '.data[] | select(.title | contains("백엔드") or contains("Backend") or contains("Deep Dive")) | .id' | head -1)
fi

if [ -z "$STUDY_ID" ] || [ "$STUDY_ID" = "null" ]; then
  echo -e "${RED}❌ Backend Deep Dive 스터디를 찾을 수 없습니다.${NC}"
  echo -e "${YELLOW}수동으로 스터디 ID를 입력하세요:${NC}"
  read -p "Study ID: " STUDY_ID
  
  if [ -z "$STUDY_ID" ]; then
    echo -e "${RED}❌ 스터디 ID가 필요합니다.${NC}"
    exit 1
  fi
fi

echo -e "${GREEN}✅ Backend Deep Dive 스터디 ID: $STUDY_ID${NC}"

# 3. 리뷰 추가 (관리자 계정으로 모든 리뷰 추가)
echo -e "\n${GREEN}3. TecoTeco 리뷰 데이터를 Backend Deep Dive에 추가 중...${NC}"

# 리뷰 1: 익명1 - "인생의 의미"
echo -e "\n${BLUE}리뷰 1/3: 익명1 - 인생의 의미${NC}"

REVIEW1_DATA=$(cat <<'EOF'
{
  "type": "STUDY_EXPERIENCE",
  "title": "인생의 의미",
  "content": "누가 시킨것도 ..부자가 되는 것도 아닌데 코딩테스트 문제를 풀고 바쁜 일상을 탈탈 털어 진지한 이야기를 나눈 소중한 경험",
  "rating": 5,
  "tags": ["😃 성장", "✨ 영감", "🔥 열정"]
}
EOF
)

RESPONSE1=$(curl -s -X POST "http://localhost:8080/api/reviews/studies/$STUDY_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$REVIEW1_DATA")

if echo "$RESPONSE1" | jq -e '.success == true' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ 리뷰 1 추가 성공${NC}"
else
  echo -e "${YELLOW}⚠️  리뷰 1 추가 실패 또는 이미 존재${NC}"
  echo "$RESPONSE1" | jq '.'
fi

# 잠시 대기 (API 부하 방지)
sleep 1

# 리뷰 2: 익명2 - "Better together !"
echo -e "\n${BLUE}리뷰 2/3: 익명2 - Better together !${NC}"

REVIEW2_DATA=$(cat <<'EOF'
{
  "type": "STUDY_EXPERIENCE",
  "title": "Better together !",
  "content": "혼자서는 엄두도 못 냈던 어려운 알고리즘 문제들! 테코테코 모임에서 함께 고민하고 해결하며 완독하는 뿌듯함을 느꼈습니다. 함께라면 우린 해낼 수 있어요!",
  "rating": 5,
  "tags": ["🧡 팀워크", "😍 사랑", "😃 행복"]
}
EOF
)

RESPONSE2=$(curl -s -X POST "http://localhost:8080/api/reviews/studies/$STUDY_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$REVIEW2_DATA")

if echo "$RESPONSE2" | jq -e '.success == true' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ 리뷰 2 추가 성공${NC}"
else
  echo -e "${YELLOW}⚠️  리뷰 2 추가 실패 또는 이미 존재${NC}"
  echo "$RESPONSE2" | jq '.'
fi

# 잠시 대기 (API 부하 방지)
sleep 1

# 리뷰 3: 김코딩 - "알고리즘 실력이 확실히 늘었어요"
echo -e "\n${BLUE}리뷰 3/3: 김코딩 - 알고리즘 실력이 확실히 늘었어요${NC}"

REVIEW3_DATA=$(cat <<'EOF'
{
  "type": "STUDY_EXPERIENCE",
  "title": "알고리즘 실력이 확실히 늘었어요",
  "content": "DP, 그래프, BFS/DFS... 막막하기만 했던 알고리즘들이 이제는 패턴이 보이기 시작해요. 매주 금요일이 기다려지는 스터디입니다!",
  "rating": 5,
  "tags": ["💪 실력향상", "🎯 패턴인식", "🎉 기대감"]
}
EOF
)

RESPONSE3=$(curl -s -X POST "http://localhost:8080/api/reviews/studies/$STUDY_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$REVIEW3_DATA")

if echo "$RESPONSE3" | jq -e '.success == true' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ 리뷰 3 추가 성공${NC}"
else
  echo -e "${YELLOW}⚠️  리뷰 3 추가 실패 또는 이미 존재${NC}"
  echo "$RESPONSE3" | jq '.'
fi

# 4. 리뷰 섹션 설정 업데이트 (Study Page 섹션 업데이트)
echo -e "\n${GREEN}4. 리뷰 섹션 설정 업데이트 중...${NC}"

# ReviewSection props 구조로 변경
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

# 먼저 기존 섹션 데이터 조회
echo -e "${BLUE}기존 섹션 데이터 확인 중...${NC}"
PAGE_RESPONSE=$(curl -s -X GET "http://localhost:8080/api/study-pages/$STUDY_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

# 섹션 업데이트 API 호출 (PUT 또는 PATCH)
UPDATE_RESPONSE=$(curl -s -X PUT "http://localhost:8080/api/study-pages/$STUDY_ID/sections" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "[${REVIEW_SECTION_CONFIG}]")

if echo "$UPDATE_RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ 리뷰 섹션 설정 업데이트 성공${NC}"
else
  echo -e "${YELLOW}⚠️  리뷰 섹션 설정 업데이트는 수동으로 진행해야 합니다${NC}"
  echo -e "${BLUE}http://localhost:3000/study/backend-deep-dive/manage 에서 설정 가능${NC}"
fi

# 5. 결과 확인
echo -e "\n${GREEN}5. 추가된 리뷰 확인 중...${NC}"

REVIEWS_RESPONSE=$(curl -s -X GET "http://localhost:8080/api/reviews/studies/$STUDY_ID")

REVIEW_COUNT=$(echo "$REVIEWS_RESPONSE" | jq '.data.content | length')

echo -e "${GREEN}✅ 현재 총 ${REVIEW_COUNT}개의 리뷰가 등록되어 있습니다.${NC}"

# 최근 3개 리뷰 표시
echo -e "\n${BLUE}최근 리뷰 3개:${NC}"
echo "$REVIEWS_RESPONSE" | jq '.data.content[:3] | .[] | {title: .title, rating: .rating, author: .authorName}'

echo -e "\n${YELLOW}========================================${NC}"
echo -e "${GREEN}✅ Backend Deep Dive 리뷰 데이터 추가 완료!${NC}"
echo -e "${YELLOW}========================================${NC}"

echo -e "\n${BLUE}💡 확인 방법:${NC}"
echo -e "1. http://localhost:3000/study/backend-deep-dive 에서 리뷰 확인"
echo -e "2. http://localhost:3000/study/backend-deep-dive/manage 에서 관리"
echo -e "3. 리뷰 섹션 설정에서 '예시 데이터 불러오기' 클릭 시 동일한 UI 설정 적용"

echo -e "\n${YELLOW}📌 참고:${NC}"
echo -e "- 모든 리뷰는 관리자 계정으로 생성됩니다"
echo -e "- authorName 필드로 실제 작성자명이 표시됩니다"
echo -e "- attendanceCount로 참석 횟수가 표시됩니다"
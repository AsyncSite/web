#!/bin/bash

# Backend Deep Dive 스터디 완전한 리뷰 추가 스크립트
# 가입 신청 API를 통해 멤버 추가 후 리뷰 작성

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Backend Deep Dive 리뷰 추가 (가입 신청 방식)${NC}"
echo -e "${YELLOW}========================================${NC}"

# Study ID
STUDY_ID="6f8dabd6-8e3f-4f6b-b017-f4a5acacb47e"

# 1. 각 사용자로 로그인하여 스터디 가입 신청
echo -e "\n${GREEN}1. 사용자별 스터디 가입 신청 중...${NC}"

# reviewer2@asyncsite.com 가입 신청
echo -e "\n${BLUE}reviewer2@asyncsite.com 로그인 및 가입 신청${NC}"
USER2_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"reviewer2@asyncsite.com","password":"TestPass123@"}' \
  | jq -r '.data.accessToken')

if [ -z "$USER2_TOKEN" ] || [ "$USER2_TOKEN" = "null" ]; then
  echo -e "${RED}❌ reviewer2 로그인 실패${NC}"
else
  echo -e "${GREEN}✅ reviewer2 로그인 성공${NC}"
  
  # 가입 신청
  JOIN_RESPONSE=$(curl -s -X POST "http://localhost:8080/api/studies/$STUDY_ID/join" \
    -H "Authorization: Bearer $USER2_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"message":"리뷰 작성을 위한 가입 신청"}')
  
  if echo "$JOIN_RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ reviewer2 가입 신청 성공${NC}"
  else
    echo -e "${YELLOW}⚠️  reviewer2 가입 신청 실패 또는 이미 멤버${NC}"
    echo "$JOIN_RESPONSE" | jq '.'
  fi
fi

sleep 1

# reviewer3@asyncsite.com 가입 신청
echo -e "\n${BLUE}reviewer3@asyncsite.com 로그인 및 가입 신청${NC}"
USER3_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"reviewer3@asyncsite.com","password":"TestPass123@"}' \
  | jq -r '.data.accessToken')

if [ -z "$USER3_TOKEN" ] || [ "$USER3_TOKEN" = "null" ]; then
  echo -e "${RED}❌ reviewer3 로그인 실패${NC}"
else
  echo -e "${GREEN}✅ reviewer3 로그인 성공${NC}"
  
  # 가입 신청
  JOIN_RESPONSE=$(curl -s -X POST "http://localhost:8080/api/studies/$STUDY_ID/join" \
    -H "Authorization: Bearer $USER3_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"message":"리뷰 작성을 위한 가입 신청"}')
  
  if echo "$JOIN_RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ reviewer3 가입 신청 성공${NC}"
  else
    echo -e "${YELLOW}⚠️  reviewer3 가입 신청 실패 또는 이미 멤버${NC}"
    echo "$JOIN_RESPONSE" | jq '.'
  fi
fi

sleep 1

# 2. 관리자로 가입 신청 승인
echo -e "\n${GREEN}2. 관리자로 가입 신청 승인 중...${NC}"

ADMIN_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"asyncsite@gmail.com","password":"qlehdrl@20250626"}' \
  | jq -r '.data.accessToken')

if [ -z "$ADMIN_TOKEN" ] || [ "$ADMIN_TOKEN" = "null" ]; then
  echo -e "${RED}❌ 관리자 로그인 실패${NC}"
  exit 1
fi

# 가입 신청 목록 조회
echo -e "${BLUE}가입 신청 목록 조회 중...${NC}"
APPLICATIONS=$(curl -s -X GET "http://localhost:8080/api/studies/$STUDY_ID/applications" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

# reviewer2 승인
REVIEWER2_APP_ID=$(echo "$APPLICATIONS" | jq -r '.data[] | select(.email == "reviewer2@asyncsite.com") | .id' | head -1)
if [ ! -z "$REVIEWER2_APP_ID" ] && [ "$REVIEWER2_APP_ID" != "null" ]; then
  APPROVE_RESPONSE=$(curl -s -X PUT "http://localhost:8080/api/studies/$STUDY_ID/applications/$REVIEWER2_APP_ID/approve" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
  
  if echo "$APPROVE_RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ reviewer2 가입 승인 완료${NC}"
  else
    echo -e "${YELLOW}⚠️  reviewer2 가입 승인 실패${NC}"
  fi
fi

# reviewer3 승인
REVIEWER3_APP_ID=$(echo "$APPLICATIONS" | jq -r '.data[] | select(.email == "reviewer3@asyncsite.com") | .id' | head -1)
if [ ! -z "$REVIEWER3_APP_ID" ] && [ "$REVIEWER3_APP_ID" != "null" ]; then
  APPROVE_RESPONSE=$(curl -s -X PUT "http://localhost:8080/api/studies/$STUDY_ID/applications/$REVIEWER3_APP_ID/approve" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
  
  if echo "$APPROVE_RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ reviewer3 가입 승인 완료${NC}"
  else
    echo -e "${YELLOW}⚠️  reviewer3 가입 승인 실패${NC}"
  fi
fi

sleep 2

# 3. 각 사용자로 리뷰 작성
echo -e "\n${GREEN}3. 각 사용자로 리뷰 작성 중...${NC}"

# reviewer2 리뷰 작성
echo -e "\n${BLUE}리뷰 작성: reviewer2 - Better together !${NC}"

# 다시 로그인 (토큰 갱신)
USER2_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"reviewer2@asyncsite.com","password":"TestPass123@"}' \
  | jq -r '.data.accessToken')

if [ ! -z "$USER2_TOKEN" ] && [ "$USER2_TOKEN" != "null" ]; then
  REVIEW2_RESPONSE=$(curl -s -X POST "http://localhost:8080/api/reviews/studies/$STUDY_ID" \
    -H "Authorization: Bearer $USER2_TOKEN" \
    -H "Content-Type: application/json; charset=UTF-8" \
    -d @- <<'JSON'
{
  "type": "STUDY_EXPERIENCE",
  "title": "Better together !",
  "content": "혼자서는 엄두도 못 냈던 어려운 알고리즘 문제들을 테코테코 모임에서 함께 고민하고 해결하며 완독하는 뿌듯함을 느꼈습니다. 함께라면 우린 해낼 수 있어요",
  "rating": 5,
  "tags": ["🧡 팀워크", "😍 사랑", "😃 행복"]
}
JSON
  )
  
  if echo "$REVIEW2_RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 리뷰 2 추가 성공${NC}"
  else
    echo -e "${YELLOW}⚠️  리뷰 2 추가 실패${NC}"
    echo "$REVIEW2_RESPONSE" | jq '.'
  fi
fi

sleep 1

# reviewer3 리뷰 작성
echo -e "\n${BLUE}리뷰 작성: reviewer3 - 알고리즘 실력이 확실히 늘었어요${NC}"

# 다시 로그인 (토큰 갱신)
USER3_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"reviewer3@asyncsite.com","password":"TestPass123@"}' \
  | jq -r '.data.accessToken')

if [ ! -z "$USER3_TOKEN" ] && [ "$USER3_TOKEN" != "null" ]; then
  REVIEW3_RESPONSE=$(curl -s -X POST "http://localhost:8080/api/reviews/studies/$STUDY_ID" \
    -H "Authorization: Bearer $USER3_TOKEN" \
    -H "Content-Type: application/json; charset=UTF-8" \
    -d @- <<'JSON'
{
  "type": "STUDY_EXPERIENCE",
  "title": "알고리즘 실력이 확실히 늘었어요",
  "content": "DP, 그래프, BFS/DFS 등 막막하기만 했던 알고리즘들이 이제는 패턴이 보이기 시작해요. 매주 금요일이 기다려지는 스터디입니다",
  "rating": 5,
  "tags": ["💪 실력향상", "🎯 패턴인식", "🎉 기대감"]
}
JSON
  )
  
  if echo "$REVIEW3_RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 리뷰 3 추가 성공${NC}"
  else
    echo -e "${YELLOW}⚠️  리뷰 3 추가 실패${NC}"
    echo "$REVIEW3_RESPONSE" | jq '.'
  fi
fi

# 4. 최종 결과 확인
echo -e "\n${GREEN}4. 최종 리뷰 목록 확인...${NC}"

REVIEWS_RESPONSE=$(curl -s -X GET "http://localhost:8080/api/reviews/studies/$STUDY_ID")
REVIEW_COUNT=$(echo "$REVIEWS_RESPONSE" | jq '.data.content | length')

echo -e "${GREEN}✅ 현재 총 ${REVIEW_COUNT}개의 리뷰가 등록되어 있습니다.${NC}"

# 모든 리뷰 표시
echo -e "\n${BLUE}등록된 리뷰 목록:${NC}"
echo "$REVIEWS_RESPONSE" | jq '.data.content[] | {
  title: .title, 
  author: .authorName, 
  rating: .rating,
  tags: .tags
}'

echo -e "\n${YELLOW}========================================${NC}"
echo -e "${GREEN}✅ 리뷰 추가 완료!${NC}"
echo -e "${YELLOW}========================================${NC}"

echo -e "\n${BLUE}💡 다음 단계:${NC}"
echo -e "1. http://localhost:3000/study/backend-deep-dive 에서 리뷰 확인"
echo -e "2. http://localhost:3000/study/backend-deep-dive/manage 에서"
echo -e "   '예시 데이터 불러오기' 클릭하여 UI 설정 적용"
